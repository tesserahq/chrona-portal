/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import { LabelTooltip } from '@/components/misc/LabelTooltip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { IProject } from '@/types/project'
import { formatDateAgo } from '@/utils/date-format'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { EllipsisVertical, EyeIcon, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, hostUrl, nodeEnv }
}

export default function WorkspaceProjects() {
  const { apiUrl, hostUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<IProject[]>([])
  const { getAccessTokenSilently, logout } = useAuth0()

  const fetchProjects = async () => {
    setIsLoading(true)

    try {
      const token = await getAccessTokenSilently()

      const url = `${apiUrl}/workspaces/${params.workspace_id}/projects`
      const response = await fetchApi(url, token, nodeEnv)

      setProjects(response.data)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        logout({ logoutParams: { returnTo: hostUrl } })
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [params.workspace_id])

  if (isLoading) return <AppPreloader />

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Projects</h1>
        <Button
          onClick={() => navigate(`/workspaces/${params.workspace_id}/projects/new`)}>
          New Project
        </Button>
      </div>
      {!isLoading && (
        <>
          {projects.length === 0 && (
            <EmptyContent
              image="/images/empty-project.png"
              title="Ready to get things done?"
              description="Create a project to connect data, tools, and language models inside Chrona.">
              <Button
                variant="black"
                onClick={() =>
                  navigate(`/workspaces/${params.workspace_id}/projects/new`)
                }>
                Start Creating
              </Button>
            </EmptyContent>
          )}
          {projects.map((project) => {
            return (
              <Card key={project.id} className="mb-2.5 shadow-card">
                <CardContent className="flex items-center gap-2 pt-4">
                  <div className="flex-1">
                    <Link
                      to={`/projects/${project.id}/entries`}
                      className="text-base font-medium text-black hover:text-primary hover:underline dark:text-primary-foreground">
                      {project.name}
                    </Link>

                    <div className="mt-0.5 flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <span>{`Last updated ${formatDateAgo(project.updated_at)}`}</span>
                          </TooltipTrigger>
                          <TooltipContent align="start">
                            <span>{format(project.updated_at, 'PPPPpppp')}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <span>{`Created ${format(project.created_at, 'dd MMMM')}`}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{format(project.created_at, 'PPPPpppp')}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {Object.keys(project?.labels || {}).length > 0 && (
                        <>
                          <Separator orientation="vertical" className="mx-2 h-4" />
                          <LabelTooltip labels={Object.entries(project.labels)} />
                        </>
                      )}
                      <Separator orientation="vertical" className="mx-2 h-4" />
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <EllipsisVertical />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-2">
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`/projects/${project.id}/entries`)}>
                        <EyeIcon />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`/projects/${project.id}/settings`)}>
                        <Settings />
                        <span>Settings</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
