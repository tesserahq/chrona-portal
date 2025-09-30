/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { TagsPreview } from '../TagsPreview'
import { MarkdownRenderer } from '../Markdown/MarkdownRender'
import { EntryUpdateCard } from '../EntryUpdateCard'
import { IEntry } from '@/types/entry'
import { MessageSquare, LinkIcon } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from '@remix-run/react'

interface FuncProps {
  onOpen: (entry: IEntry) => void
  onClose: () => void
}

const EntryInformation: React.ForwardRefRenderFunction<FuncProps> = (_, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [entry, setEntry] = useState<IEntry | null>(null)

  useImperativeHandle(ref, () => ({
    onOpen(entry) {
      setEntry(entry)
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
          <DialogTitle className="text-balance text-xl font-bold text-foreground">
            {entry?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-0 pt-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto p-6 pt-2">
                <MarkdownRenderer>{entry?.body || ''}</MarkdownRenderer>
              </CardContent>
            </Card>

            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-base">Updates ({entry?.entry_updates.length})</span>
              </div>

              {entry?.entry_updates.map((entryUpdate) => (
                <EntryUpdateCard key={entryUpdate.id} entryUpdate={entryUpdate} />
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Detail</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="d-list">
                  {/* Author */}
                  <div className="d-item">
                    <dt className="d-label">Author</dt>
                    <dd className="d-content">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry?.source_author?.author.avatar_url} />
                          <AvatarFallback>
                            {entry?.source_author?.author.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{entry?.source_author?.author.display_name}</span>
                      </div>
                    </dd>
                  </div>

                  {/* Assignee */}
                  {entry?.source_assignee && (
                    <div className="d-item">
                      <dt className="d-label">Assignee</dt>
                      <dd className="d-content">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={entry?.source_assignee?.author.avatar_url}
                            />
                            <AvatarFallback>
                              {entry?.source_assignee?.author.display_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{entry?.source_assignee?.author.display_name}</span>
                        </div>
                      </dd>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="d-item">
                    <dt className="d-label">Tags</dt>
                    <dd className="d-content">
                      <TagsPreview tags={entry?.tags || []} maxVisible={3} />
                    </dd>
                  </div>

                  {/* Meta data */}
                  <div className="d-item">
                    <dt className="d-label">Meta Data</dt>
                    <dd className="d-content">
                      <div className="flex flex-wrap gap-2">
                        {entry?.meta_data?.links?.map((link, key) => {
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <div className="w-4">
                                {link?.icon ? (
                                  <FontAwesomeIcon
                                    icon={['fab', link.icon as any]}
                                    size="1x"
                                  />
                                ) : (
                                  <LinkIcon size={15} />
                                )}
                              </div>
                              <Link
                                to={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline">
                                {link?.text}
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    </dd>
                  </div>

                  {/* Created At */}
                  <div className="d-item">
                    <dt className="d-label">Created At</dt>
                    <dd className="d-content">
                      {entry?.source_created_at &&
                        format(entry?.source_created_at, 'PPpp')}
                    </dd>
                  </div>

                  {/* Updated At */}
                  <div className="d-item">
                    <dt className="d-label">Updated At</dt>
                    <dd className="d-content">
                      {entry?.source_updated_at &&
                        format(entry?.source_updated_at, 'PPpp')}
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(EntryInformation)
