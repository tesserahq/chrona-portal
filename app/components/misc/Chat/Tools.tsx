import { Switch } from '@/components/ui/switch'
import { IPrompt } from '@/types/prompts'
import { cn } from '@/utils/misc'
import { ArrowLeft, Check, ChevronRight, MessageSquareCode, Database } from 'lucide-react'
import { useRef } from 'react'
import AssistantInitialState from '../Dialog/AssistantInitialState'

export const ItemTool = ({
  name,
  value,
  onCheckedChange,
  icon,
}: {
  name: string
  value: boolean
  onCheckedChange: (checked: boolean) => void
  icon: React.ReactNode
}) => {
  return (
    <div className="flex items-center justify-between rounded-md p-2 hover:bg-accent">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{name}</span>
      </div>
      <Switch checked={value} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export const ItemToolPrompt = ({
  isLoading,
  promptSelected,
  onShowPrompt,
}: {
  isLoading: boolean
  promptSelected: IPrompt
  onShowPrompt: () => void
}) => {
  return (
    <>
      <div
        className={cn(
          'flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-accent',
          isLoading && 'cursor-progress',
        )}
        onClick={onShowPrompt}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <MessageSquareCode size={18} />
              <span className="font-medium">Prompts</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-xs font-medium text-primary">
                {promptSelected?.prompt_id}
              </span>
              <ChevronRight size={20} className="text-secondary-foreground" />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export const ItemToolPromptList = ({
  prompts,
  onBack,
  onSelected,
  promptSelected,
}: {
  prompts: IPrompt[]
  onBack: () => void
  onSelected: (prompt: IPrompt) => void
  promptSelected: IPrompt
}) => {
  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-start gap-2 rounded-md p-2 hover:bg-accent"
        onClick={onBack}>
        <ArrowLeft size={18} className="text-secondary-foreground" />
        <span className="text-secondary-foreground">Prompts</span>
      </div>
      {prompts.length === 0 && (
        <div className="flex h-10 items-center justify-center">Not found</div>
      )}
      {prompts.map((val) => {
        return (
          <div
            key={val.id}
            className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-accent"
            onClick={() => onSelected(val)}>
            <div className="flex items-center gap-2">
              <MessageSquareCode size={18} />
              <span className="font-medium">{val?.prompt_id}</span>
            </div>
            {val.prompt_id === promptSelected?.prompt_id && <Check size={18} />}
          </div>
        )
      })}
    </>
  )
}

export const ItemToolInitialState = ({
  onSetInitialState,
  currentInitialState,
}: {
  onSetInitialState: (initialState: string) => void
  currentInitialState?: string
}) => {
  const dialogInitialStateRef =
    useRef<React.ElementRef<typeof AssistantInitialState>>(null)

  return (
    <div className="space-y-2">
      <div
        className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-accent"
        onClick={() => dialogInitialStateRef.current?.onOpen()}>
        <div className="flex items-center gap-2">
          <Database size={18} />
          <span className="font-medium">Initial State</span>
        </div>
        <div className="flex gap-1">
          {currentInitialState !== '' && (
            <span className="text-xs font-medium text-primary">Set</span>
          )}
          <ChevronRight
            size={20}
            className={cn('text-secondary-foreground transition-transform')}
          />
        </div>
      </div>

      <AssistantInitialState
        ref={dialogInitialStateRef}
        initialState={currentInitialState!}
        onSetInitialState={onSetInitialState}
      />
    </div>
  )
}
