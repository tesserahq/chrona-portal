/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import DatePreview from '@/components/misc/DatePreview'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import EmptyContent from '@/components/misc/EmptyContent'
import { LabelTooltip } from '@/components/misc/LabelTooltip'
import { TagsPreview } from '@/components/misc/TagsPreview'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigest, IDigestPaginationResponse } from '@/types/digest'
import { IPagingInfo } from '@/types/pagination'
import { ensureCanonicalPagination } from '@/utils/pagination.server'
import { redirectWithToast } from '@/utils/toast.server'
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
import { EllipsisVertical, EyeIcon, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

export default function DigestsPage() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [digests, setDigests] = useState<IDigest[]>([])
  const [pagination, setPagination] = useState<IPagingInfo>({
    page: 1,
    size: 25,
    pages: 1,
    total: 0,
  })
  const [digestDelete, setDigestDelete] = useState<IDigest | null>(null)
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const columns: ColumnDef<IDigest>[] = [
    {
      accessorKey: 'id',
      header: '',
      size: 5,
      cell: ({ row }) => {
        const digest = row.original
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
                  navigate(`/projects/${params.project_id}/digests/${digest.id}`)
                }>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setDigestDelete(digest)
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
      cell: ({ row }) => {
        const { title, id, body } = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="max-w-[300px] lg:max-w-[500px]">
              <Link
                to={`/projects/${params.project_id}/digests/${id}`}
                className="button-link">
                <p className="truncate">{title}</p>
              </Link>
              <p className="truncate text-xs text-muted-foreground">{body}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      size: 250,
      cell: ({ row }) => {
        const tags = row.original.tags || []

        return <TagsPreview tags={tags} />
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
      accessorKey: 'source_created_at',
      header: 'Created',
      size: 130,
      cell: ({ row }) => {
        const { created_at } = row.original
        return <DatePreview label="Created At" date={created_at} />
      },
    },
    {
      accessorKey: 'source_updated_at',
      header: 'Updated',
      size: 130,
      cell: ({ row }) => {
        const { updated_at } = row.original
        return <DatePreview label="Updated At" date={updated_at} />
      },
    },
  ]

  const fetchDigests = async () => {
    try {
      const response: IDigestPaginationResponse = await fetchApi(
        `${apiUrl}/projects/${params.project_id}/digests`,
        token!,
        nodeEnv,
        {
          pagination: { page, size },
        },
      )

      setDigests(response.items)
      setPagination({
        page: response.page,
        size: response.size,
        pages: response.pages,
        total: response.total,
      })
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && params.project_id) {
      fetchDigests()
    }
  }, [token, params.project_id, searchParams])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // reload digests
      fetchDigests()
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader className="lg:h-[600px]" />
  }

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Digests</h1>
      </div>

      {digests?.length === 0 && !isLoading && (
        <EmptyContent
          image="/images/empty-digest.png"
          title="No digests found"
          description="No digests have been created yet for this project."
        />
      )}

      <DataTable columns={columns} data={digests} meta={pagination} />

      <ModalDelete
        ref={deleteRef}
        alert="Digest"
        title={`Remove "${digestDelete?.title}" from digests`}
        data={{
          project_id: params.project_id,
          id: digestDelete?.id,
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
      const url = `${apiUrl}/digests/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Digest deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/digests`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
