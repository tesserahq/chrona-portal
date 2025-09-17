/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { MarkdownRenderer } from '@/components/misc/Markdown/MarkdownRender'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigest } from '@/types/digest'
import { useLoaderData, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { CalendarDays, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DigestDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [digest, setDigest] = useState<IDigest | null>(null)

  const fetchDigest = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/digests/${params.id}`
      const response = await fetchApi(url, token!, nodeEnv)

      setDigest(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && token) {
      fetchDigest()
    }
  }, [params.id, token])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-balance text-2xl font-bold text-foreground">
              {digest?.title}
            </h1>
          </div>

          {/* Digest Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Created {format(digest?.created_at || '', 'PPpp')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Updated {format(digest?.updated_at || '', 'PPpp')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Period: {format(digest?.from_date || '', 'PP')} -{' '}
                {format(digest?.to_date || '', 'PP')}
              </span>
            </div>
          </div>

          {/* Labels */}
          {Object.keys(digest?.labels || {})?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(digest?.labels || {}).map(([key, value]) => (
                <Badge key={key} variant="secondary">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          )}

          {/* Tags */}
          {(digest?.tags || []).length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {digest?.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Digest Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-medium">Entries:</span>
              <span>{digest?.entries_ids?.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Comments:</span>
              <span>{digest?.comments_ids?.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {digest?.body ? (
            <MarkdownRenderer>{digest?.body}</MarkdownRenderer>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>No content available for this digest?.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
