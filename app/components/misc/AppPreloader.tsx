import { cn } from '@/utils/misc'

export function AppPreloader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'app-preloader grid h-full w-full place-content-center bg-background',
        className,
      )}>
      <div className="app-preloader-inner relative inline-block size-48"></div>
    </div>
  )
}
