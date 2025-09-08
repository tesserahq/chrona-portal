/* eslint-disable @typescript-eslint/no-explicit-any */
import ChatInput from '@/components/misc/Chat/ChatInput'
import ChatMessage from '@/components/misc/Chat/ChatMessage'
import DialogPreviewJson from '@/components/misc/Dialog/PreviewJson'
import Header from '@/components/misc/Header'
import { MarkdownRenderer } from '@/components/misc/Markdown/MarkdownRender'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizeable'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getProjectID } from '@/libraries/storage'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { CheckCircle, Code2, Copy, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface IChat {
  content: any
  prefix: 0 | 8 | 3 // suggested_questions, sources,
  event_type?: 'sources' | 'suggested_questions' | 'agent' | 'artifact'
  role: 'user' | 'assistant'
}

interface IProps {
  apiUrl: string
  nodeEnv: NodeENVType
  assistantMode?: boolean
  identiesHostUrl?: string
}

export default function Assistant({ assistantMode, apiUrl, nodeEnv }: IProps) {
  const { getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string>('')
  const [messages, setMessages] = useState<IChat[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [debug, setDebug] = useState<boolean>(false)
  const [nextQuestionSuggestions, setNextQuestionSuggestions] = useState<boolean>(false)
  const [disableTools, setDisableTools] = useState<boolean>(false)
  const [collapsible, setCollapsible] = useState<boolean>(false)
  const dialogPreviewJsonRef = useRef<React.ElementRef<typeof DialogPreviewJson>>(null)
  const [promptId, setPromptId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [initialState, setInitialState] = useState<string>('')

  // project state
  const [projectId, setProjectId] = useState<string>('')

  // debug state
  const [copied, setCopied] = useState<boolean>(false)
  const [debugCurl, setDebugCurl] = useState<string>('')
  const [debugResponse, setdebugResponse] = useState<
    {
      question: string
      text: string[]
      data: string[]
      error: string[]
    }[]
  >([])

  const placeholder = messages.length ? 'Reply to quore...' : 'What can I assist today?'

  const parseInitialState = (initialState: string) => {
    try {
      return JSON.parse(initialState)
    } catch (error) {
      return {}
    }
  }

  const fetchToken = async (projectId: string) => {
    try {
      if (!projectId) {
        throw new Error('Project ID is required to initialize the assistant.')
      }

      const token = await getAccessTokenSilently()
      const session = await fetchApi(
        `${apiUrl}/projects/${projectId}/assistant/init`,
        token,
        nodeEnv,
        {
          method: 'POST',
        },
      )

      setSessionId(session.session_id)
      setToken(token)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const appendToChat = (chat: string) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages]

      // If the last message is from 'assistant', update it
      if (
        updatedMessages.length > 0 &&
        updatedMessages[updatedMessages.length - 1].role === 'assistant' &&
        updatedMessages[updatedMessages.length - 1].prefix === 0
      ) {
        updatedMessages[updatedMessages.length - 1].content += chat
      } else {
        // Otherwise, add a new message
        updatedMessages.push({ content: chat, prefix: 0, role: 'assistant' })
      }

      return updatedMessages
    })
  }

  // const displaySources = (source: any) => {
  //   setMessages((prevMessages) => {
  //     const updatedMessages = [...prevMessages]

  //     // If the last message is from 'assistant', update it
  //     if (
  //       updatedMessages.length > 0 &&
  //       updatedMessages[updatedMessages.length - 1].role === 'assistant' &&
  //       updatedMessages[updatedMessages.length - 1].event_type === 'sources'
  //     ) {
  //       updatedMessages[updatedMessages.length - 1].content = []
  //       updatedMessages[updatedMessages.length - 1].content = source
  //     } else {
  //       // Otherwise, add a new message
  //       updatedMessages.push({
  //         content: source,
  //         event_type: 'sources',
  //         prefix: 8,
  //         role: 'assistant',
  //       })
  //     }

  //     return updatedMessages
  //   })
  // }

  const displaySuggestedQuestions = (suggestedQuestions: any) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages]

      // If the last message is from 'assistant', update it
      if (
        updatedMessages.length > 0 &&
        updatedMessages[updatedMessages.length - 1].role === 'assistant' &&
        updatedMessages[updatedMessages.length - 1].event_type === 'suggested_questions'
      ) {
        updatedMessages[updatedMessages.length - 1].content = []
        updatedMessages[updatedMessages.length - 1].content = suggestedQuestions
      } else {
        // Otherwise, add a new message
        updatedMessages.push({
          content: suggestedQuestions,
          event_type: 'suggested_questions',
          prefix: 8,
          role: 'assistant',
        })
      }

      return updatedMessages
    })
  }

  const onSendMessage = async (message?: string) => {
    try {
      // remove suggested questions
      setMessages((prevMessage) => {
        const updateMessage = prevMessage.filter(
          (msg) => msg.event_type !== 'suggested_questions',
        )
        updateMessage.push({
          content: message,
          prefix: 0,
          role: 'user',
        })
        return updateMessage
      })
      // message to send to API
      const messageSend = messages
        .filter((msg) => msg.prefix === 0 || msg.role === 'user')
        .map((msg) => ({ role: msg.role, content: msg.content }))
      messageSend.push({ role: 'user', content: message })
      setIsLoading(true)

      const response: any = await fetch(`${apiUrl}/projects/${projectId}/assistant`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageSend,
          config: {
            next_question_suggestions: nextQuestionSuggestions,
            debug_mode: debug,
            session_id: sessionId,
            disable_tools: disableTools,
            ...(promptId && { system_prompt_id: promptId }),
            ...(initialState && { initial_state: parseInitialState(initialState) }),
          },
        }),
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      // variable to show debug tools in right side
      const res = []
      const curl =
        "```json\ncurl --location --request POST '" +
        apiUrl +
        '/projects/' +
        projectId +
        "/assistant' \\\n" +
        "--header 'Authorization: Bearer " +
        token +
        "' \\\n" +
        "--header 'Content-Type: application/json' \\\n" +
        "--data '\n" +
        JSON.stringify(
          {
            messages: messageSend,
            config: {
              next_question_suggestions: nextQuestionSuggestions,
              debug_mode: debug,
              system_prompt_id: promptId,
              disable_tools: disableTools,
              ...(initialState && { initial_state: parseInitialState(initialState) }),
            },
          },
          null,
          2,
        ) +
        "'\n"

      const textEvent: any[] = []
      const dataEvent: any[] = []
      const errorEvent: any[] = []
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // save buffer to debug response
        res.push(buffer)
        // Process complete lines
        let lineEnd
        while ((lineEnd = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, lineEnd)
          buffer = buffer.slice(lineEnd + 1)
          if (line.startsWith('0:')) {
            // Text event
            const textChunk = JSON.parse(line.slice(2))
            appendToChat(textChunk)
            textEvent.push(`0: ${textChunk}`)
          } else if (line.startsWith('8:')) {
            // Data event
            const dataStr = line.slice(2)
            const dataArray = JSON.parse(dataStr)
            if (dataArray.length > 0) {
              const data = dataArray[0]
              dataEvent.push({ 8: data })
              if (data.type === 'suggested_questions') {
                displaySuggestedQuestions(data.data)
              }
            }
          } else if (line.startsWith('3:')) {
            // Error event
            const error = JSON.parse(line.slice(2))
            toast.error(error.toString())
            errorEvent.push(`3:"${error.toString()}"`)
          }
        }
      }

      // save debug response
      setDebugCurl(curl)
      setdebugResponse([
        ...debugResponse,
        { question: message!, text: textEvent, data: dataEvent, error: errorEvent },
      ])
    } catch (error: any) {
      toast.error(error.toString())
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const projectId = getProjectID() // get from current project saved in localstorage
    if (projectId) setProjectId(projectId)
    fetchToken(projectId!)
  }, [])

  return (
    <div className="bg-background">
      {assistantMode && <Header apiUrl={apiUrl} nodeEnv={nodeEnv} />}
      <div
        className={cn(
          'relative mx-auto flex items-start gap-3 border border-muted px-5 dark:bg-background xl:max-w-[60%]',
          messages.length === 0 && 'border-none dark:bg-transparent',
          messages.length > 0 && debug && 'max-w-full xl:max-w-[80%]',
          !assistantMode && 'border-none',
          messages.length === 0 && assistantMode && 'px-36',
        )}>
        <ResizablePanelGroup
          direction="horizontal"
          className={cn(
            assistantMode ? '!h-screen pb-5 pt-[70px]' : '!h-[calc(100vh-100px)]',
          )}>
          <ResizablePanel defaultSize={50}>
            <div
              className={cn(
                'relative mr-5 flex h-full w-full animate-slide-up flex-col justify-center',
                messages.length === 0 && 'pb-52',
              )}>
              <ChatMessage
                messages={messages}
                isLoading={isLoading}
                onSendMessage={(message) => {
                  if (!projectId) {
                    toast.error('Please select project first')
                  } else {
                    onSendMessage(message)
                  }
                }}
              />

              <ChatInput
                assistantMode={assistantMode}
                messages={messages}
                apiUrl={apiUrl}
                nodeEnv={nodeEnv}
                onSelectProjectId={setProjectId}
                onSendMessage={(message) => {
                  if (!projectId) {
                    toast.error('Please select project first')
                  } else {
                    onSendMessage(message)
                  }
                }}
                isChatStarted={messages.length > 0}
                debug={debug}
                setDebug={() => setDebug(!debug)}
                placeholder={placeholder}
                onSelectPromptId={setPromptId}
                nextQuestionSuggestions={nextQuestionSuggestions}
                setNextQuestionSuggestions={() =>
                  setNextQuestionSuggestions(!nextQuestionSuggestions)
                }
                disableTools={disableTools}
                setDisableTools={() => setDisableTools(!disableTools)}
                onSetInitialState={setInitialState}
                initialState={initialState}
              />
            </div>
          </ResizablePanel>

          {messages.length > 0 && debug && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="sticky top-2 ml-3 h-full max-h-screen overflow-auto rounded-lg border border-border bg-white p-3 pr-5 shadow-sm dark:bg-secondary">
                  <Collapsible open={collapsible} onOpenChange={setCollapsible}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h1 className="text-lg font-semibold">Debug Tool</h1>
                      <div className="flex items-center justify-between">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Code2 size={20} />
                                </Button>
                              </CollapsibleTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <span>Show cURL</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDebug(!debug)}>
                          <X />
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent className="group relative">
                      <div className="absolute right-2 top-2 z-10 hidden group-hover:block">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                onClick={() => {
                                  setCopied(true)

                                  const cURL = debugCurl.replace('```json', '').trim()

                                  navigator.clipboard.writeText(cURL)
                                  toast.success('Successfully copied cURL')

                                  setTimeout(() => {
                                    setCopied(false)
                                  }, 2000)
                                }}>
                                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Copy cURL</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <MarkdownRenderer>{debugCurl}</MarkdownRenderer>
                    </CollapsibleContent>
                  </Collapsible>
                  {debugResponse.map((val, index) => {
                    return (
                      <div key={index} className="border-b py-1 last:border-b-0">
                        <Button
                          size="sm"
                          variant="link"
                          className="w-full justify-start"
                          onClick={() => dialogPreviewJsonRef.current?.onOpen(val)}>
                          {val.question}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <DialogPreviewJson ref={dialogPreviewJsonRef} />
    </div>
  )
}
