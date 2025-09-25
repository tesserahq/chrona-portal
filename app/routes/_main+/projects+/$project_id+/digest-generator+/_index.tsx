/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import DatePreview from '@/components/misc/DatePreview'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import EmptyContent from '@/components/misc/EmptyContent'
import { TagsPreview } from '@/components/misc/TagsPreview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigestGenerator } from '@/types/digest'
import { IPaging } from '@/types/pagination'
import { ensureCanonicalPagination } from '@/utils/pagination.server'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisVertical, EyeIcon, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import cronstrue from 'cronstrue'

export function loader({ request }: LoaderFunctionArgs) {
  // This keeps pagination canonicalization consistent across routes.
  const canonical = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  // to redirect early if not canonical (ie: ?page=0 or ?size=9999)
  if (canonical instanceof Response) return canonical

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, size: canonical.size, page: canonical.page }
}

export default function DigestGeneratorsPage() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [digestConfigs, setDigestConfigs] = useState<IPaging<IDigestGenerator>>()
  const [configDelete, setConfigDelete] = useState<IDigestGenerator>()
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const fetchDigestConfigs = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/projects/${params.project_id}/digest-generation-configs`
      const response: IPaging<IDigestGenerator> = await fetchApi(url, token!, nodeEnv, {
        pagination: { size, page },
      })

      setDigestConfigs(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDigestConfigs()
    }
  }, [token])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // refresh data
      fetchDigestConfigs()
    }
  }, [actionData])

  const columns: ColumnDef<IDigestGenerator>[] = [
    {
      accessorKey: 'id',
      header: '',
      size: 5,
      cell: ({ row }) => {
        const entry = row.original

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="right" className="w-44 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() =>
                  navigate(`/projects/${params.project_id}/digest-generator/${entry.id}`)
                }>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  const url = `/projects/${params.project_id}/digest-generator/${entry.id}/edit`
                  navigate(url)
                }}>
                <Pencil />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setConfigDelete(entry)
                }}>
                <Trash2 />
                <span>Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      size: 80,
      cell: ({ row }) => {
        const config = row.original
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: config.ui_format.color }}></div>
            <div className="max-w-[200px]">
              <Link
                to={`/projects/${params.project_id}/digest-generator/${config.id}`}
                className="button-link">
                <p className="truncate">{config.title}</p>
              </Link>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'timezone',
      header: 'Timezone',
      size: 10,
    },
    {
      accessorKey: 'cron_expression',
      header: 'Cron',
      size: 150,
      cell: ({ row }) => {
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <span className="block max-w-28 cursor-pointer truncate text-muted-foreground">
                  {cronstrue.toString(row.original.cron_expression)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-lg">
                {cronstrue.toString(row.original.cron_expression)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'generate_empty_digest',
      header: 'Empty Digest',
      size: 150,
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">
            {row.original.generate_empty_digest ? 'true' : 'false'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || []

        return <TagsPreview tags={tags} />
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 100,
      cell: ({ row }) => {
        const { created_at } = row.original
        const entryUtcDate = created_at + 'Z'

        return <DatePreview label="Created At" date={entryUtcDate} />
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      size: 100,
      cell: ({ row }) => {
        const { updated_at } = row.original
        const entryUtcDate = updated_at + 'Z'

        return <DatePreview label="Updated At" date={entryUtcDate} />
      },
    },
  ]

  if (isLoading) return <AppPreloader />

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Digest Generators</h1>
        <Button onClick={() => navigate('new')}>New Digest Generator</Button>
      </div>

      {digestConfigs?.items.length === 0 ? (
        <EmptyContent
          image="/images/empty-digest.png"
          title="No digest generators found"
          description="This project doesn't have any digest generators yet. Create your first digest generator to start generating automated summaries.">
          <Button onClick={() => navigate('new')} variant="black">
            Create Digest Generator
          </Button>
        </EmptyContent>
      ) : (
        <DataTable
          columns={columns}
          data={digestConfigs?.items || []}
          meta={{
            page: digestConfigs?.page || 1,
            pages: digestConfigs?.pages || 1,
            size: digestConfigs?.size || 25,
            total: digestConfigs?.total || 0,
          }}
        />
      )}

      <ModalDelete
        ref={deleteRef}
        alert="Digest Generator"
        title={`Remove "${configDelete?.title}" from digest generators`}
        data={{
          project_id: params.project_id,
          id: configDelete?.id,
          token: token!,
        }}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { project_id, token, id } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      const url = `${apiUrl}/digest-generation-configs/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Digest generator deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/digest-generator`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
