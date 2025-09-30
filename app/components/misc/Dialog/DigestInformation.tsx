import EntryInformation from '@/components/misc/Dialog/EntryInformation'
import { DigestView } from '@/components/misc/DigestView'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { IDigest } from '@/types/digest'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

interface FuncProps {
  onOpen: (entries: IDigest) => void
  onClose: () => void
}

const GazetteDigest: React.ForwardRefRenderFunction<FuncProps> = (_, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [digest, setDigest] = useState<IDigest | null>(null)
  const entryRef = useRef<React.ElementRef<typeof EntryInformation>>(null)

  useImperativeHandle(ref, () => ({
    onOpen(digest) {
      setDigest(digest)
      setOpen(true)
    },

    onClose() {
      setOpen(false)
    },
  }))

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="max-h-[90%] w-full max-w-[95%] overflow-auto bg-card">
        <DigestView
          digest={digest}
          onEntryClick={(entry) => entryRef?.current?.onOpen(entry)}
        />
      </DialogContent>

      <EntryInformation ref={entryRef} />
    </Dialog>
  )
}

export default forwardRef(GazetteDigest)
