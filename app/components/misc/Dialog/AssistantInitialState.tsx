/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { forwardRef, useImperativeHandle, useState } from 'react'
import JSONEditor from '../JsonEditor'

interface FuncProps {
  onOpen: () => void
}

interface IProps {
  initialState: string
  onSetInitialState: (val: string) => void
}

const DialogAssistantInitialState: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { initialState, onSetInitialState }: IProps,
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false)
  const [state, setState] = useState<string>(initialState)

  useImperativeHandle(ref, () => ({
    onOpen() {
      setOpen(true)
    },
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Initial State</DialogTitle>
        </DialogHeader>
        <JSONEditor title="state" currentData={state} onChange={setState} />
        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            disabled={state === '{}'}
            onClick={() => {
              onSetInitialState(state)
              setOpen(false)
            }}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(DialogAssistantInitialState)
