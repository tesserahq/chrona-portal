/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getWorkspaceID } from '@/libraries/storage'
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

export default function WorkspaceShortcut({ apiUrl, nodeEnv }: Props) {
  const params = useParams()
  const [workspace, setWorkspace] = useState<IWorkspace>()
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { token, isLoading: loadingAuth0 } = useApp()
  const handleApiError = useHandleApiError()

  const fetchWorkspaces = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/workspaces`, token!, nodeEnv)

      const workspaceId = params.workspace_id || getWorkspaceID()
      const currentWorkspace = response.data.find((w: IWorkspace) => w.id === workspaceId)

      setWorkspace(currentWorkspace)
      setWorkspaces(response.data)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isWorkspaceActive = (workspaceId: string) => {
    return (
      workspaceId === params.workspace_id ||
      (params.project_id && workspaceId === workspace?.id)
    )
  }

  useEffect(() => {
    if (!loadingAuth0) {
      fetchWorkspaces()
    }
  }, [loadingAuth0])

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {isLoading ? (
          <b>Loading...</b>
        ) : (
          <Link to={`/workspaces/${workspace?.id}/overview`}>
            <b>{workspace?.name || 'Select a workspace'}</b>
          </Link>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            size="icon"
            aria-expanded={open}
            className="h-8 w-8">
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Command>
              <CommandInput placeholder="Find workspaces" />
              <CommandList>
                <CommandEmpty>No workspaces found.</CommandEmpty>
                <CommandGroup>
                  {workspaces.map((workspace: IWorkspace) => (
                    <CommandItem
                      key={workspace.id}
                      value={workspace.id}
                      className={cn(
                        'cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20',
                        [
                          isWorkspaceActive(workspace.id) &&
                            'bg-accent text-accent-foreground',
                        ],
                      )}
                      onSelect={(currentValue) => {
                        const workspace = workspaces.find((w) => w.id === currentValue)

                        setWorkspace(workspace)
                        setOpen(false)
                        navigate(`/workspaces/${currentValue}/overview`, {
                          state: { workspaceId: currentValue },
                        })
                      }}>
                      <div className="flex w-full items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 uppercase dark:bg-slate-600 dark:text-foreground">
                          {workspace.name.substring(0, 1)}
                        </div>
                        <div className="flex-1">
                          <span>{workspace.name}</span>
                        </div>

                        {isWorkspaceActive(workspace.id) && <Check />}
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem
                    className="cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20"
                    onSelect={() => {
                      navigate(`/workspaces/new`)
                      setOpen(false)
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <CirclePlus size={20} className="text-primary" />
                      </div>
                      <span>Create new workspace</span>
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
