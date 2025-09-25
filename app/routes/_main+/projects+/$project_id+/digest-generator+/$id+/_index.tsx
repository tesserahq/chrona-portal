/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigestGenerator } from '@/types/digest'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import cronstrue from 'cronstrue'
import { format } from 'date-fns'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DigestGeneratorDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [config, setConfig] = useState<IDigestGenerator | null>(null)

  const fetchConfig = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/digest-generation-configs/${params.id}`
      const response: IDigestGenerator = await fetchApi(url, token!, nodeEnv)
      setConfig(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && token) {
      fetchConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, token])

  if (isLoading) return <AppPreloader />

  if (!config) {
    return (
      <div className="h-full animate-slide-up">
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${params.project_id}/digest-generator`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Digest Generators
          </Button>
        </div>
      </div>
    )
  }

  const hasLabels = config.labels && Object.keys(config.labels).length > 0
  const hasTags = config.tags && config.tags.length > 0
  const hasFilterLabels =
    config.filter_labels && Object.keys(config.filter_labels).length > 0
  const hasFilterTags = config.filter_tags && config.filter_tags.length > 0

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader className="space-y-3">
          <h1 className="text-balance text-2xl font-bold text-foreground">
            {config.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">Created {format(config.created_at, 'PPpp')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">Updated {format(config.updated_at, 'PPpp')}</span>
            </div>
          </div>

          {/* Tags */}
          {hasTags && (
            <div className="flex flex-wrap items-center gap-1">
              {config.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  <span className="font-normal">{tag}</span>
                </Badge>
              ))}
            </div>
          )}

          {/* Labels */}
          {hasLabels && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(config.labels).map(([key, value]) => (
                <Badge key={key} variant="secondary">
                  <span className="font-normal">
                    {key}: {String(value)}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Timezone</div>
              <div className="text-sm text-foreground">{config.timezone || '-'}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Generate Empty Digest</div>
              <div className="text-sm text-foreground">
                {config.generate_empty_digest ? 'Yes' : 'No'}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Cron Expression</div>
              <div className="text-sm text-foreground">
                {cronstrue.toString(config.cron_expression)}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-muted-foreground">Filter Tags</div>
              {hasFilterTags && (
                <div className="flex flex-wrap items-center gap-1">
                  {config.filter_tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <span className="font-normal">{tag}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs text-muted-foreground">Filter Labels</div>
              {hasFilterLabels &&
                Object.entries(config.filter_labels).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    <span className="font-normal">
                      {key}: {String(value)}
                    </span>
                  </Badge>
                ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1 text-xs text-muted-foreground">System Prompt</div>
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap text-pretty leading-relaxed">
                {config.system_prompt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
