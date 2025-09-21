/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { ISource } from '@/types/source'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { CalendarDays, Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function SourceDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [source, setSource] = useState<ISource | null>(null)

  const fetchSource = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/sources/${params.id}`
      const response = await fetchApi(url, token!, nodeEnv)

      setSource(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchSource()
    }
  }, [params.id])

  if (isLoading) return <AppPreloader />

  return (
    <div className="coreui-content-center animate-slide-up">
      <Card className="coreui-card-center">
        <CardHeader>
          <div className="flex items-start justify-between">
            <h1 className="text-balance text-2xl font-bold text-foreground">
              {source?.name}
            </h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost">
                  <EllipsisVertical />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    navigate(
                      `/workspaces/${params.workspace_id}/sources/${source?.id}/edit`,
                    )
                  }}>
                  <Edit />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    // deleteRef.current?.onOpen()
                    // setEntryDelete(entry)
                  }}>
                  <Trash2 />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Source Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Created {format(new Date(source?.created_at || ''), 'PPpp')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <CalendarDays size={12} />
              <span className="text-xs">
                Updated {format(new Date(source?.updated_at || ''), 'PPpp')}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-0">
          {/* Identifier */}
          {source?.identifier && (
            <div className="mt-3">
              <h3 className="mb-2 text-sm font-medium text-foreground">Identifier</h3>
              <p className="text-sm text-muted-foreground">{source?.identifier}</p>
            </div>
          )}

          {/* Description */}
          {source?.description && (
            <div className="mt-3">
              <h3 className="mb-2 text-sm font-medium text-foreground">Description</h3>
              <p className="text-sm text-muted-foreground">{source?.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
