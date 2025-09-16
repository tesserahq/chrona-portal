/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IAuthor } from '@/types/author'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { ArrowLeft, Calendar, Mail, Tag, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function AuthorDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [author, setAuthor] = useState<IAuthor | null>(null)

  const fetchAuthor = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/authors/${params.id}`
      const response = await fetchApi(url, token!, nodeEnv)

      setAuthor(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchAuthor()
    }
  }, [params.id])

  if (isLoading) return <AppPreloader />

  if (!author) {
    return (
      <div className="h-full animate-slide-up">
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/workspaces/${params.workspace_id}/authors`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Authors
          </Button>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader>
          {/* Author Header */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={author.avatar_url} alt={author.display_name} />
              <AvatarFallback className="text-2xl font-semibold">
                {getInitials(author.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <h1 className="text-3xl font-bold text-foreground">
                {author.display_name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{author.email}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          {/* Tags Section */}
          {author.tags && author.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {author.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Labels Section */}
          {author.labels && Object.keys(author.labels).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Labels</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(author.labels).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-sm">
                    {key}: {value || '-'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Meta Data Section */}
          {author.meta_data && Object.keys(author.meta_data).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Meta Data</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(author.meta_data).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="min-w-[120px] text-sm font-medium text-foreground">
                      {key}:
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
