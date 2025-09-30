/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkdownRenderer } from '@/components/misc/Markdown/MarkdownRender'
import { StatusBadge } from '@/components/misc/StatusBadge'
import { TagsPreview } from '@/components/misc/TagsPreview'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Separator from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { IDigest } from '@/types/digest'
import { format } from 'date-fns'
import { CalendarDays, Users } from 'lucide-react'

interface DigestParticipantsProps {
  digest: IDigest | null
}

const DigestParticipants = ({ digest }: DigestParticipantsProps) => {
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

interface DigestViewProps {
  digest: IDigest | null
  onEntryClick?: (entry: any) => void
  showActions?: boolean
  actions?: React.ReactNode
}

export const DigestView = ({
  digest,
  onEntryClick,
  showActions = false,
  actions,
}: DigestViewProps) => {
  if (!digest) return null

  return (
    <div className="grid animate-slide-up gap-2 lg:grid-cols-4 lg:gap-10">
      <div className="lg:col-span-2">
        <h1 className="mb-5 text-balance text-xl font-bold text-foreground lg:text-2xl">
          {digest.title}
        </h1>

        <Card
          style={{
            borderLeft: `4px solid ${digest.digest_generation_config?.ui_format?.color}`,
          }}>
          <CardHeader className="space-y-3 pb-3 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays size={12} />
                  <span className="text-xs">
                    Created {digest.created_at && format(digest.created_at, 'PPpp')}
                  </span>
                </div>
                <Separator orientation="vertical" />
                <div className="flex items-center gap-1">
                  <CalendarDays size={12} />
                  <span className="text-xs">
                    Updated {digest.updated_at && format(digest.updated_at, 'PPpp')}
                  </span>
                </div>
                {digest.status === 'draft' && (
                  <StatusBadge status={digest.status} className="ml-1" />
                )}
              </div>

              {showActions && actions}
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <MarkdownRenderer>{digest.body || ''}</MarkdownRenderer>
          </CardContent>

          <CardFooter className="mt-2 flex justify-end gap-1">
            <TagsPreview tags={digest.tags || []} showAll />
          </CardFooter>
        </Card>

        {/* Participants */}
        <div className="mt-6">
          <DigestParticipants digest={digest} />
        </div>
      </div>

      {/* Entries */}
      <div className="lg:col-span-2">
        <h2 className="mb-3 mt-4 text-xl font-semibold">Entries</h2>
        {digest.entries?.map((entry) => {
          return (
            <div
              key={entry.id}
              className="mb-3 cursor-pointer"
              onClick={() => onEntryClick?.(entry)}>
              <Card className="shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{entry.title}</CardTitle>

                      <div className="flex items-center gap-1">
                        <CalendarDays size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Created {format(entry?.created_at || '', 'PPpp')}
                        </span>

                        <div className="ml-2">
                          <TagsPreview tags={digest.tags || []} showAll />
                        </div>
                      </div>
                    </div>

                    <div className="flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="relative z-10 transition-all duration-200 hover:z-50 hover:scale-110 hover:ring-4 hover:ring-primary/20 hover:grayscale-0">
                              <AvatarImage
                                src={entry?.source_author?.author.avatar_url}
                              />
                              <AvatarFallback>
                                {entry?.source_author?.author.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent align="center">
                            <span className="text-xs">
                              Author: {entry?.source_author?.author.display_name}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="relative z-20 transition-all duration-200 hover:z-50 hover:scale-110 hover:ring-4 hover:ring-primary/20 hover:grayscale-0">
                              <AvatarImage
                                src={entry?.source_assignee?.author.avatar_url}
                              />
                              <AvatarFallback>
                                {entry?.source_assignee?.author.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent align="center">
                            <span className="text-xs">
                              Assignee: {entry?.source_assignee?.author.display_name}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mb-2 line-clamp-1 p-6 pt-0 text-sm text-muted-foreground">
                  {entry.body}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
