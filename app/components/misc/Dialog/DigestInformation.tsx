import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Separator from '@/components/ui/separator'
import { IDigest } from '@/types/digest'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { StatusBadge } from '../StatusBadge'
import { MarkdownRenderer } from '../Markdown/MarkdownRender'
import { TagsPreview } from '../TagsPreview'
import EntryInformation from '@/components/misc/Dialog/EntryInformation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DigestParticipants } from '@/routes/_main+/projects+/$project_id+/digests+/$id+/_index'

interface FuncProps {
  onOpen: (entries: IDigest) => void
  onClose: () => void
}

const GazetteDigest: React.ForwardRefRenderFunction<FuncProps> = (_, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [digest, setDigest] = useState<IDigest | null>(null)
  const entryRef = useRef<React.ElementRef<typeof EntryInformation>>(null)

  useImperativeHandle(ref, () => ({
    onOpen(digest) {
      setDigest(digest)
      setOpen(true)
    },

    onClose() {
      setOpen(false)
    },
  }))

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="max-h-[90%] w-full max-w-[95%] overflow-auto bg-card">
        <DialogHeader>
          <DialogTitle className="lg:text-2xl">{digest?.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 lg:grid-cols-4 lg:gap-10">
          {/* Digest */}
          <div className="lg:col-span-2">
            <Card
              style={{
                borderLeft: `4px solid ${digest?.digest_generation_config?.ui_format?.color}`,
              }}>
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      <span className="text-xs">
                        Created {digest?.created_at && format(digest.created_at, 'PPpp')}
                      </span>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      <span className="text-xs">
                        Updated
                        {digest?.updated_at && format(digest.updated_at, 'PPpp')}
                      </span>
                    </div>
                    {digest?.status === 'draft' && (
                      <StatusBadge status={digest?.status} className="ml-1" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <MarkdownRenderer>{digest?.body || ''}</MarkdownRenderer>
              </CardContent>

              <CardFooter className="mt-2 flex justify-end gap-1">
                <TagsPreview tags={digest?.tags || []} showAll />
              </CardFooter>
            </Card>

            {/* Participants */}
            <div className="mt-6">
              <DigestParticipants digest={digest} />
            </div>
          </div>

          {/* Entries */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-xl font-semibold">Entries</h2>
            {digest?.entries?.map((entry) => {
              return (
                <div
                  key={entry.id}
                  className="mb-3 cursor-pointer"
                  onClick={() => entryRef?.current?.onOpen(entry)}>
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
                              <TagsPreview tags={digest?.tags || []} showAll />
                            </div>
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
                    <CardContent className="mb-2 line-clamp-1 p-6 pt-0 text-sm text-muted-foreground">
                      {entry.body}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>

      <EntryInformation ref={entryRef} />
    </Dialog>
  )
}

export default forwardRef(GazetteDigest)
