import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tag } from 'lucide-react'

interface TagsPreviewProps {
  tags: string[]
  className?: string
  maxVisible?: number
}

export const TagsPreview = ({
  tags,
  className = '',
  maxVisible = 1,
}: TagsPreviewProps) => {
  const visibleTags = tags.slice(0, maxVisible)
  const remainingTags = tags.slice(maxVisible)

  if (tags.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {visibleTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          <Tag className="mr-1 h-3 w-3" />
          {tag}
        </Badge>
      ))}

      {remainingTags.length > 0 && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="cursor-pointer text-xs">
                +{remainingTags.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="px-3 py-2" side="bottom">
              <h1 className="mb-2 font-medium">Tags</h1>
              <div className="flex max-w-xs flex-wrap gap-1">
                {remainingTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
