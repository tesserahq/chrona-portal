/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/misc'
import { MarkdownRenderer } from './MarkdownRender'

interface IProps {
  value: string
  onUpdateChange: (val: string) => void
  editorHeight?: number
  name?: string
  display?: 'row' | 'col'
  autofocus?: boolean
}

export default function MarkdownEditor({
  value,
  onUpdateChange,
  editorHeight = 400,
  name,
  display = 'row',
  autofocus = false,
}: IProps) {
  const onChange = (event: any) => {
    const value = event.target.value

    onUpdateChange(value)
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-start justify-between gap-5',
        display === 'col' ? 'lg:flex-col' : 'lg:flex-row',
      )}>
      <Tabs
        defaultValue="markdown"
        className="w-full overflow-hidden rounded-sm border border-input bg-muted">
        <TabsList className="h-8 gap-0 border-none bg-transparent p-0">
          <TabsTrigger
            value="markdown"
            className="rounded-none !border-transparent py-2 text-xs !shadow-none hover:bg-transparent data-[state=active]:rounded-tr-sm data-[state=active]:!border-r-input data-[state=active]:!border-t-input data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800">
            Write
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="rounded-none !border-transparent py-2 text-xs !shadow-none hover:bg-transparent data-[state=active]:rounded-tl-sm data-[state=active]:rounded-tr-sm data-[state=active]:!border-input data-[state=active]:!border-b-transparent data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800">
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="markdown"
          className="mt-0 border-t border-input bg-white p-3 dark:bg-slate-800">
          <textarea
            className="w-full flex-grow resize-none border-none bg-transparent p-0 outline-none"
            value={value}
            name={name}
            autoFocus={autofocus}
            onChange={onChange}
            placeholder="Type here"
            style={{ height: editorHeight }}
          />
        </TabsContent>
        <TabsContent
          value="preview"
          className="mt-0 border-t border-input bg-white p-3 dark:bg-slate-800">
          <div className="overflow-scroll" style={{ height: editorHeight }}>
            <MarkdownRenderer>{value}</MarkdownRenderer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
