/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import EmptyContent from '@/components/misc/EmptyContent'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
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
import { IEntry } from '@/types/entry'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { format, formatDistance } from 'date-fns'
import { EllipsisVertical, EyeIcon, Tag, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ActionFunctionArgs } from '@remix-run/node'
import { redirectWithToast } from '@/utils/toast.server'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ProjectEntriesPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [entries, setEntries] = useState<IEntry[]>([])
  const [entryDelete, setEntryDelete] = useState<IEntry>()
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const fetchEntries = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/projects/${params.project_id}/entries`
      const response = await fetchApi(url, token!, nodeEnv)

      setEntries(response.data || [])
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchEntries()
    }
  }, [token])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
    }
  }, [actionData])

  const columns: ColumnDef<IEntry>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="max-w-[300px]">
              <Link
                to={`/projects/${params.project_id}/entries/${entry.id}`}
                className="truncate font-medium text-foreground hover:text-primary hover:underline">
                {entry.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {entry.body.substring(0, 100)}...
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{entry.tags.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'labels',
      header: 'Labels',
      cell: ({ row }) => {
        const isValidLabels: boolean =
          row.original.labels !== null && Object.keys(row.original.labels).length > 0

        return (
          isValidLabels && <LabelTooltip labels={Object.entries(row.original.labels)} />
        )
      },
    },
    {
      accessorKey: 'source.name',
      header: 'Source',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div className="max-w-[200px]">
            <p className="truncate text-sm font-medium">{entry.source.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {entry.source.description}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'source_author.author.display_name',
      header: 'Author',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="max-w-[150px]">
              <p className="truncate text-sm font-medium">
                {entry.source_author.author.display_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.source_author.author.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(entry.created_at), new Date(), {
                    includeSeconds: true,
                  })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span>Created At {format(entry.created_at, 'PPpp')}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(entry.updated_at), new Date(), {
                    includeSeconds: true,
                  })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span>Updated At {format(entry.updated_at, 'PPpp')}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'id',
      header: '',
      size: 10,
      cell: ({ row }) => {
        const entry = row.original

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() =>
                  navigate(`/projects/${params.project_id}/entries/${entry.id}`)
                }>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setEntryDelete(entry)
                }}>
                <Trash2 />
                <span>Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]

  if (isLoading) return <AppPreloader />

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Project Entries</h1>
      </div>

      {entries.length === 0 ? (
        <EmptyContent
          image="/images/empty-document.png"
          title="No entries found"
          description="This project doesn't have any entries yet. Entries will appear here once data is imported or created.">
          <Button onClick={() => navigate('new')} variant="black">
            Start creating
          </Button>
        </EmptyContent>
      ) : (
        <DataTable columns={columns} data={entries} />
      )}

      <ModalDelete
        ref={deleteRef}
        alert="Entry"
        title={`Remove "${entryDelete?.title}" from entries`}
        data={{
          project_id: params.project_id,
          id: entryDelete?.id,
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
      const url = `${apiUrl}/entries/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Entry deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/entries`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
