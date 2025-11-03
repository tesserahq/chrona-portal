/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import BackfillDialog from '@/components/misc/Dialog/DigestGeneratorBackfill'
import DigestGeneratorDraft from '@/components/misc/Dialog/DigestGeneratorDraft'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigestGenerator } from '@/types/digest'
import { handleFetcherData } from '@/utils/fetcher.data'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import cronstrue from 'cronstrue'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CalendarDays,
  DatabaseBackup,
  EllipsisVertical,
  Pencil,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DigestGeneratorDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const fetcher = useFetcher()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [config, setConfig] = useState<IDigestGenerator | null>(null)
  const [configDelete, setConfigDelete] = useState<IDigestGenerator>()
  const [configBackfill, setConfigBackfill] = useState<IDigestGenerator>()
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const backfillRef = useRef<React.ElementRef<typeof BackfillDialog>>(null)
  const draftRef = useRef<React.ElementRef<typeof DigestGeneratorDraft>>(null)

  const fetchConfig = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/digest-generation-configs/${params.id}`
      const response: IDigestGenerator = await fetchApi(url, token!, nodeEnv)
      setConfig(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && token) {
      fetchConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, token])

  useEffect(() => {
    if (actionData?.status === 'success') {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      backfillRef?.current?.onClose()
      // refresh data
      fetchConfig()
    }

    if (actionData?.status === 'error') {
      // show success message
      toast.error(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      backfillRef?.current?.onClose()
    }
  }, [actionData])

  useEffect(() => {
    if (fetcher.data) {
      handleFetcherData(fetcher.data, (response) => {
        if (response.form_type === 'draft') {
          draftRef.current?.onClose()
        }
      })
    }
  }, [fetcher.data])

  if (isLoading) return <AppPreloader />

  if (!config) {
    return (
      <div className="h-full animate-slide-up">
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${params.project_id}/digest-generator`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Digest Generators
          </Button>
        </div>
      </div>
    )
  }

  const hasLabels = config.labels && Object.keys(config.labels).length > 0
  const hasTags = config.tags && config.tags.length > 0
  const hasFilterLabels =
    config.filter_labels && Object.keys(config.filter_labels).length > 0
  const hasFilterTags = config.filter_tags && config.filter_tags.length > 0

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ background: config.ui_format?.color || '#6b7280' }}></div>
              <h1 className="text-balance text-2xl font-bold text-foreground">
                {config.title}
              </h1>
            </div>

            {/* Hamburger Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost">
                  <EllipsisVertical />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="bottom" className="w-44 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    const url = `/projects/${params.project_id}/digest-generator/${config.id}/edit`
                    navigate(url)
                  }}>
                  <Pencil />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => draftRef.current?.onOpen()}>
                  <Save />
                  Draft
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    backfillRef.current?.onOpen()
                    setConfigBackfill(config)
                  }}>
                  <DatabaseBackup />
                  <span>Backfill</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    deleteRef.current?.onOpen()
                    setConfigDelete(config)
                  }}>
                  <Trash2 />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">Created {format(config.created_at, 'PPpp')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">Updated {format(config.updated_at, 'PPpp')}</span>
            </div>
          </div>

          {/* Tags */}
          {hasTags && (
            <div className="flex flex-wrap items-center gap-1">
              {config.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  <span className="font-normal">{tag}</span>
                </Badge>
              ))}
            </div>
          )}

          {/* Labels */}
          {hasLabels && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(config.labels).map(([key, value]) => (
                <Badge key={key} variant="secondary">
                  <span className="font-normal">
                    {key}: {String(value)}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Timezone</div>
              <div className="text-sm text-foreground">{config.timezone || '-'}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Generate Empty Digest</div>
              <div className="text-sm text-foreground">
                {config.generate_empty_digest ? 'Yes' : 'No'}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Cron</div>
              <div className="text-sm text-foreground">
                {cronstrue.toString(config.cron_expression)}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-muted-foreground">Filter Tags</div>
              {hasFilterTags && (
                <div className="flex flex-wrap items-center gap-1">
                  {config.filter_tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <span className="font-normal">{tag}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs text-muted-foreground">Filter Labels</div>
              {hasFilterLabels &&
                Object.entries(config.filter_labels).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    <span className="font-normal">
                      {key}: {String(value)}
                    </span>
                  </Badge>
                ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1 text-xs text-muted-foreground">System Prompt</div>
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap text-pretty leading-relaxed">
                {config.system_prompt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModalDelete
        ref={deleteRef}
        title="Digest Generator"
        description={`This will remove "${configDelete?.title}" from your waiting lists. This action cannot be undone.`}
        data={{
          project_id: params.project_id,
          id: configDelete?.id,
          token: token!,
        }}
      />

      <BackfillDialog
        ref={backfillRef}
        data={{
          project_id: params.project_id,
          id: configBackfill?.id,
          token: token!,
          title: configBackfill?.title || '', // just for title not send into API
        }}
      />

      <DigestGeneratorDraft
        ref={draftRef}
        digestGenerator={config as IDigestGenerator}
        fetcher={fetcher}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { project_id, token, id, form_type, days, force, from_last_digest, from, to } =
    Object.fromEntries(formData)

  try {
    if (request.method === 'POST') {
      if (form_type === 'draft') {
        const url = `${apiUrl}/digest-generation-configs/${id}/draft`

        const dateFilter = () => {
          const formatDateToUTC = (dateStr: string, isEndOfDay: boolean) => {
            // Parse the date string - handles both ISO strings and Date.toString() format
            const date = new Date(dateStr)

            // Extract the calendar date from the Date object
            // Use getFullYear/getMonth/getDate to get the local calendar date
            // which represents what the user selected, then format as UTC
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')

            if (isEndOfDay) {
              return `${year}-${month}-${day}T23:59:59Z`
            }
            return `${year}-${month}-${day}T00:00:00Z`
          }

          return {
            from: from ? formatDateToUTC(from as string, false) : undefined,
            to: to ? formatDateToUTC(to as string, true) : undefined,
          }
        }

        const settings = {
          settings:
            from_last_digest === 'true'
              ? {
                  from_last_digest: true,
                }
              : {
                  from_last_digest: false,
                  date_filter: dateFilter(),
                },
        }

        await fetchApi(url, token as string, nodeEnv, {
          method: 'POST',
          body: JSON.stringify(settings),
        })

        return Response.json(
          {
            toast: {
              type: 'success',
              title: 'Success',
              description: 'Successfully drafted digest generator',
            },
            response: { form_type },
          },
          { status: 200 },
        )
      }

      if (form_type === 'backfill') {
        const url = `${apiUrl}/digest-generation-configs/${id}/backfill`
        const payload = {
          days: Number(days),
          force: force === 'on',
        }

        await fetchApi(url, token as string, nodeEnv, {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        return { status: 'success', message: `Digest generator backfilled successfully` }
      }
    }

    if (request.method === 'DELETE') {
      const url = `${apiUrl}/digest-generation-configs/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return redirectWithToast(`/projects/${project_id}/digest-generator`, {
        type: 'success',
        title: 'Error',
        description: 'Digest generator deleted successfully',
      })
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return {
      status: 'error',
      message: `${convertError.status} - ${convertError.error}`,
    }
  }
}
