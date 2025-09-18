/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IGazette } from '@/types/gazette'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function GazetteDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gazette, setGazette] = useState<IGazette | null>(null)

  const fetchGazette = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/gazettes/${params.id}`
      const response = await fetchApi(url, token!, nodeEnv)

      setGazette(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && token) {
      fetchGazette()
    }
  }, [params.id, token])

  if (isLoading) {
    return <AppPreloader />
  }

  if (!gazette) {
    return (
      <div className="h-full animate-slide-up">
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${params.project_id}/gazettes`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gazettes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-balance text-2xl font-bold text-foreground">
              {gazette.header}
            </h1>
          </div>
          {gazette.subheader && (
            <p className="text-lg text-muted-foreground">{gazette.subheader}</p>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Gazette Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Created {format(gazette.created_at, 'PPpp')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Updated {format(gazette.updated_at, 'PPpp')}
              </span>
            </div>

            {gazette.deleted_at && (
              <div className="flex items-center gap-1">
                <CalendarDays size={12} />
                <span className="text-xs">
                  Deleted {format(gazette.deleted_at, 'PPpp')}
                </span>
              </div>
            )}

            {gazette.theme && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {gazette.theme}
                </Badge>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mt-3">
            {(gazette.tags || []).length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {gazette.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="mt-3">
            {Object.keys(gazette.labels || {}).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(gazette.labels || {}).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
