/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import DatePreview from '@/components/misc/DatePreview'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import EmptyContent from '@/components/misc/EmptyContent'
import { StatusBadge } from '@/components/misc/StatusBadge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IImportRequest } from '@/types/import-request'
import { IPaging } from '@/types/pagination'
import { cn } from '@/utils/misc'
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
import { EllipsisVertical, EyeIcon, RefreshCcw, Trash2 } from 'lucide-react'
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

export default function ImportRequestPage() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { token } = useApp()
  const params = useParams()
  const handleApiError = useHandleApiError()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [importRequests, setImportRequests] = useState<IPaging<IImportRequest>>()
  const [processingId, setProcessingId] = useState<string>('')
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const [importRequestDelete, setImportRequestDelete] = useState<IImportRequest>()

  const fetchImportRequests = async () => {
    setIsLoading(true)

    try {
      // Uncomment below to use real API
      const response = await fetchApi(
        `${apiUrl}/projects/${params.project_id}/import-requests`,
        token!,
        nodeEnv,
        {
          pagination: { page, size },
        },
      )
      setImportRequests(response)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onProcessImportRequest = async (id: string) => {
    setProcessingId(id)

    try {
      await fetchApi(`${apiUrl}/import-requests/${id}/process`, token!, nodeEnv, {
        method: 'POST',
      })

      toast.success('Import request processed successfully')
    } catch (error) {
      handleApiError(error)
    } finally {
      setProcessingId('')
    }
  }

  const columnDef: ColumnDef<IImportRequest>[] = [
    {
      accessorKey: 'id',
      header: '',
      size: 5,
      cell: ({ row }) => {
        const isProcessing = processingId === row.original.id

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
                  navigate(
                    `/projects/${params.project_id}/import-requests/${row.original.id}`,
                  )
                }}>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  onProcessImportRequest(row.original.id)
                }}>
                <RefreshCcw className={cn(isProcessing && 'animate-spin')} />
                <span>Process</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setImportRequestDelete(row.original)
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
      accessorKey: 'source.name',
      size: 300,
      header: 'Source',
      cell: ({ row }) => {
        const { source } = row.original
        return (
          <Link
            to={`/projects/${params.project_id}/import-requests/${row.original.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline">
            <p>
              {source.name.length > 30 ? source.name.slice(0, 30) + '...' : source.name}
            </p>
          </Link>
        )
      },
    },
    {
      accessorKey: 'received_count',
      header: '# of items',
      size: 150,
      cell: ({ row }) => {
        return <span>{row.original.received_count}</span>
      },
    },
    {
      accessorKey: 'success_count',
      header: '# of imported items',
      size: 180,
      cell: ({ row }) => {
        return <span>{row.original.success_count}</span>
      },
    },
    {
      accessorKey: 'failure_count',
      header: '# of failed items',
      size: 150,
      cell: ({ row }) => {
        return <span>{row.original.failure_count}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 180,
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 120,
      cell: ({ row }) => {
        return <DatePreview label="Created At" date={row.original.created_at} />
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      size: 120,
      cell: ({ row }) => {
        return <DatePreview label="Updated At" date={row.original.updated_at} />
      },
    },
    {
      accessorKey: 'finished_at',
      header: 'Finished',
      size: 120,
      cell: ({ row }) => {
        return <DatePreview label="Finished At" date={row.original.updated_at} />
      },
    },
  ]

  useEffect(() => {
    if (token && params.project_id) {
      fetchImportRequests()
    }
  }, [token, params.project_id, size, page])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // refresh data
      fetchImportRequests()
    }
  }, [actionData])

  if (isLoading) return <AppPreloader />

  return (
    <div className="h-full animate-slide-up">
      <h1 className="mb-5 text-2xl font-bold dark:text-foreground">Import Requests</h1>

      {importRequests?.items.length === 0 ? (
        <EmptyContent
          image="/images/empty-import-request.png"
          title="No import requests found"
          description="This project doesn't have any import requests yet. Add your first import request to start importing data."
        />
      ) : (
        <DataTable
          columns={columnDef}
          data={importRequests?.items || []}
          meta={{
            page: importRequests?.page || 1,
            pages: importRequests?.pages || 1,
            size: importRequests?.size || 25,
            total: importRequests?.total || 0,
          }}
        />
      )}

      <ModalDelete
        ref={deleteRef}
        title="Remove Import Request"
        description={`This will remove "${importRequestDelete?.source.name}" from your import requests. This action cannot be undone.`}
        data={{
          project_id: params.project_id,
          id: importRequestDelete?.id,
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
      const url = `${apiUrl}/import-requests/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Import request deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/import-requests`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
