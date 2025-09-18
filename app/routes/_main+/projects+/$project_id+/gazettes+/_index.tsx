/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import EmptyContent from '@/components/misc/EmptyContent'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import ShareDialog from '@/components/misc/Dialog/ShareDialog'
import { LabelTooltip } from '@/components/misc/LabelTooltip'
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
import { IGazette } from '@/types/gazette'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { format, formatDistance } from 'date-fns'
import { Edit, EllipsisVertical, EyeIcon, Share2, Tag, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirectWithToast } from '@/utils/toast.server'
import { toast } from 'sonner'
import { IPaging } from '@/types/pagination'
import { ensureCanonicalPagination } from '@/utils/pagination.server'

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

export default function ProjectGazettesPage() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gazettes, setGazettes] = useState<IPaging<IGazette>>()
  const [gazetteDelete, setGazetteDelete] = useState<IGazette>()
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const shareRef = useRef<React.ElementRef<typeof ShareDialog>>(null)

  const fetchGazettes = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/projects/${params.project_id}/gazettes`
      const response: IPaging<IGazette> = await fetchApi(url, token!, nodeEnv, {
        pagination: { page, size },
      })

      setGazettes(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchGazettes()
    }
  }, [token, size, page])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // reload gazettes
      fetchGazettes()
    }
  }, [actionData])

  const columns: ColumnDef<IGazette>[] = [
    {
      accessorKey: 'id',
      header: '',
      size: 5,
      cell: ({ row }) => {
        const gazette = row.original

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
                  navigate(`/projects/${params.project_id}/gazettes/${gazette.id}`)
                }>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  navigate(`/projects/${params.project_id}/gazettes/${gazette.id}/edit`)
                }}>
                <Edit />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  shareRef.current?.onOpen(gazette)
                }}>
                <Share2 />
                <span>Share</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setGazetteDelete(gazette)
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const gazette = row.original
        return (
          <div className="max-w-[200px]">
            <Link
              to={`/projects/${params.project_id}/gazettes/${gazette.id}`}
              className="font-medium text-foreground hover:text-primary hover:underline">
              <p className="truncate font-medium">{gazette.name}</p>
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: 'header',
      header: 'Header',
      cell: ({ row }) => {
        const gazette = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="max-w-[300px]">
              <p className="truncate font-semibold">{gazette.header}</p>
              <p className="truncate text-xs text-muted-foreground">
                {gazette.subheader}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'theme',
      header: 'Theme',
      cell: ({ row }) => {
        const theme = row.original.theme
        return (
          <div className="max-w-[150px]">
            <Badge variant="outline" className="text-xs">
              {theme}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || []
        const firstTag = tags[0]
        const remaining = tags.slice(1)

        return (
          <div className="flex flex-wrap items-center gap-1">
            {firstTag && (
              <Badge key={firstTag} variant="secondary" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                {firstTag}
              </Badge>
            )}

            {remaining.length > 0 && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="cursor-pointer text-xs">
                      +{remaining.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="px-3 py-2" side="bottom">
                    <h1 className="mb-2 font-medium">Tags</h1>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {remaining.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'labels',
      header: 'Labels',
      size: 150,
      cell: ({ row }) => {
        const isValidLabels: boolean =
          row.original.labels !== null && Object.keys(row.original.labels).length > 0

        return (
          isValidLabels && <LabelTooltip labels={Object.entries(row.original.labels)} />
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 130,
      cell: ({ row }) => {
        const gazette = row.original
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(gazette.created_at), new Date(), {
                    includeSeconds: true,
                  })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span>Created At {format(gazette.created_at, 'PPpp')}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      size: 130,
      cell: ({ row }) => {
        const gazette = row.original
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(gazette.updated_at), new Date(), {
                    includeSeconds: true,
                  })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span>Updated At {format(gazette.updated_at, 'PPpp')}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
  ]

  if (isLoading) return <AppPreloader />

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Gazettes</h1>
        <Button onClick={() => navigate('new')}>New Gazette</Button>
      </div>

      {gazettes?.items.length === 0 ? (
        <EmptyContent
          image="/images/empty-document.png"
          title="No gazettes found"
          description="This project doesn't have any gazettes yet. Gazettes will appear here once they are created."></EmptyContent>
      ) : (
        <DataTable
          columns={columns}
          data={gazettes?.items || []}
          meta={{
            page: gazettes?.page || 1,
            pages: gazettes?.pages || 1,
            size: gazettes?.size || 25,
            total: gazettes?.total || 0,
          }}
        />
      )}

      <ModalDelete
        ref={deleteRef}
        alert="Gazette"
        title={`Remove "${gazetteDelete?.name}" from gazettes`}
        data={{
          project_id: params.project_id,
          id: gazetteDelete?.id,
          token: token!,
        }}
      />

      <ShareDialog ref={shareRef} apiUrl={apiUrl} nodeEnv={nodeEnv} />
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
      const url = `${apiUrl}/gazettes/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Gazette deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/gazettes`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
