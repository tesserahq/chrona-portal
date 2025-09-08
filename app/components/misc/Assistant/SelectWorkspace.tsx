/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getWorkspaceID, setWorkspaceID } from '@/libraries/storage'
import { IWorkspace } from '@/types/workspace'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

interface IProps {
  apiUrl: string
  nodeEnv: NodeENVType
  onSelect: (workspaceId: string) => void
}

export default function SelectWorkspaceAssistant({ apiUrl, nodeEnv, onSelect }: IProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [workspace, setWorkspace] = useState<IWorkspace>()
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>()
  const { getAccessTokenSilently } = useAuth0()

  const getWorksapces = async () => {
    setLoading(true)
    const token = await getAccessTokenSilently()

    const response: any = await fetchApi(`${apiUrl}/workspaces`, token, nodeEnv)

    setWorkspaces(response.data)
    setLoading(false)
  }

  useEffect(() => {
    getWorksapces()
  }, [])

  useEffect(() => {
    const workspaceId = getWorkspaceID()
    const workspace = workspaces?.find((val) => val.id === workspaceId)

    if (workspace) setWorkspace(workspace)
  }, [loading])

  return (
    <Select
      disabled={loading}
      value={workspace?.id}
      onValueChange={(workspaceId) => {
        if (workspaceId !== 'not-found') {
          setWorkspaceID(workspaceId) // save to localStorage

          // save localState
          const workspace = workspaces?.find((val) => val.id === workspaceId)
          if (workspace) {
            setWorkspace(workspace)

            // send callback to chat-input.tsx
            onSelect(workspace.id)
          }
        }
      }}>
      <SelectTrigger className="rounded-sm focus:ring-0 focus:ring-transparent">
        <div className="pe-1">
          {loading ? 'Loading...' : workspace?.name || 'Select Workspace'}
        </div>
      </SelectTrigger>
      <SelectContent>
        {workspaces?.length === 0 && <SelectItem value="not-found">Not Found</SelectItem>}
        {workspaces?.map((workspace) => {
          return (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
