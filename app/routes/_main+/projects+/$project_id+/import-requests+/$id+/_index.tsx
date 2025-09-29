import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import DatePreview from '@/components/misc/DatePreview'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import PreviewJsonDialog from '@/components/misc/Dialog/PreviewJson'
import { StatusBadge } from '@/components/misc/StatusBadge'
import { TagsPreview } from '@/components/misc/TagsPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { IImportRequest, IImportRequestItem } from '@/types/import-request'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  ClockAlert,
  Database,
  EllipsisVertical,
  Eye,
  LaptopMinimalCheck,
  RefreshCcw,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ImportRequestDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [importRequest, setImportRequest] = useState<IImportRequest>()
  const [processingId, setProcessingId] = useState<string>('')
  const previewJsonRef = useRef<React.ElementRef<typeof PreviewJsonDialog>>(null)
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const fetchImportRequest = async () => {
    try {
      const data = await fetchApi(
        `${apiUrl}/import-requests/${params.id}?with_items=true`,
        token!,
        nodeEnv,
      )

      setImportRequest(data)
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

  const columnDef: ColumnDef<IImportRequestItem>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 5,
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-start">
                  {id.length > 8 ? id.slice(0, 8) + '...' : id}
                </span>
              </TooltipTrigger>
              <TooltipContent>{id}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'raw_payload.title',
      header: 'Title',
      size: 100,
      cell: ({ row }) => {
        const title = row.original.raw_payload.title
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-start">
                  {title.length > 8 ? title.slice(0, 8) + '...' : title}
                </span>
              </TooltipTrigger>
              <TooltipContent>{title}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'raw_payload.tags',
      header: 'Tags',
      size: 5,
      cell: ({ row }) => {
        return <TagsPreview tags={row.original.raw_payload.tags} />
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 5,
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 5,
      cell: ({ row }) => {
        return <DatePreview label="Created At" date={row.original.created_at} />
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      size: 5,
      cell: ({ row }) => {
        return <DatePreview label="Updated At" date={row.original.updated_at} />
      },
    },
    {
      accessorKey: 'raw_payload',
      header: 'Payload',
      size: 5,
      cell: ({ row }) => {
        return (
          <div className="flex w-full items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => previewJsonRef.current?.onOpen(row.original.raw_payload)}>
              <Eye size={15} />
            </Button>
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    if (token && params.id) {
      fetchImportRequest()
    }
  }, [token, params.id])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // redirect to import requests list
      navigate(`/projects/${params.project_id}/import-requests`)
    }
  }, [actionData, navigate, params.project_id])

  if (isLoading) {
    return <AppPreloader />
  }

  if (!importRequest) {
    return (
      <div className="coreui-content-center animate-slide-up">
        <Card className="coreui-card-center">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Import request not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="coreui-content-center h-full animate-slide-up">
      <div className="coreui-card-center">
        {/* Main Info Card */}
        <Card className="mb-5">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-balance text-2xl font-bold text-foreground">
                  Import Request Detail
                </h2>
                <StatusBadge status={importRequest.status} />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <EllipsisVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" side="left" className="w-44 p-2">
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start"
                    disabled={processingId === importRequest.id}
                    onClick={() => {
                      onProcessImportRequest(importRequest.id)
                    }}>
                    <RefreshCcw
                      className={cn(processingId === importRequest.id && 'animate-spin')}
                    />
                    <span>Process</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      deleteRef.current?.onOpen()
                    }}>
                    <Trash2 />
                    <span>Delete</span>
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground"># of items</p>
                  <p className="text-2xl font-bold">{importRequest.received_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <LaptopMinimalCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground"># of imported items</p>
                  <p className="text-2xl font-bold text-green-600">
                    {importRequest.success_count}{' '}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <ClockAlert className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground"># of failed items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {importRequest.failure_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Source Name</p>
                  <p className="font-medium">{importRequest.source.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <span className="font-medium">
                    {format(importRequest.created_at, 'PPpp')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <span className="font-medium">
                    {format(importRequest.updated_at, 'PPpp')}
                  </span>
                </div>
                {importRequest.finished_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Finished At</p>
                    <span className="font-medium">
                      {format(importRequest.finished_at, 'PPpp')}
                    </span>
                  </div>
                )}
              </div>

              {/* Options Card */}
              {importRequest.options && Object.keys(importRequest.options).length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold">Options</h3>
                  <div className="d-list rounded-md border border-border p-2">
                    {Object.entries(importRequest.options).map(([key, value]) => (
                      <div key={key} className="d-item">
                        <span className="d-label text-xs capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="d-conten text-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <DataTable columns={columnDef} data={importRequest?.items ?? []} />
          </CardContent>
        </Card>
      </div>

      <ModalDelete
        ref={deleteRef}
        alert="Import Request"
        title={`Remove from import requests`}
        data={{
          project_id: params.project_id,
          id: importRequest?.id,
          token: token!,
        }}
      />

      <PreviewJsonDialog ref={previewJsonRef} title="Raw Payload" />
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
  } catch (error: unknown) {
    const convertError = JSON.parse((error as Error)?.message)

    return redirectWithToast(`/projects/${project_id}/import-requests`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
