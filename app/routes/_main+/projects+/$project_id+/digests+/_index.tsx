/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import { Pagination } from '@/components/misc/Pagination'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigest, IDigestPaginationResponse } from '@/types/digest'
import { IPagingInfo } from '@/types/pagination'
import { ensureCanonicalPagination } from '@/utils/pagination.server'
import { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useParams, useSearchParams } from '@remix-run/react'
import { format } from 'date-fns'
import { Calendar, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader({ request }: LoaderFunctionArgs) {
  // This keeps pagination canonicalization consistent across routes.
  const canonical = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  // to redirect early if not canonical (ie: ?page=0 or ?size=9999)
  if (canonical instanceof Response) return canonical

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, size: canonical.size, page: canonical.page }
}

export default function DigestsPage() {
  const { apiUrl, nodeEnv, size, page } = useLoaderData<typeof loader>()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [digests, setDigests] = useState<IDigest[]>([])
  const [pagination, setPagination] = useState<IPagingInfo>({
    page: 1,
    size: 25,
    pages: 1,
    total: 0,
  })
  const { token } = useApp()
  const handleApiError = useHandleApiError()

  const fetchDigests = async () => {
    try {
      const response: IDigestPaginationResponse = await fetchApi(
        `${apiUrl}/projects/${params.project_id}/digests`,
        token!,
        nodeEnv,
        {
          pagination: { page, size },
        },
      )

      setDigests(response.items)
      setPagination({
        page: response.page,
        size: response.size,
        pages: response.pages,
        total: response.total,
      })
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && params.project_id) {
      fetchDigests()
    }
  }, [token, params.project_id, searchParams])

  if (isLoading) {
    return <AppPreloader className="lg:h-[600px]" />
  }

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Digests</h1>
      </div>

      {digests?.length === 0 && !isLoading && (
        <EmptyContent
          image="/images/empty-digest.png"
          title="No digests found"
          description="No digests have been created yet for this project."
        />
      )}

      {digests?.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {digests.map((digest) => (
              <Card
                key={digest.id}
                className="flex h-full flex-col overflow-hidden shadow-card transition-shadow hover:shadow-lg">
                <CardHeader className="pb-3">
                  <Link
                    to={`/projects/${params.project_id}/digests/${digest.id}`}
                    className="button-link">
                    <CardTitle className="line-clamp-2 text-lg">{digest.title}</CardTitle>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(digest.created_at, 'PP')}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col px-6">
                  <div className="mb-4 line-clamp-3 flex-1 text-pretty leading-relaxed text-muted-foreground">
                    {digest.body}
                  </div>

                  {/* Tags and Labels - Always at bottom */}
                  <div className="mt-auto space-y-2">
                    {/* Tags */}
                    {digest.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {digest.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger>
                              {digest.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{digest.tags.length - 2}
                                </Badge>
                              )}
                            </TooltipTrigger>
                            <TooltipContent
                              className="px-3 py-2"
                              side="bottom"
                              align="start">
                              <h1 className="mb-2 font-medium">Tags</h1>
                              <div className="flex flex-col items-start space-y-1">
                                {digest.tags.slice(2).map((tag) => {
                                  return (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs">
                                      <Tag className="mr-1 h-3 w-3" />
                                      {tag}
                                    </Badge>
                                  )
                                })}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}

                    {/* Labels */}
                    {Object.keys(digest.labels).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(digest.labels)
                          .slice(0, 2)
                          .map(([key, value], index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {key}:{' '}
                              {typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)}
                            </Badge>
                          ))}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger>
                              {Object.keys(digest.labels).length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{Object.keys(digest.labels).length - 2}
                                </Badge>
                              )}
                            </TooltipTrigger>
                            <TooltipContent
                              className="px-3 py-2"
                              side="bottom"
                              align="start">
                              <h1 className="mb-2 font-medium">Labels</h1>
                              <div className="flex flex-col items-start space-y-1">
                                {Object.entries(digest.labels)
                                  .slice(2)
                                  .map(([key, value], index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs">
                                      {key}:{' '}
                                      {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </Badge>
                                  ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  {digest.status === 'draft' && <Badge>{digest.status}</Badge>}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination meta={pagination} />
          </div>
        </>
      )}
    </div>
  )
}
