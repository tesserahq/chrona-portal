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
  initialCreatedAt?: { from: string | null; to: string | null }
  initialUpdatedAt?: { from: string | null; to: string | null }
  onFilter: (
    tags: string[],
    createdAt: { from: string | null; to: string | null },
    updatedAt: { from: string | null; to: string | null },
  ) => void
}

const EntryFilter: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  {
    onFilter,
    initialTags = [],
    initialCreatedAt = { from: null, to: null },
    initialUpdatedAt = { from: null, to: null },
  }: IProps,
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState<string>('')
  const [createdAt, setCreatedAt] = useState<{
    from: string | null
    to: string | null
  }>(initialCreatedAt)
  const [updatedAt, setUpdatedAt] = useState<{
    from: string | null
    to: string | null
  }>(initialUpdatedAt)

  useImperativeHandle(ref, () => ({
    onOpen() {
      // Reset to initial values when opening
      setTags(initialTags)
      setCreatedAt(initialCreatedAt)
      setUpdatedAt(initialUpdatedAt)
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
    setCreatedAt({ from: null, to: null })
    setUpdatedAt({ from: null, to: null })
  }

  const onSubmit = () => {
    // Format date range to UTC
    const created_at = {
      from: createdAt.from ? formatDateRangeToUTC(createdAt.from, false) : null,
      to: createdAt.to ? formatDateRangeToUTC(createdAt.to, true) : null,
    }

    const updated_at = {
      from: updatedAt.from ? formatDateRangeToUTC(updatedAt.from, false) : null,
      to: updatedAt.to ? formatDateRangeToUTC(updatedAt.to, true) : null,
    }

    onFilter(tags, created_at, updated_at)
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
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus />
                Add
              </Button>
            </div>
          </div>

          {/* Created At */}
          <div className="mb-3 flex flex-col">
            <Label>Created At</Label>
            <div className="flex items-center gap-2">
              <DaterangePicker
                initialFrom={createdAt.from}
                initialTo={createdAt.to}
                className="w-full"
                onChange={(start, end) => {
                  setCreatedAt({
                    from: start?.toString() || null,
                    to: end?.toString() || null,
                  })
                }}
              />
              {(createdAt.from || createdAt.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCreatedAt({ from: null, to: null })}>
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>

          {/* Updated At */}
          <div className="mb-3 flex flex-col">
            <Label>Updated At</Label>
            <div className="flex items-center gap-2">
              <DaterangePicker
                initialFrom={updatedAt.from}
                initialTo={updatedAt.to}
                className="w-full"
                onChange={(start, end) => {
                  setUpdatedAt({
                    from: start?.toString() || null,
                    to: end?.toString() || null,
                  })
                }}
              />
              {(updatedAt.from || updatedAt.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUpdatedAt({ from: null, to: null })}>
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
