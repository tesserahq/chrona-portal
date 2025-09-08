import {
  BadgeCheck,
  CirclePause,
  CirclePlay,
  CircleX,
  History,
  Loader,
  MonitorPlay,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { cn } from '@/utils/misc'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export function BadgePluginState({
  state,
  state_description,
}: {
  state: string
  state_description?: string
}) {
  if (state === 'error') {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="outline"
              className="gap-1 border border-red-600 dark:border-red-500">
              <CircleX size={12} className="text-red-600 dark:text-red-500" />
              <span className="capitalize text-red-600 dark:text-red-500">{state}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent align="end" side="bottom" className="max-w-64">
            {state_description}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      {state === 'initializing' && (
        <Loader size={12} className="animate-spin text-amber-600 dark:text-amber-500" />
      )}
      {state === 'registered' && (
        <BadgeCheck size={12} className="text-green-600 dark:text-green-500" />
      )}
      {state === 'starting' && (
        <CirclePlay size={12} className="text-green-600 dark:text-green-500" />
      )}
      {state === 'running' && (
        <MonitorPlay size={12} className="text-green-600 dark:text-green-500" />
      )}
      {state === 'stopped' && (
        <CirclePause size={12} className="text-red-600 dark:text-red-500" />
      )}
      {state === 'error' && (
        <CircleX size={12} className="text-red-600 dark:text-red-500" />
      )}
      {state === 'idle' && <History size={12} />}
      <span
        className={cn(
          'capitalize',
          ['registered', 'starting', 'running'].includes(state) &&
            'text-green-600 dark:text-green-500',
          ['stopped', 'error'].includes(state) && 'text-red-600 dark:text-red-500',
          state === 'initializing' && 'text-amber-600 dark:text-amber-500',
        )}>
        {state}
      </span>
    </Badge>
  )
}
