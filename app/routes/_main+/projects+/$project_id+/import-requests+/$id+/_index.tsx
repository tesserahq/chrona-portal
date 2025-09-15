import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import DatePreview from '@/components/misc/DatePreview'
import PreviewJsonDialog from '@/components/misc/Dialog/PreviewJson'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IImportRequest, IImportRequestItem } from '@/types/import-request'
import { useLoaderData, useParams } from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ClockAlert, Database, Eye, LaptopMinimalCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ImportRequestDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [importRequest, setImportRequest] = useState<IImportRequest>()
  const previewJsonRef = useRef<React.ElementRef<typeof PreviewJsonDialog>>(null)

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

  const columnDef: ColumnDef<IImportRequestItem>[] = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.original.status}</Badge>
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        return <DatePreview label="Created At" date={row.original.created_at} />
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => {
        return <DatePreview label="Updated At" date={row.original.updated_at} />
      },
    },
    {
      accessorKey: 'raw_payload',
      header: 'Payload',
      size: 50,
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
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-balance text-2xl font-bold text-foreground">
                Import Request Detail
              </h2>
              <Badge variant="secondary">{importRequest.status}</Badge>
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
            <DataTable columns={columnDef} data={importRequest?.items || []} />
          </CardContent>
        </Card>
      </div>

      <PreviewJsonDialog ref={previewJsonRef} title="Raw Payload" />
    </div>
  )
}
