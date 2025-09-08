interface IEmptyContentProps {
  image: string
  title: string
  description?: string
  children?: React.ReactNode
}

export default function EmptyContent({
  image,
  title,
  description,
  children,
}: IEmptyContentProps) {
  return (
    <div className="animate-slide-up flex h-full w-full flex-col items-center justify-center gap-4 lg:h-[500px] lg:flex-row">
      <img src={image} alt={title} className="w-96 rounded-lg" />
      <div className="max-w-[500px] flex-col items-center lg:items-start">
        <h1 className="mt-3 text-3xl font-semibold dark:text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-base opacity-70 dark:text-foreground">{description}</p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
