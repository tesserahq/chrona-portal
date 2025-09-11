/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IWorkspaceStats } from '@/types/workspace'
import { cn } from '@/utils/misc'
import { Link, useLoaderData, useParams } from '@remix-run/react'
import { format, formatDistance } from 'date-fns'
import { File, KeyRound, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatsCardProps<T> {
  title: string
  viewAllLink: string
  items: T[]
  emptyMessage: React.ReactNode
  getItemLink: (item: T) => string
  getItemName: (item: T) => string
  getUpdatedAt: (item: T) => string
  getItemLogo?: (item: T) => string
}

function StatsCard<T>({
  title,
  viewAllLink,
  items,
  emptyMessage,
  getItemLink,
  getItemName,
  getUpdatedAt,
  getItemLogo,
}: StatsCardProps<T>) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold leading-none">{title}</h2>
          {items.length > 0 && (
            <Link to={viewAllLink} className="button-link">
              View All
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="d-list px-6">
        {items.length === 0 && (
          <div className="flex min-h-20 items-center justify-center">{emptyMessage}</div>
        )}
        {items.map((item, idx) => {
          const updatedAt = getUpdatedAt(item)

          return (
            <div key={idx} className="d-item flex items-start justify-between">
              <Link
                to={getItemLink(item)}
                className="button-link flex items-center gap-2">
                {/* Show credential logo */}
                {title === 'Credentials' && (
                  <>
                    {['gitlab_pat', 'github_pat', 'ssh_key', 'identies_auth'].includes(
                      getItemLogo!(item),
                    ) ? (
                      <img
                        src={`/images/${getItemLogo!(item)}.png`}
                        className={cn(
                          `h-5 w-5 rounded`,
                          getItemLogo!(item) === 'gitlab_pat' && 'scale-[2]',
                          getItemLogo!(item) === 'github_pat' &&
                            'rounded-full dark:bg-white',
                        )}
                      />
                    ) : (
                      <KeyRound />
                    )}
                  </>
                )}
                {getItemName(item)}
              </Link>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(updatedAt), new Date(), {
                        includeSeconds: true,
                      })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Updated at {format(updatedAt, 'PPPPpppp')}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function WorkspaceHome() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const [stats, setStats] = useState<IWorkspaceStats>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { token } = useApp()
  const handleApiError = useHandleApiError()

  const fetchWorkspaceStats = async () => {
    setIsLoading(true)

    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}/stats`,
        token!,
        nodeEnv,
      )

      setStats(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const resourceNewActions = [
    {
      label: 'Project',
      icon: <File size={15} />,
    },
  ]

  useEffect(() => {
    fetchWorkspaceStats()
  }, [params.workspace_id])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <>
      <div className="mb-3 flex animate-slide-up items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Overview</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <Plus /> New Resource
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60 py-2">
            {resourceNewActions.map((resource, index) => {
              return (
                <div
                  key={resource.label}
                  className={cn(
                    'border-b py-1',
                    resourceNewActions.length - 1 === index && 'border-none',
                  )}>
                  <Link
                    to={`/workspaces/${params.workspace_id}/${resource.label.toLowerCase()}s/new`}
                    className="flex w-full flex-row items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted">
                    {resource.icon}
                    <span>{`Create New ${resource.label}`}</span>
                  </Link>
                </div>
              )
            })}
          </PopoverContent>
        </Popover>
      </div>

      {/* Total Stats */}
      <div className="grid animate-slide-up gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription># of Projects</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {stats?.project_stats.total_projects}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Data */}
      <div className="mt-5 animate-slide-up">
        <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <StatsCard
            title="Projects"
            viewAllLink={`/workspaces/${params.workspace_id}/projects`}
            items={stats?.project_stats.recent_projects || []}
            emptyMessage={
              <div className="flex h-full flex-col items-center">
                <img src="/images/empty-project.png" className="w-40" />
                <span className="text-base font-bold">No Projects Found</span>
              </div>
            }
            getItemLink={({ id }) => `/projects/${id}/entries`}
            getItemName={({ name }) => name}
            getUpdatedAt={({ updated_at }) => updated_at}
          />
        </div>
      </div>
    </>
  )
}
