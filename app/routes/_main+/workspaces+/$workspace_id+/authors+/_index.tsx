/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import { DataTable } from '@/components/misc/Datatable'
import { LabelTooltip } from '@/components/misc/LabelTooltip'
import DeleteConfirmation from '@/components/misc/Dialog/DeleteConfirmation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { IAuthor } from '@/types/author'
import { IPaging } from '@/types/pagination'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisVertical, EyeIcon, Edit, Trash2, Mail } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { ensureCanonicalPagination } from '@/utils/pagination.server'
import { redirectWithToast } from '@/utils/toast.server'
import { toast } from 'sonner'

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

export default function WorkspaceAuthors() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigate = useNavigate()
  const handleApiError = useHandleApiError()
  const { token } = useApp()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [authors, setAuthors] = useState<IPaging<IAuthor>>()
  const [authorDelete, setAuthorDelete] = useState<IAuthor | null>(null)
  const deleteRef = useRef<any>(null)

  const fetchAuthors = async () => {
    try {
      const endpoint = `${apiUrl}/workspaces/${params.workspace_id}/authors`
      const data: IPaging<IAuthor> = await fetchApi(endpoint, token || '', nodeEnv, {
        pagination: { page, size },
      })
      setAuthors(data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAuthors()
    }
  }, [token, params.workspace_id, size, page])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // refresh data
      fetchAuthors()
    }
  }, [actionData])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const columns: ColumnDef<IAuthor>[] = [
    {
      accessorKey: 'id',
      header: '',
      size: 5,
      cell: ({ row }) => {
        const author = row.original

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
                onClick={() => {
                  navigate(`/workspaces/${params.workspace_id}/authors/${author.id}`)
                }}>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  navigate(`/workspaces/${params.workspace_id}/authors/${author.id}/edit`)
                }}>
                <Edit />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setAuthorDelete(author)
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
      accessorKey: 'display_name',
      header: 'Author',
      size: 300,
      cell: ({ row }) => {
        const author = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar_url} alt={author.display_name} />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(author.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                to={`/workspaces/${params.workspace_id}/authors/${author.id}`}
                className="button-link">
                {author.display_name}
              </Link>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Mail className="mr-1 h-3 w-3" />
                <span className="max-w-[200px] truncate">{author.email}</span>
              </div>
            </div>
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
        const secondTag = tags[1]
        const remaining = tags.slice(2)

        return (
          <div className="flex flex-wrap items-center gap-1">
            {firstTag && (
              <Badge key={firstTag} variant="secondary" className="text-xs">
                {firstTag}
              </Badge>
            )}
            {secondTag && (
              <Badge key={secondTag} variant="secondary" className="text-xs">
                {secondTag}
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
      accessorKey: 'meta_data',
      header: 'Metadata',
      cell: ({ row }) => {
        const isValidMetadata: boolean =
          row.original.meta_data !== null &&
          Object.keys(row.original.meta_data).length > 0

        return (
          isValidMetadata && (
            <LabelTooltip
              title="Metadata"
              labels={Object.entries(row.original.meta_data)}
            />
          )
        )
      },
    },
  ]

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Authors</h1>
      </div>

      {!isLoading && (
        <>
          {authors?.items.length === 0 ? (
            <EmptyContent
              image="/images/empty-workspace.png"
              title="No authors found"
              description="There are no authors in this workspace yet."></EmptyContent>
          ) : (
            <DataTable
              columns={columns}
              data={authors?.items || []}
              meta={{
                page: authors?.page || 1,
                pages: authors?.pages || 1,
                size: authors?.size || 25,
                total: authors?.total || 0,
              }}
            />
          )}
        </>
      )}

      <DeleteConfirmation
        ref={deleteRef}
        title="Remove Author"
        description={`This will remove "${authorDelete?.display_name}" from your authors. This action cannot be undone.`}
        data={{
          workspace_id: params.workspace_id,
          author_id: authorDelete?.id,
          token: token,
        }}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { workspace_id, author_id, token } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      const url = `${apiUrl}/authors/${author_id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Author deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/workspaces/${workspace_id}/authors`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
