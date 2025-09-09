/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IEntry } from '@/types/entry'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { ArrowLeft, CalendarDays, MessageSquare, Tag, User } from 'lucide-react'
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
      <Card className="coreui-card-center border-border shadow-md">
        <CardHeader className="space-y-3">
          <h1 className="text-balance text-2xl font-bold text-foreground">
            {entry.title}
          </h1>

          {/* Issue Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <User className="h-4 w-4" />
              <span className="font-medium">
                {entry.source_author.author.display_name}
              </span>
              <span>@{entry.source_author.author.email}</span>
            </div>

            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">Created {format(entry.created_at, 'PPpp')}</span>
            </div>

            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">Updated {format(entry.updated_at, 'PPpp')}</span>
            </div>
          </div>

          {/* Labels */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(entry.labels).map(([key, value]) => (
              <Badge key={key} variant="secondary">
                {key}: {value}
              </Badge>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {entry.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="whitespace-pre-line text-pretty leading-relaxed">
              {entry.body}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="coreui-card-center mt-4 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <MessageSquare className="h-5 w-5" />
          <span>Comments ({entry.comments.length})</span>
        </div>

        {entry.comments.map((comment) => (
          <Card key={comment.id} className="border-border shadow-md">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      comment.source_author.author.avatar_url ||
                      '/images/default-avatar.jpg'
                    }
                    alt={comment.source_author.author.display_name}
                  />
                  <AvatarFallback>
                    {comment.source_author.author.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">
                      {comment.source_author.author.display_name}
                    </span>
                    <span className="text-muted-foreground">
                      @{comment.source_author.author.email}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {format(comment.created_at, 'PPpp')}
                    </span>
                    {comment.created_at !== comment.updated_at && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          edited {format(comment.updated_at, 'PPpp')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Comment Labels */}
                  {Object.entries(comment.labels).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(comment.labels).map(([key, value]) => (
                        <Badge key={key} variant="secondary">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Comment Tags */}
                  {comment.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {comment.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="text-pretty leading-relaxed">{comment.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
