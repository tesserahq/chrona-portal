/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import '@/styles/customs/gazette.css'
import { IDigest } from '@/types/digest'
import { IGazette, IGazetteSection } from '@/types/gazette'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dummyGazetteData } from '@/data/dummy-gazette-data'
import Separator from '@/components/ui/separator'

export function loader() {
  const apiUrl = process.env.API_URL

  return { apiUrl }
}

export default function PublicGazetteSharePage() {
  const { apiUrl } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gazette, setGazette] = useState<IGazette | null>(null)
  const [digests, setDigests] = useState<IDigest[]>([])
  const [sections, setSections] = useState<IGazetteSection[]>([])
  const [error, setError] = useState<string>('')

  const fetchSharedGazette = async () => {
    setIsLoading(true)
    setError('')

    // Development flag - set to true to use dummy data
    const USE_DUMMY_DATA = false

    if (USE_DUMMY_DATA) {
      // Use dummy data for development
      setGazette(dummyGazetteData.gazette)
      setDigests(dummyGazetteData.digests)
      setSections(dummyGazetteData.sections)
      setIsLoading(false)
      return
    }

    try {
      const url = `${apiUrl}/gazettes/share/${params.key}`
      const response = await fetch(url, { method: 'GET' })

      if (response.ok) {
        const json = await response.json()

        setGazette(json.gazette)
        setDigests(json.digests)
        setSections(json.sections)
      }
    } catch (error: any) {
      const errorMessage =
        'Failed to load shared gazette. The link may be invalid or expired.'
      setError(errorMessage)
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.key) {
      fetchSharedGazette()
    }
  }, [params.key])

  if (isLoading) {
    return <AppPreloader className="h-screen bg-white" />
  }

  if (error || !gazette) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
        <EmptyContent
          image="/images/empty-document.png"
          title="Gazette Not Found"
          description="The gazette key is invalid or expired.">
          <Button variant="black" onClick={() => navigate('/', { replace: true })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </EmptyContent>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="font-playfair mb-2.5 text-5xl font-bold text-gray-900">
            {gazette.header}
          </h1>
          {gazette.subheader && (
            <p className="mb-4 text-lg italic text-gray-600">{gazette.subheader}</p>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(gazette?.created_at), 'PPP')}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="bg-gazette flex items-center justify-center gap-2 py-3">
          {gazette.tags && gazette.tags.length > 0 && (
            <>
              {gazette.tags.map((tag) => (
                <a
                  key={tag}
                  href="#"
                  className="bg-transparent px-5 text-base text-white hover:text-opacity-80">
                  {tag}
                </a>
              ))}
            </>
          )}
        </div>

        <div className="container mx-auto py-5">
          {/* Section */}
          {sections.length > 0 && (
            <div>
              {sections.map((data, index) => {
                const { section, digests } = data

                return (
                  <div key={index}>
                    <h2 className="font-playfair mb-2 text-3xl font-bold text-gray-900">
                      {section.header}
                    </h2>
                    <p className="mb-5 text-gray-500">{section.subheader}</p>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {digests.map((digest) => {
                        return (
                          <div
                            key={digest.id}
                            className="border-l-gazette rounded-xl border border-l-4 border-gray-100 p-5 shadow transition-all duration-200 hover:shadow-lg">
                            {/* Header */}
                            <div>
                              <h3 className="font-playfair line-clamp-2 text-xl font-bold text-gray-900">
                                {digest.title}
                              </h3>
                              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {format(digest.created_at, 'PPP')} |
                                <span>
                                  From {format(digest.from_date, 'PP')} to{' '}
                                  {format(digest.to_date, 'PP')}
                                </span>
                              </div>
                            </div>
                            {/* body */}
                            <div className="mt-3 line-clamp-3 text-gray-500">
                              {digest.body}
                            </div>
                            <div className="mt-5 flex flex-wrap items-center gap-1">
                              <Tag size={15} className="text-gray-500" />
                              {digest.tags.slice(0, 2).map((tag, index) => (
                                <div key={index} className="gazette-tag">
                                  {tag}
                                </div>
                              ))}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(digest.labels)
                                .slice(2)
                                .map(([key, value], index) => (
                                  <div key={index} className="gazette-label">
                                    {key}:{' '}
                                    {typeof value === 'object'
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </div>
                                ))}
                            </div>

                            {digest.status === 'draft' && (
                              <div className="mt-3 flex justify-end">
                                <Badge>{digest.status}</Badge>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <Separator className="my-12 bg-[#e5e5e5]" />
            </div>
          )}

          {/* Digest */}
          {digests.length > 0 && (
            <>
              <h2 className="font-playfair mb-5 text-3xl font-bold text-gray-900">
                Digests
              </h2>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {digests.map((digest) => {
                  return (
                    <div
                      key={digest.id}
                      className="border-l-gazette rounded-xl border border-l-4 border-gray-100 p-5 shadow transition-all duration-200 hover:shadow-lg">
                      {/* Header */}
                      <div>
                        <h3 className="font-playfair line-clamp-2 text-xl font-bold text-gray-900">
                          {digest.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {format(digest.created_at, 'PPP')} |
                          <span>
                            From {format(digest.from_date, 'PP')} to{' '}
                            {format(digest.to_date, 'PP')}
                          </span>
                        </div>
                      </div>
                      {/* body */}
                      <div className="mt-3 line-clamp-3 text-gray-500">{digest.body}</div>
                      <div className="mt-5 flex flex-wrap items-center gap-1">
                        <Tag size={15} className="text-gray-500" />
                        {digest.tags.slice(0, 2).map((tag, index) => (
                          <div key={index} className="gazette-tag">
                            {tag}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(digest.labels)
                          .slice(2)
                          .map(([key, value], index) => (
                            <div key={index} className="gazette-label">
                              {key}:{' '}
                              {typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)}
                            </div>
                          ))}
                      </div>

                      {digest.status === 'draft' && (
                        <div className="mt-3 flex justify-end">
                          <Badge>{digest.status}</Badge>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
