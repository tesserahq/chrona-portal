/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IEntry } from '@/types/entry'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, FileText, Hash, Info, Tag, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function EntryDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [entry, setEntry] = useState<IEntry | null>(null)

  const fetchEntry = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/entries/${params.id}`
      const response = await fetchApi(url, token!, nodeEnv)

      setEntry(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchEntry()
    }
  }, [params.id])

  if (isLoading) return <AppPreloader />

  if (!entry) {
    return (
      <div className="h-full animate-slide-up">
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${params.project_id}/entries`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Entries
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{entry.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-5">
          {/* Title and Body */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-muted-foreground">{entry.body}</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span className="text-xs text-muted-foreground">
                Created at {format(entry.created_at, 'PPpp')}
              </span>
            </div>
            <div className="flex items-start justify-start gap-5">
              {/* Tags */}
              {entry.tags.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              {Object.keys(entry.labels).length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                    <Hash className="h-4 w-4" />
                    Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entry.labels).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source Author */}
          {entry.source_author?.author && (
            <div>
              <h3 className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="h-4 w-4" />
                Author
              </h3>
              <div className="rounded-lg bg-muted/50">
                <div className="flex-1 space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Name</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {entry.source_author.author.display_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm text-foreground">
                      {entry.source_author.author.email}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Source Information */}
          {entry.source && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4" />
                Source
              </h3>
              <div className="rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Name</dt>
                    <dd className="font-mono text-xs text-foreground">
                      {entry.source.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      Description
                    </dt>
                    <dd className="font-mono text-xs text-foreground">
                      {entry.source.description}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {Object.keys(entry.meta_data).length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="h-4 w-4" />
                Metadata
              </h3>
              <div className="rounded-lg bg-muted/50 px-2">
                <pre className="overflow-auto text-xs text-muted-foreground">
                  {JSON.stringify(entry.meta_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
