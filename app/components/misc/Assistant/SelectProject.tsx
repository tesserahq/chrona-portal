/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getProjectID, getWorkspaceID, setProjectID } from '@/libraries/storage'
import { IProject } from '@/types/project'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

interface IProps {
  apiUrl: string
  nodeEnv: NodeENVType
  workspaceId: string
  onSelect: (projectId: IProject) => void
}

export default function SelectProjectAssistant({
  apiUrl,
  nodeEnv,
  onSelect,
  workspaceId,
}: IProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [project, setProject] = useState<IProject>()
  const [projects, setProjects] = useState<IProject[]>([])
  const { getAccessTokenSilently } = useAuth0()

  const getProjects = async (workspaceId: string) => {
    setLoading(true)
    const token = await getAccessTokenSilently()

    const response: any = await fetchApi(
      `${apiUrl}/workspaces/${workspaceId}/projects`,
      token,
      nodeEnv,
    )

    setProjects(response.data)
    setLoading(false)
  }

  useEffect(() => {
    const workspaceID = getWorkspaceID()
    if (workspaceId || workspaceID) {
      // clear all project state when workspaceId changed
      setProjects([])
      setProject(undefined)
      getProjects(workspaceId || workspaceID!)
    }
  }, [workspaceId])

  useEffect(() => {
    // get current projectID if user visiting current project page
    const projectId = getProjectID()

    if (projectId) {
      const project = projects?.find((val) => val.id === projectId)

      if (project) setProject(project)
    }
  }, [loading])

  return (
    <Select
      disabled={loading}
      value={project?.id}
      onValueChange={(projectId) => {
        if (projectId !== 'not-found') {
          setProjectID(projectId) // save to localStorage

          // save localState
          const project = projects?.find((val) => val.id === projectId)
          if (project) {
            setProject(project)

            // send callback to chat-input.tsx
            onSelect(project)
          }
        }
      }}>
      <SelectTrigger className="focus:ring-transparent, rounded-sm focus:ring-0">
        <div className="pe-1">
          {loading ? 'Loading...' : project?.name || 'Select Project'}
          <Badge variant="secondary" className="ml-2">
            {project?.llm}
          </Badge>
        </div>
      </SelectTrigger>
      <SelectContent>
        {projects?.length === 0 && <SelectItem value="not-found">Not Found</SelectItem>}
        {projects?.map((project) => {
          return (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
