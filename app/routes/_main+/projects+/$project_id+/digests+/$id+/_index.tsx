/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { MarkdownRenderer } from '@/components/misc/Markdown/MarkdownRender'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Separator from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigest } from '@/types/digest'
import { IEntry } from '@/types/entry'
import { useLoaderData, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { CalendarDays, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Tags = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary">
          <span className="font-normal">{tag}</span>
        </Badge>
      ))}
    </div>
  )
}

export const Participants = ({ digest }: { digest: IDigest | null }) => {
  if (!digest?.entries) return null

  // Extract unique authors from entries and their updates
  const getUniqueParticipants = () => {
    const participants = new Map<string, { author: any; type: 'entry' | 'update' }>()

    // Add authors from entries
    digest.entries?.forEach((entry) => {
      // Add entry author
      if (entry.source_author?.author) {
        participants.set(entry.source_author.author.id, {
          author: entry.source_author.author,
          type: 'entry',
        })
      }

      // Add entry assignee if different from author
      if (
        entry.source_assignee?.author &&
        entry.source_assignee.author.id !== entry.source_author?.author?.id
      ) {
        participants.set(entry.source_assignee.author.id, {
          author: entry.source_assignee.author,
          type: 'entry',
        })
      }

      // Add authors from entry updates
      entry.entry_updates?.forEach((update) => {
        if (update.source_author?.author) {
          participants.set(update.source_author.author.id, {
            author: update.source_author.author,
            type: 'update',
          })
        }
      })
    })

    return Array.from(participants.values())
  }

  const participants = getUniqueParticipants()

  if (participants.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Participants</h3>
        <span className="text-lg text-muted-foreground">({participants.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {participants.map((participant) => (
          <div
            key={participant.author.id}
            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 shadow-sm">
            <Avatar className="h-8 w-8">
              <AvatarImage src={participant.author.avatar_url} />
              <AvatarFallback className="text-xs">
                {participant.author.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {participant.author.display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {participant.author.email}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DigestDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [digest, setDigest] = useState<IDigest | null>(null)
  const [entry, setEntry] = useState<IEntry | null>(null)

  const fetchDigest = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/digests/${params.id}?include=entries`
      const response: IDigest = await fetchApi(url, token!, nodeEnv)

      setDigest(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && token) {
      fetchDigest()
    }
  }, [params.id, token])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <>
      <div className="grid animate-slide-up gap-2 lg:grid-cols-4 lg:gap-10">
        <div className="lg:col-span-2">
          <h1 className="mb-5 animate-slide-up text-balance text-3xl font-bold text-foreground">
            {digest?.title}
          </h1>

          <Card style={{ borderLeft: `4px solid ${digest?.digest_generation_config?.ui_format?.color}` }}>
            <CardHeader className="space-y-3">
              {/* Digest Metadata */}
              <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays size={12} />
                  <span className="text-xs">
                    Created {format(digest?.created_at || '', 'PPpp')}
                  </span>
                </div>
                <Separator orientation="vertical" />
                <div className="flex items-center gap-1">
                  <CalendarDays size={12} />
                  <span className="text-xs">
                    Updated {format(digest?.updated_at || '', 'PPpp')}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              {digest?.body ? (
                <MarkdownRenderer>{digest?.body}</MarkdownRenderer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>No content available for this digest?.</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="mt-2 flex justify-end gap-1">
              <Tags tags={digest?.tags || []} />
            </CardFooter>
          </Card>

          {/* Participants */}
          <div className="mt-6">
            <Participants digest={digest} />
          </div>
        </div>

        {/* Entries */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 mt-4 text-xl font-semibold">Entries</h2>
          {digest?.entries?.map((entry) => {
            return (
              <div
                key={entry.id}
                className="mb-3 cursor-pointer"
                onClick={() => setEntry(entry)}>
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>

                        <div className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Created {format(entry?.created_at || '', 'PPpp')}
                          </span>
                        </div>
                      </div>

                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar>
                              <AvatarImage
                                src={entry?.source_author?.author.avatar_url}
                              />
                              <AvatarFallback>
                                {entry?.source_author?.author.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent align="center" side="left">
                            <span className="text-xs">
                              {entry?.source_author?.author.display_name}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="line-clamp-2 p-6 pt-0 text-muted-foreground">
                    {entry.body}
                  </CardContent>

                  <CardFooter className="mt-2 flex justify-end gap-1">
                    <Tags tags={digest?.tags || []} />
                  </CardFooter>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={entry !== null} onOpenChange={() => setEntry(null)}>
        <DialogContent className="max-h-[80%] w-full max-w-4xl overflow-auto bg-card">
          <DialogHeader className="mb-3 space-y-4">
            <div>
              <DialogTitle className="mb-1 text-xl">{entry?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Created {format(entry?.created_at || new Date(), 'PPpp')}
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated {format(entry?.updated_at || new Date(), 'PPpp')}
                </span>
              </div>
            </div>

            <Tags tags={entry?.tags || []} />

            <div className="grid gap-2 lg:grid-cols-3">
              {/* Show author if it's not the same as the assignee */}
              {entry?.source_author?.author?.id !==
                entry?.source_assignee?.author?.id && (
                <div>
                  <p className="mb-2 text-xs font-semibold">Author</p>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={entry?.source_author?.author.avatar_url} />
                      <AvatarFallback>
                        {entry?.source_author?.author.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {entry?.source_author?.author.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry?.source_author?.author.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignee */}
              <div>
                <p className="mb-2 text-xs font-semibold">Assignee</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={entry?.source_assignee?.author.avatar_url} />
                    <AvatarFallback>
                      {entry?.source_assignee?.author.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {entry?.source_assignee?.author.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry?.source_assignee?.author.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div>
                <p className="mb-1 text-xs font-semibold">Source</p>
                <p>{entry?.source.name}</p>
              </div>
            </div>
          </DialogHeader>

          <div>
            <MarkdownRenderer>{entry?.body || ''}</MarkdownRenderer>
          </div>

          <h3 className="mt-4 flex items-center gap-2 text-base font-semibold text-foreground">
            Entry Updates
          </h3>
          {entry?.entry_updates.map((entryUpdate) => (
            <Card key={entryUpdate.id} className="shadow-none">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        entryUpdate.source_author.author.avatar_url ||
                        '/images/default-avatar.jpg'
                      }
                      alt={entryUpdate.source_author.author.display_name}
                    />
                    <AvatarFallback>
                      {entryUpdate.source_author.author.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-foreground">
                        {entryUpdate.source_author.author.display_name}
                      </span>
                      <span className="text-muted-foreground">
                        {entryUpdate.source_author.author.email}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {format(entryUpdate.source_created_at, 'PPpp')}
                      </span>
                      {entryUpdate.source_created_at !==
                        entryUpdate.source_updated_at && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            edited {format(entryUpdate.source_updated_at, 'PPpp')}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Comment Tags */}
                    <Tags tags={entryUpdate.tags} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <MarkdownRenderer>{entryUpdate.body}</MarkdownRenderer>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>
    </>
  )
}
