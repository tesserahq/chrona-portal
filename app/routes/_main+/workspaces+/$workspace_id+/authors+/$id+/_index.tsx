/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import DeleteConfirmation from '@/components/misc/Dialog/DeleteConfirmation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IAuthor } from '@/types/author'
import { useActionData, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Tag,
  User,
  EllipsisVertical,
  Edit,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ActionFunctionArgs } from '@remix-run/node'
import { redirectWithToast } from '@/utils/toast.server'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function AuthorDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [author, setAuthor] = useState<IAuthor | null>(null)
  const deleteRef = useRef<any>(null)

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

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // navigate back to authors list
      navigate(`/workspaces/${params.workspace_id}/authors`)
    }
  }, [actionData, navigate, params.workspace_id])

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
          <div className="flex items-start justify-between">
            {/* Title */}
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

            {/* Hamburger Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost">
                  <EllipsisVertical />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="bottom" className="w-44 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    navigate(
                      `/workspaces/${params.workspace_id}/authors/${author.id}/edit`,
                    )
                  }}>
                  <Edit />
                  <span>Edit</span>
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

      <DeleteConfirmation
        ref={deleteRef}
        alert="Author"
        title={`Delete "${author?.display_name}" from author?`}
        data={{
          workspace_id: params.workspace_id,
          author_id: author?.id,
          token: token,
        }}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { workspace_id, author_id, token } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      const url = `${apiUrl}/authors/${author_id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Author deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/workspaces/${workspace_id}/authors`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
