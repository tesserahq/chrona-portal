import { MarkdownRenderer } from '@/components/misc/Markdown/MarkdownRender'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EntryUpdates } from '@/types/entry'
import { cn } from '@/utils/misc'
import { format } from 'date-fns'
import { TagsPreview } from './TagsPreview'

interface EntryUpdateCardProps {
  entryUpdate: EntryUpdates
  className?: string
}

export const EntryUpdateCard = ({ entryUpdate, className }: EntryUpdateCardProps) => {
  return (
    <Card className={cn('mb-3 shadow-sm', className)}>
      <CardHeader className="pb-3 pt-4">
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

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {entryUpdate.source_author.author.display_name}
              </span>
              <span className="text-muted-foreground">
                {entryUpdate.source_author.author.email}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-muted-foreground">
                Created {format(entryUpdate.source_created_at, 'PPpp')}
              </span>
              {entryUpdate.source_created_at !== entryUpdate.source_updated_at && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    Updated {format(entryUpdate.source_updated_at, 'PPpp')}
                  </span>
                </>
              )}
              {entryUpdate.tags.length > 0 && (
                <TagsPreview tags={entryUpdate.tags} showAll />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex gap-3 overflow-auto px-6 pt-1 text-sm">
        <div className="h-10 w-10"></div>
        <MarkdownRenderer>{entryUpdate.body}</MarkdownRenderer>
      </CardContent>
    </Card>
  )
}
