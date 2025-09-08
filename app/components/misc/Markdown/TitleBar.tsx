export default function TitleBar({ title, aside }: { title: string; aside?: string }) {
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between">
        {title && <h4 className="font-xs text-secondary-foreground">{title}</h4>}
        {aside && (
          <h6 className="text-xs font-medium text-secondary-foreground">{aside}</h6>
        )}
      </div>
    </div>
  )
}
