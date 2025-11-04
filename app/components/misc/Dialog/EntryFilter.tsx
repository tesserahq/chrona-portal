import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/misc'
import { Plus, Tag, Trash2, X } from 'lucide-react'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { DaterangePicker } from '../Datepicker/DaterangePicker'
import { formatDateRangeToUTC } from '@/utils/date-format'

interface FuncProps {
  onOpen: () => void
}

interface IProps {
  initialTags?: string[]
  initialSourceCreatedAt?: { from: string | null; to: string | null }
  initialSourceUpdatedAt?: { from: string | null; to: string | null }
  onFilter: (
    tags: string[],
    sourceCreatedAt: { from: string | null; to: string | null },
    sourceUpdatedAt: { from: string | null; to: string | null },
  ) => void
}

const EntryFilter: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  {
    onFilter,
    initialTags = [],
    initialSourceCreatedAt = { from: null, to: null },
    initialSourceUpdatedAt = { from: null, to: null },
  }: IProps,
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState<string>('')
  const [sourceCreatedAt, setSourceCreatedAt] = useState<{
    from: string | null
    to: string | null
  }>(initialSourceCreatedAt)
  const [sourceUpdatedAt, setSourceUpdatedAt] = useState<{
    from: string | null
    to: string | null
  }>(initialSourceUpdatedAt)

  useImperativeHandle(ref, () => ({
    onOpen() {
      // Reset to initial values when opening
      setTags(initialTags)
      setSourceCreatedAt(initialSourceCreatedAt)
      setSourceUpdatedAt(initialSourceUpdatedAt)
      setOpen(true)
    },
  }))

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (
    tag: string,
    tagList: string[],
    setTag: (tags: string[]) => void,
  ) => {
    setTag(tagList.filter((t) => t !== tag))
  }

  const onClose = () => {
    setOpen(false)
    setTags([])
    setNewTag('')
    setSourceCreatedAt({ from: null, to: null })
    setSourceUpdatedAt({ from: null, to: null })
  }

  const onSubmit = () => {
    // Format date range to UTC
    const source_created_at = {
      from: sourceCreatedAt.from ? formatDateRangeToUTC(sourceCreatedAt.from, false) : null,
      to: sourceCreatedAt.to ? formatDateRangeToUTC(sourceCreatedAt.to, true) : null,
    }

    const source_updated_at = {
      from: sourceUpdatedAt.from ? formatDateRangeToUTC(sourceUpdatedAt.from, false) : null,
      to: sourceUpdatedAt.to ? formatDateRangeToUTC(sourceUpdatedAt.to, true) : null,
    }

    onFilter(tags, source_created_at, source_updated_at)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="w-full overflow-auto bg-card">
        <DialogHeader>
          <DialogTitle>Entry Filter</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {/* Tags */}
          <div className="mb-3">
            <Label className="mb-1">Tags</Label>
            <div className={cn('flex flex-wrap gap-2', tags.length > 0 && 'mt-2')}>
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <X
                    size={12}
                    className="ml-2 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag, tags, setTags)}
                  />
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim()}>
                <Plus />
                Add
              </Button>
            </div>
          </div>

          {/* Source Created At */}
          <div className="mb-3 flex flex-col">
            <Label>Source Created At</Label>
            <div className="flex items-center gap-2">
              <DaterangePicker
                initialFrom={sourceCreatedAt.from}
                initialTo={sourceCreatedAt.to}
                className="w-full"
                onChange={(start, end) => {
                  setSourceCreatedAt({
                    from: start?.toString() || null,
                    to: end?.toString() || null,
                  })
                }}
              />
              {(sourceCreatedAt.from || sourceCreatedAt.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSourceCreatedAt({ from: null, to: null })}>
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>

          {/* Source Updated At */}
          <div className="mb-3 flex flex-col">
            <Label>Source Updated At</Label>
            <div className="flex items-center gap-2">
              <DaterangePicker
                initialFrom={sourceUpdatedAt.from}
                initialTo={sourceUpdatedAt.to}
                className="w-full"
                onChange={(start, end) => {
                  setSourceUpdatedAt({
                    from: start?.toString() || null,
                    to: end?.toString() || null,
                  })
                }}
              />
              {(sourceUpdatedAt.from || sourceUpdatedAt.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSourceUpdatedAt({ from: null, to: null })}>
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={onSubmit}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(EntryFilter)
