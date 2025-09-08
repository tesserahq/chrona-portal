import { cn } from '@/utils/misc'

interface IProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export default function Separator({ className, orientation = 'horizontal' }: IProps) {
  return (
    <div
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
    />
  )
}
