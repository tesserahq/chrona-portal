import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { MarkdownRenderer } from '../Markdown/MarkdownRender'
import { ArrowRight } from 'lucide-react'
import { TypingIndicator } from './TypingIndicator'
import { useEffect, useRef } from 'react'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface IChat {
  content: any
  prefix: 0 | 8 | 3 // suggested_questions, sources,
  event_type?: 'sources' | 'suggested_questions' | 'agent' | 'artifact'
  role: 'user' | 'assistant'
}

interface IProps {
  messages: IChat[]
  isLoading: boolean
  onSendMessage: (val: string) => void
}

export default function ChatMessage({ messages, isLoading, onSendMessage }: IProps) {
  const messageRef = useRef<any>()
  const { user } = useAuth0()

  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-auto pb-3',
        messages.length > 0 && 'flex-1',
        messages.length === 0 && 'overflow-hidden pb-0',
      )}>
      {messages.length === 0 ? (
        <div className="mb-5 flex h-full animate-slide-up flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2">
            <Avatar className="transition-transform duration-500 ease-in-out hover:rotate-[360deg]">
              <AvatarImage src="/images/logo.png" />
            </Avatar>
            <h1 className="text-4xl">Hi {user?.name?.split(' ')[0]}, how are you?</h1>
          </div>
        </div>
      ) : (
        <>
          {messages.map((chat, index) => {
            if (chat.role === 'user') {
              return (
                <div
                  key={index}
                  className="mb-3 ml-auto animate-slide-right rounded-lg bg-[#b8e5ea] p-3 text-secondary-foreground shadow-sm dark:bg-[#b8e5ea] dark:text-secondary lg:max-w-[50%]">
                  <MarkdownRenderer>{chat.content}</MarkdownRenderer>
                </div>
              )
            }
            return (
              <div key={index} className="mb-3 flex gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white p-1 dark:bg-secondary">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="/images/logo.png" />
                  </Avatar>
                </div>
                <div
                  className={
                    'mr-auto animate-slide-left rounded-lg border border-border bg-white p-3 shadow-sm dark:bg-secondary lg:max-w-[80%]'
                  }>
                  {chat.prefix === 0 && (
                    <MarkdownRenderer>{chat.content}</MarkdownRenderer>
                  )}
                  {chat.prefix === 8 && (
                    <>
                      {chat.event_type === 'sources' &&
                        chat.content.map((source: any) => {
                          return (
                            <div className="animate-slide-up" key={source.id}>
                              <MarkdownRenderer>{source.text}</MarkdownRenderer>
                            </div>
                          )
                        })}

                      {chat.event_type === 'suggested_questions' &&
                        chat.content.map((question: string) => {
                          return (
                            <div
                              key={question}
                              className="flex animate-slide-up cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-all duration-100 hover:bg-accent hover:text-primary"
                              onClick={() => onSendMessage(question)}>
                              <div className="w-5">
                                <ArrowRight size={15} />
                              </div>
                              <p className="italic">{question}</p>
                            </div>
                          )
                        })}
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {isLoading && <TypingIndicator />}
        </>
      )}

      <div ref={messageRef} />
    </div>
  )
}
