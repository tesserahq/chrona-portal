import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IImportRequest } from '@/types/import-request'
import { useLoaderData, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { ClockAlert, Database, LaptopMinimalCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

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

  const fetchImportRequest = async () => {
    try {
      const data = await fetchApi(
        `${apiUrl}/import-requests/${params.id}`,
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
        <Card className="coreui-card-center border-border shadow-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Import request not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full animate-slide-up">
      <div className="grid gap-6">
        {/* Main Info Card */}
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-balance text-2xl font-bold text-foreground">
                Import Request Detail
              </h2>
              <Badge variant="secondary">{importRequest.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="text-2xl font-bold">{importRequest.received_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <LaptopMinimalCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Success</p>
                  <p className="text-2xl font-bold text-green-600">
                    {importRequest.success_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <ClockAlert className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {importRequest.failure_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                        <span className="d-label capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="d-content">
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
