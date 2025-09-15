import { format, formatDistance } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface DatePreviewProps {
  date: string
  label: string
}

export default function DatePreview({ date, label }: DatePreviewProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-xs text-muted-foreground">
            {formatDistance(new Date(date), new Date(), {
              includeSeconds: true,
            })}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <span>
            {label} {format(date, 'PPpp')}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
