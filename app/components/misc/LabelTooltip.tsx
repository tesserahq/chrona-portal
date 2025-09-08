/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export function LabelTooltip({ labels }: { labels: any[] }) {
  const truncateValue = (value: string, length = 20) => {
    return value.length > length ? `${value.slice(0, length)}...` : value
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary">
            {truncateValue(`${labels[0][0]}:${labels[0][1]}`)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="px-3 py-2" align="start" side="bottom">
          <h1 className="mb-2 font-medium">Labels</h1>
          <div className="flex flex-col items-start">
            {labels.map(([key, value]: any) => (
              <div key={key} className="mb-1">
                <Badge variant="secondary" className="text-sm">
                  {key}
                </Badge>
                <span className="text-muted-foreground">:</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
