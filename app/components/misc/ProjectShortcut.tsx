/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getWorkspaceID } from '@/libraries/storage'
import { IProject } from '@/types/project'
import { IWorkspace } from '@/types/workspace'
import { cn } from '@/utils/misc'
import { Link, useNavigate, useParams } from '@remix-run/react'
import { Check, ChevronsUpDown, CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface Props {
  apiUrl: string
  nodeEnv: NodeENVType
}

export default function ProjectShortcut({ apiUrl, nodeEnv }: Props) {
  const params = useParams()
  const [project, setProject] = useState<IProject>()
  const [projects, setProjects] = useState<IProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { token, isLoading: loadingAuth0 } = useApp()
  const handleApiError = useHandleApiError()

  // get current workspaceId from localstorage
  const workspaceId = getWorkspaceID()

  const fetchProjects = async () => {
    try {
      const url = `${apiUrl}/workspaces/${workspaceId}/projects`

      const response = await fetchApi(url, token!, nodeEnv)

      const currentProject = response.data.find(
        (w: IWorkspace) => w.id === params.project_id,
      )

      setProject(currentProject)
      setProjects(response.data)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loadingAuth0) {
      fetchProjects()
    }
  }, [loadingAuth0])

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <b>Loading...</b>
      ) : (
        <Link to={`/projects/${project?.id}/entries`}>
          <b>{project?.name || 'Select a project'}</b>
        </Link>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="icon"
            className="h-8 w-8">
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Command>
              <CommandInput placeholder="Find projects" />
              <CommandList>
                <CommandEmpty>No projects found.</CommandEmpty>
                <CommandGroup>
                  {projects.map((project: IProject) => (
                    <CommandItem
                      key={project.id}
                      value={project.id}
                      className={cn(
                        'cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20',
                        [
                          project.id === params.project_id &&
                            'bg-accent text-accent-foreground',
                        ],
                      )}
                      onSelect={(id) => {
                        const project = projects.find((w) => w.id === id)

                        setProject(project)
                        setOpen(false)
                        navigate(`/projects/${id}/entries`)
                      }}>
                      <div className="flex w-full items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 uppercase dark:bg-slate-600 dark:text-foreground">
                          {project.name.substring(0, 1)}
                        </div>
                        <span className="flex-1">{project.name}</span>
                        {project.id === params.project_id && <Check />}
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem
                    className="cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20"
                    onSelect={() => {
                      navigate(`/workspaces/${workspaceId}/projects/new`)
                      setOpen(false)
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <CirclePlus size={20} className="text-primary" />
                      </div>
                      <span>Create new project</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
