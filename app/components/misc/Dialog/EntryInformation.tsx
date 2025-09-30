/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EntryView } from '@/components/misc/EntryView'
import { IEntry } from '@/types/entry'
import { forwardRef, useImperativeHandle, useState } from 'react'

interface FuncProps {
  onOpen: (entry: IEntry) => void
  onClose: () => void
}

const EntryInformation: React.ForwardRefRenderFunction<FuncProps> = (_, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [entry, setEntry] = useState<IEntry | null>(null)

  useImperativeHandle(ref, () => ({
    onOpen(entry) {
      setEntry(entry)
      setOpen(true)
    },

    onClose() {
      setOpen(false)
    },
  }))

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="max-h-[90%] w-full max-w-[95%] overflow-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-balance text-xl font-bold text-foreground">
            {entry?.title}
          </DialogTitle>
        </DialogHeader>

        <EntryView entry={entry} />
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(EntryInformation)
