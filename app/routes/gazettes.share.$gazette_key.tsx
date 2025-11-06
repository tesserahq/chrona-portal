/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import DigestInformation from '@/components/misc/Dialog/DigestInformation'
import { MarkdownRenderer } from '@/components/misc/Markdown/MarkdownRender'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { useTheme } from '@/hooks/useTheme'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources+/update-theme'
import { IDigest } from '@/types/digest'
import { IGazette, IGazetteSection } from '@/types/gazette'
import { cn } from '@/utils/misc'
import {
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL

  return { apiUrl }
}

const colors = [
  {
    name: 'Soft Pink',
    primary: '#e91e63',
    secondary: '#fce7f0',
    accent: '#fdf2f8',
    text: '#831843',
  },
  {
    name: 'Deep Purple',
    primary: '#8b5cf6',
    secondary: '#e9d5ff',
    accent: '#f3e8ff',
    text: '#581c87',
  },
  {
    name: 'Classic Black',
    primary: '#374151',
    secondary: '#f3f4f6',
    accent: '#f9fafb',
    text: '#111827',
  },
  {
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#e0f2fe',
    accent: '#f0f9ff',
    text: '#0c4a6e',
  },
  {
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#d1fae5',
    accent: '#ecfdf5',
    text: '#064e3b',
  },
  {
    name: 'Sunset Orange',
    primary: '#ea580c',
    secondary: '#fed7aa',
    accent: '#fff7ed',
    text: '#9a3412',
  },
]

export default function PublicGazetteSharePage() {
  const { apiUrl } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const handleApiError = useHandleApiError()
  const theme = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gazette, setGazette] = useState<IGazette | null>(null)
  const [digests, setDigests] = useState<IDigest[]>([])
  const [sections, setSections] = useState<IGazetteSection[]>([])
  const [error, setError] = useState<string>('')
  const [selectedColorTheme, setSelectedColorTheme] = useState<string>('Classic Black')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const submit = useSubmit()
  const tags = searchParams.get('tags')
  const digestRef = useRef<React.ElementRef<typeof DigestInformation>>(null)

  const fetchSharedGazette = async (tags: string[] = []) => {
    setIsLoading(true)
    setError('')

    try {
      const url = `${apiUrl}/gazettes/share/${params.gazette_key}?tags=${tags.join(',')}`
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

  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      },
    )
  }

  // Get all digests grouped by date (no filtering)
  const digestGrouped = useMemo(() => {
    const allDigests = [...digests, ...sections.flatMap((section) => section.digests)]
    const grouped = allDigests.reduce(
      (acc, digest) => {
        const date = format(new Date(digest.published_at), 'yyyy-MM-dd')
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(digest)
        return acc
      },
      {} as Record<string, IDigest[]>,
    )

    // Sort dates in descending order
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce(
        (acc, date) => {
          acc[date] = grouped[date].sort(
            (a, b) =>
              new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
          )
          return acc
        },
        {} as Record<string, IDigest[]>,
      )
  }, [digests])

  const scrollToDate = (date: string) => {
    const element = document.getElementById(date)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onFilterByTags = (tag: string) => {
    const currentTags = searchParams.get('tags')

    if (!currentTags) {
      // No tags selected, add the first tag
      setSearchParams({ tags: tag })
      return
    }

    // Parse current tags into an array
    const tagsArray = currentTags.split(',').filter((t) => t.trim() !== '')

    if (tagsArray.includes(tag)) {
      // Tag is already selected, remove it
      const filteredTags = tagsArray.filter((t) => t !== tag)

      if (filteredTags.length === 0) {
        // No tags left, remove the tags parameter
        setSearchParams({})
      } else {
        // Update with remaining tags
        setSearchParams({ tags: filteredTags.join(',') })
      }
    } else {
      // Tag is not selected, add it
      const newTags = [...tagsArray, tag]
      setSearchParams({ tags: newTags.join(',') })
    }
  }

  const isDark = theme === 'dark'
  const currentColorTheme = colors.find((color) => color.name === selectedColorTheme)

  useEffect(() => {
    if (params.gazette_key) {
      const tagsParam = searchParams.get('tags')

      if (tagsParam) {
        const tagsArray = tagsParam.split(',').filter((t) => t.trim() !== '')
        fetchSharedGazette(tagsArray)
      } else {
        // No tags filter, fetch all digests
        fetchSharedGazette()
      }
    }
  }, [params.gazette_key, searchParams])

  useEffect(() => {
    const colorTheme = localStorage.getItem('gazette-color-theme')
    if (colorTheme) {
      setSelectedColorTheme(colorTheme)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const navLinkEls = document.querySelectorAll('.timeline')
      const sectionEls = document.querySelectorAll('.digest-section')

      let currentSection = navLinkEls[0].id

      sectionEls.forEach((section) => {
        // Use HTMLElement to access offsetTop safely
        const sectionElement = section as HTMLElement

        if (window.scrollY > sectionElement.offsetTop - 100) {
          currentSection = sectionElement.id
        }
      })

      // to check if the current section is the same as nav section
      navLinkEls.forEach((nav) => {
        if (nav.id === currentSection) {
          setSelectedDate(currentSection)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (isLoading) {
    return <AppPreloader className="h-screen" />
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
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Main Content Area */}
      <header className="relative w-full bg-white dark:border-gray-700 dark:bg-gray-900 lg:text-center">
        <div className="px-4 py-6 lg:container lg:mx-auto">
          <h1 className="mb-2.5 font-playfair text-5xl font-bold capitalize">
            {gazette.header}
          </h1>
          {gazette.subheader && <p className="text-lg">{gazette.subheader}</p>}
          <div className="flex items-center justify-start gap-2 text-sm text-gray-500 lg:justify-center">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(), 'PPP')}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 lg:right-40 lg:flex-row">
          {/* Theme Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:border-primary hover:bg-white data-[state=on]:bg-transparent dark:bg-gray-800/90 dark:hover:bg-gray-800">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : theme === 'light' ? (
              <Moon className="h-4 w-4 text-blue-400" />
            ) : (
              <Monitor className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm font-medium capitalize">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </Button>

          {/* Color Switcher */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800">
                <Palette
                  className="h-4 w-4"
                  style={{ color: currentColorTheme?.primary }}
                />
                {selectedColorTheme}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52" align="end">
              <div className="space-y-2">
                <h4 className="font-medium">Choose Color Theme</h4>
                <div>
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        localStorage.setItem('gazette-color-theme', color.name)
                        setSelectedColorTheme(color.name)
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors ${
                        selectedColorTheme === color.name
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      <div
                        className="h-4 w-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.primary }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Tags Bar */}
      <nav
        className="sticky top-0 z-10 flex items-center justify-center gap-2 py-3"
        style={{
          backgroundColor: currentColorTheme?.primary || '#374151',
        }}>
        {gazette.tags && gazette.tags.length > 0 && (
          <>
            {gazette.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onFilterByTags(tag)
                }}
                className={cn(
                  'bg-transparent px-5 py-1 text-base text-white text-opacity-80 transition-all duration-200 hover:text-opacity-100',
                  tags?.split(',').includes(tag) &&
                    'rounded-md bg-white/20 font-semibold text-opacity-100',
                )}>
                {tag}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Content */}
      {Object.keys(digestGrouped).length === 0 ? (
        <EmptyContent
          image="/images/empty-digest.png"
          title="No digests found"
          description="No digests have been created yet for this gazette"
        />
      ) : (
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 pb-8 lg:grid-cols-3">
          {/* Display digests grouped by date */}
          <div className="col-span-1 lg:col-span-2">
            {Object.keys(digestGrouped).map((date) => (
              <div key={date} id={date} className="digest-section pt-16">
                {/* Date Header */}
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">
                    {format(new Date(date), 'EEEE, MMMM do, yyyy')}
                  </h2>
                  <Separator orientation="horizontal" className="flex-1" />
                  <Badge variant="secondary">
                    {digestGrouped[date].length} update
                    {digestGrouped[date].length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Digests Columns */}
                <div
                  className={cn(
                    digestGrouped[date].length > 2
                      ? 'lg:columns-2'
                      : 'grid gap-4 lg:grid-cols-2',
                  )}>
                  {digestGrouped[date].map((digest) => (
                    <div
                      key={digest.id}
                      onClick={() => digestRef.current?.onOpen(digest)}
                      className="mb-4 inline-block h-fit cursor-pointer rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                      style={{
                        borderLeft: `4px solid ${digest.digest_generation_config.ui_format?.color}`,
                      }}>
                      {/* Title */}
                      <h3 className="mb-3 font-playfair text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                        {digest.title}
                      </h3>

                      {/* Content */}
                      <div
                        className={`0 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <MarkdownRenderer>{digest.body}</MarkdownRenderer>
                      </div>

                      {/* Tags */}
                      {digest.tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap justify-end gap-1">
                          {digest.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              <span className="text-xs font-normal">{tag}</span>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {digest.status === 'draft' && (
                        <div className="mt-3 flex justify-end">
                          <Badge>
                            <span className="font-normal">{digest.status}</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Sidebar */}
          <div className="col-span-1">
            <div className="sticky top-0 pt-16">
              <div className="relative">
                <h3 className="mb-6 font-playfair text-xl font-bold text-gray-900 dark:text-white">
                  News Timeline
                </h3>
                <div className="absolute bottom-0 left-[15px] top-12 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                {Object.keys(digestGrouped).length > 0 && (
                  <div className="space-y-6">
                    {Object.keys(digestGrouped).map((date, index) => (
                      // (!selectedDate && index === 0): to selected when first load

                      <button
                        key={date}
                        id={date}
                        onClick={() => scrollToDate(date)}
                        className="timeline relative w-full">
                        <button
                          className={cn(
                            `${date}-button absolute left-2 h-4 w-4 rounded-full border-2 border-white bg-gray-200 shadow-md transition-all hover:scale-110 dark:bg-gray-500`,
                            (selectedDate === date || (!selectedDate && index === 0)) &&
                              'bg-blue-500 dark:bg-blue-700',
                          )}></button>
                        <div className="ml-10 text-left font-medium transition-opacity hover:opacity-80">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {format(new Date(date), 'EEEE, MMMM do')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {digestGrouped[date].length} update
                            {digestGrouped[date].length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DigestInformation ref={digestRef} />
    </div>
  )
}
