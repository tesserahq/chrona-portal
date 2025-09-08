import { Dot } from 'lucide-react'
import { AvatarImage, Avatar } from '@/components/ui/avatar'

interface IProps {
  showAvatar?: boolean
}

export function TypingIndicator({ showAvatar = true }: IProps) {
  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white p-1 dark:bg-secondary">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/images/logo.png" />
          </Avatar>
        </div>
      )}
      <div className="justify-left flex space-x-1">
        <div className="rounded-xl border border-border bg-white p-2 shadow-sm dark:bg-secondary">
          <div className="flex -space-x-2.5">
            <Dot className="h-5 w-5 animate-typing-dot-bounce" />
            <Dot className="h-5 w-5 animate-typing-dot-bounce [animation-delay:90ms]" />
            <Dot className="h-5 w-5 animate-typing-dot-bounce [animation-delay:180ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}
