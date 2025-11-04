/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import DatePreview from '@/components/misc/DatePreview'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import EntryFilter from '@/components/misc/Dialog/EntryFilter'
import EmptyContent from '@/components/misc/EmptyContent'
import { TagsPreview } from '@/components/misc/TagsPreview'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IEntry } from '@/types/entry'
import { IPaging } from '@/types/pagination'
import { ensureCanonicalPagination } from '@/utils/pagination.server'
import { redirectWithToast } from '@/utils/toast.server'
import {
  filterToQueryParams,
  queryParamsToFilter,
  type EntryFilterParams,
} from '@/utils/filter-params'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisVertical, EyeIcon, Filter, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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

export default function ProjectEntriesPage() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingWithFilters, setIsLoadingWithFilters] = useState<boolean>(false)
  const [entries, setEntries] = useState<IPaging<IEntry>>()
  const [entryDelete, setEntryDelete] = useState<IEntry>()
  const [filters, setFilters] = useState<EntryFilterParams>({})
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const filterRef = useRef<React.ElementRef<typeof EntryFilter>>(null)

  const fetchEntries = async () => {
    setIsLoadingWithFilters(true)

    try {
      const url = `${apiUrl}/projects/${params.project_id}/entries`

      const response: IPaging<IEntry> = await fetchApi(url, token!, nodeEnv, {
        pagination: { page, size },
      })

      setEntries(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
      setIsLoadingWithFilters(false)
    }
  }

  const fetchEntriesWithFilters = async (filters: EntryFilterParams) => {
    setIsLoadingWithFilters(true)

    try {
      const url = `${apiUrl}/projects/${params.project_id}/entries/search`

      const response: IPaging<IEntry> = await fetchApi(url, token!, nodeEnv, {
        method: 'POST',
        pagination: { page, size },
        body: JSON.stringify(filters),
      })

      setEntries(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
      setIsLoadingWithFilters(false)
    }
  }

  useEffect(() => {
    if (token) {
      const filterParams = queryParamsToFilter(searchParams)

      if (Object.keys(filterParams).length > 0) {
        setFilters(filterParams)
        fetchEntriesWithFilters(filterParams)
      } else {
        setFilters({})
        fetchEntries()
      }
    }
  }, [token, size, page, searchParams])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // reload entries
      fetchEntries()
    }
  }, [actionData])

  const columns: ColumnDef<IEntry>[] = useMemo(() => {
    return [
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
      {
        accessorKey: 'title',
        header: 'Title',
        size: 300,
        cell: ({ row }) => {
          const entry = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="max-w-[300px]">
                <Link
                  to={`/projects/${params.project_id}/entries/${entry.id}`}
                  className="button-link">
                  <p className="truncate">{entry.title}</p>
                </Link>
                <p className="truncate text-xs text-muted-foreground">{entry.body}</p>
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

          return <TagsPreview tags={tags} maxVisible={2} />
        },
      },
      {
        accessorKey: 'source.name',
        header: 'Source',
        size: 100,
        cell: ({ row }) => {
          const entry = row.original
          return (
            <div className="max-w-[200px]">
              <p className="truncate text-sm font-medium">{entry.source.name}</p>
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
        accessorKey: 'source_assignee.author.display_name',
        header: 'Assignee',
        cell: ({ row }) => {
          const entry = row.original

          return (
            <div className="flex items-center gap-2">
              <div className="max-w-[150px]">
                <p className="truncate text-sm font-medium">
                  {entry?.source_assignee?.author?.display_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry?.source_assignee?.author?.email}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'source_created_at',
        header: 'Source Created',
        size: 130,
        cell: ({ row }) => {
          const { source_created_at } = row.original
          return <DatePreview label="Created At" date={source_created_at} />
        },
      },
      {
        accessorKey: 'source_updated_at',
        header: 'Source Updated',
        size: 130,
        cell: ({ row }) => {
          const { source_updated_at } = row.original
          return <DatePreview label="Updated At" date={source_updated_at} />
        },
      },
    ]
  }, [entries])

  const emptyContent = (
    <EmptyContent
      image="/images/empty-document.png"
      title="No entries found"
      description="This project doesn't have any entries yet. Entries will appear here once data is imported or created."
    />
  )

  const emptySearchContent = (
    <EmptyContent
      image="/images/empty-document.png"
      title="No entries found"
      description="No entries found with the current filters. Try adjusting your filters to find entries that match your criteria."
    />
  )

  const isEmpty =
    entries?.items.length === 0 &&
    Object.keys(filters).length === 0 &&
    !isLoading &&
    !isLoadingWithFilters

  if (isLoading) return <AppPreloader />

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Entries</h1>
        <Button size="sm" onClick={() => filterRef.current?.onOpen()}>
          <Filter />
          <div className="flex items-center gap-1">
            Filter
            {Object.keys(filters).length > 0 && <b>({Object.keys(filters).length})</b>}
          </div>
        </Button>
      </div>

      {isEmpty ? (
        emptyContent
      ) : (
        <DataTable
          columns={columns}
          data={entries?.items || []}
          isLoading={isLoadingWithFilters}
          empty={emptySearchContent}
          meta={{
            page: entries?.page || 1,
            pages: entries?.pages || 1,
            size: entries?.size || 25,
            total: entries?.total || 0,
          }}
        />
      )}

      <ModalDelete
        ref={deleteRef}
        title="Remove Entry"
        description={`This will remove "${entryDelete?.title}" from your entries. This action cannot be undone.`}
        data={{
          project_id: params.project_id,
          id: entryDelete?.id,
          token: token!,
        }}
      />

      <EntryFilter
        ref={filterRef}
        initialTags={filters.tags}
        initialSourceCreatedAt={filters.source_created_at}
        initialSourceUpdatedAt={filters.source_updated_at}
        onFilter={(tags, createdAt, updatedAt) => {
          // setIsLoadingWithFilters(true)

          const filterParams: EntryFilterParams = {
            tags: tags.length > 0 ? tags : undefined,
            source_created_at: {
              from: createdAt.from,
              to: createdAt.to,
            },
            source_updated_at: {
              from: updatedAt.from,
              to: updatedAt.to,
            },
          }

          const queryString = filterToQueryParams(filterParams)

          // Preserve existing pagination params
          const newSearchParams = new URLSearchParams(searchParams)

          // Remove old filter params
          newSearchParams.delete('tags[]')
          newSearchParams.delete('source_created_at[from]')
          newSearchParams.delete('source_created_at[to]')
          newSearchParams.delete('source_updated_at[from]')
          newSearchParams.delete('source_updated_at[to]')

          // Add new filter params
          if (queryString) {
            const filterParamsObj = new URLSearchParams(queryString)
            filterParamsObj.forEach((value, key) => {
              if (key.endsWith('[]')) {
                newSearchParams.append(key, value)
              } else {
                newSearchParams.set(key, value)
              }
            })
          }

          const finalQuery = newSearchParams.toString()
          navigate(finalQuery ? `?${finalQuery}` : window.location.pathname)
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
