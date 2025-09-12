/* eslint-disable @typescript-eslint/no-explicit-any */
import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getProjectID, getWorkspaceID } from '@/libraries/storage'
import { IProject } from '@/types/project'
import { useAuth0 } from '@auth0/auth0-react'
import { useParams } from '@remix-run/react'
import {
  MessageCircleQuestion,
  SearchCode,
  Send,
  Settings,
  Settings2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import SelectProjectAssistant from '../Assistant/SelectProject'
import SelectWorkspaceAssistant from '../Assistant/SelectWorkspace'
import {
  ItemTool,
  ItemToolInitialState,
  ItemToolPrompt,
  ItemToolPromptList,
} from './Tools'

interface IProps {
  placeholder: string
  isChatStarted: boolean
  debug: boolean
  messages: any
  assistantMode?: boolean
  apiUrl?: string
  nodeEnv?: NodeENVType
  nextQuestionSuggestions: boolean
  disableTools: boolean
  setDebug: () => void
  setNextQuestionSuggestions: () => void
  setDisableTools: () => void
  onSendMessage: (val: string) => void
  onSelectPromptId: (promptId: string) => void
  onSelectProjectId?: (projectId: string) => void
  onSetInitialState?: (initialState: string) => void
  initialState?: string
}

export default function ChatInput({
  onSendMessage,
  placeholder,
  isChatStarted,
  debug,
  setDebug,
  messages,
  assistantMode,
  apiUrl,
  nodeEnv,
  onSelectProjectId,
  nextQuestionSuggestions,
  setNextQuestionSuggestions,
  disableTools,
  setDisableTools,
  onSelectPromptId,
  onSetInitialState,
  initialState,
}: IProps) {
  const { getAccessTokenSilently } = useAuth0()
  const handleApiError = useHandleApiError()
  const params = useParams()
  const [userMessage, setUserMessage] = useState<string>('')
  const inputRef = useRef<any>()
  const [workspaceId, setWorkspaceId] = useState<string>('') // to update project selects
  const [prompts, setPrompts] = useState<any[]>([])
  const [promptSelected, setPromptSelected] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showPrompt, setShowPrompt] = useState<boolean>(false)
  const [showPopover, setShowPopover] = useState<boolean>(false)
  const [, setProject] = useState<IProject>()
  const [, setIsLoadingProject] = useState<boolean>(true)

  const fetchProject = async () => {
    setIsLoadingProject(true)

    try {
      const token = await getAccessTokenSilently()
      const projectId = getProjectID()
      const project = await fetchApi(`${apiUrl}/projects/${projectId}`, token, nodeEnv!)

      setProject(project)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoadingProject(false)
    }
  }

  const fetchPrompts = async () => {
    setIsLoading(true)
    setPromptSelected(undefined)
    setPrompts([])

    try {
      const token = await getAccessTokenSilently()
      const workspaceId = getWorkspaceID()

      const response = await fetchApi(
        `${apiUrl}/workspaces/${workspaceId}/prompts`,
        token,
        nodeEnv!,
      )
      setPrompts(response.data)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    inputRef.current.focus()
  }, [messages])

  useEffect(() => {
    fetchPrompts()
  }, [workspaceId])

  useEffect(() => {
    fetchProject()
  }, [params.project_id])

  return (
    <div className="sticky bottom-0 w-full animate-slide-up gap-2 rounded-lg bg-background dark:bg-background">
      <div className="relative flex h-32 flex-col justify-between rounded-lg border border-border bg-white dark:bg-secondary">
        <input
          ref={inputRef}
          value={userMessage}
          placeholder={placeholder}
          autoFocus
          className="w-full border-none bg-transparent p-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-none focus-visible:ring-0 focus-visible:ring-transparent"
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') {
              e.target.focus()
              setUserMessage('')
              onSendMessage(e.target.value)
            }
          }}
        />
        <div className="flex justify-between p-3">
          <div className="flex justify-between gap-2">
            <Popover
              open={showPopover}
              onOpenChange={(val) => {
                setShowPopover(val)
                if (showPrompt) {
                  setShowPrompt(false)
                }
              }}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <Settings2 />
                  Tools
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-1" align="start">
                {showPrompt ? (
                  <ItemToolPromptList
                    onBack={() => setShowPrompt(false)}
                    promptSelected={promptSelected!}
                    prompts={prompts}
                    onSelected={(prompt) => {
                      setPromptSelected(prompt)
                      setShowPrompt(false)
                      setShowPopover(false)
                      onSelectPromptId(prompt.prompt_id)
                    }}
                  />
                ) : (
                  <>
                    <ItemTool
                      name="Debug"
                      icon={<SearchCode size={18} />}
                      value={debug}
                      onCheckedChange={setDebug}
                    />
                    <ItemTool
                      name="Question Suggestions"
                      icon={<MessageCircleQuestion size={18} />}
                      value={nextQuestionSuggestions}
                      onCheckedChange={setNextQuestionSuggestions}
                    />
                    <ItemTool
                      name="Disable Tools"
                      icon={<Settings size={18} />}
                      value={disableTools}
                      onCheckedChange={setDisableTools}
                    />
                    <Separator className="my-1" />
                    <ItemToolInitialState
                      onSetInitialState={onSetInitialState || (() => {})}
                      currentInitialState={initialState}
                    />
                    <ItemToolPrompt
                      isLoading={isLoading}
                      promptSelected={promptSelected!}
                      onShowPrompt={() => !isLoading && setShowPrompt(true)}
                    />
                  </>
                )}
              </PopoverContent>
            </Popover>

            {promptSelected && (
              <Button
                variant="outline"
                className="group border-primary bg-accent hover:text-primary"
                onClick={() => setPromptSelected(undefined)}>
                {promptSelected.prompt_id}
                <div className="hidden group-hover:block">
                  <X size={18} />
                </div>
              </Button>
            )}

            {initialState !== '' && (
              <Button
                variant="outline"
                className="group border-primary bg-accent hover:text-primary"
                onClick={() => onSetInitialState!('')}>
                State
                <div className="hidden group-hover:block">
                  <X size={18} />
                </div>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {assistantMode && (
              <>
                <SelectWorkspaceAssistant
                  apiUrl={apiUrl!}
                  nodeEnv={nodeEnv!}
                  onSelect={setWorkspaceId}
                />

                <SelectProjectAssistant
                  apiUrl={apiUrl!}
                  nodeEnv={nodeEnv!}
                  workspaceId={workspaceId}
                  onSelect={(project) => {
                    if (onSelectProjectId) {
                      onSelectProjectId(project.id)
                      setProject(project)
                    }
                  }}
                />
              </>
            )}

            <div>
              <Button
                size="icon"
                type="submit"
                disabled={userMessage === ''}
                onClick={() => {
                  if (userMessage) {
                    onSendMessage(userMessage)
                    setUserMessage('')
                    inputRef.current.focus()
                  }
                }}>
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>

        {!isChatStarted && <BorderBeam size={100} />}
      </div>
    </div>
  )
}
