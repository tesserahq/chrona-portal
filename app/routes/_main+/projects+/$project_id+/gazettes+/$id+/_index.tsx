/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import ShareDialog from '@/components/misc/Dialog/ShareDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IGazette } from '@/types/gazette'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  EllipsisVertical,
  Share2,
  Tag,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function GazetteDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gazette, setGazette] = useState<IGazette | null>(null)
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const shareRef = useRef<React.ElementRef<typeof ShareDialog>>(null)

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

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // redirect to gazettes list
      navigate(`/projects/${params.project_id}/gazettes`)
    }
  }, [actionData, navigate, params.project_id])

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
          <div className="flex items-start justify-between">
            <h1 className="text-balance text-2xl font-bold text-foreground">
              {gazette.header}
            </h1>

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
                  onClick={() => {
                    navigate(`/projects/${params.project_id}/gazettes/${params.id}/edit`)
                  }}>
                  <Edit />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    shareRef.current?.onOpen(gazette)
                  }}>
                  <Share2 />
                  <span>Share</span>
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

      <ModalDelete
        ref={deleteRef}
        alert="Gazette"
        title={`Remove "${gazette?.name}" from gazettes`}
        data={{
          project_id: params.project_id,
          id: gazette?.id,
          token: token!,
        }}
      />

      <ShareDialog ref={shareRef} apiUrl={apiUrl!} nodeEnv={nodeEnv} />
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
      const url = `${apiUrl}/gazettes/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Gazette deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/gazettes`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
