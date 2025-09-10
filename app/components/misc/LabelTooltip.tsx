/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export function LabelTooltip({ labels }: { labels: any[] }) {
  const truncateValue = (value: string, length = 20) => {
    return value.length > length ? `${value.slice(0, length)}...` : value
  }

  const labelsObject = (() => {
    try {
      return Object.fromEntries(labels)
    } catch {
      return {}
    }
  })()

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="truncate text-start">
            {truncateValue(`${labels[0][0]}: ${labels[0][1]}`)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="z-20 max-w-sm px-3 py-2" align="start" side="bottom">
          <h1 className="mb-2 font-medium">Labels</h1>
          <pre className="max-h-60 overflow-auto rounded bg-secondary p-2 text-xs leading-relaxed text-foreground">
            {JSON.stringify(labelsObject, null, 2)}
          </pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
