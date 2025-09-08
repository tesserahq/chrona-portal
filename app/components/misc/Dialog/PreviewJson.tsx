/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { MarkdownRenderer } from '../Markdown/MarkdownRender'
import { Alert, AlertTitle } from '@/components/ui/alert'

export interface IDebugResponse {
  question: string
  text: string[]
  data: string[]
  error: string[]
}

interface FuncProps {
  onOpen: (value: IDebugResponse) => void
}

const DialogPreviewJson: React.ForwardRefRenderFunction<FuncProps> = (_, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [debugResponse, setdebugResponse] = useState<IDebugResponse>()
  const [copied, setCopied] = useState<boolean>(false)

  useImperativeHandle(ref, () => ({
    onOpen(value) {
      setdebugResponse(value)
      setOpen(true)
    },
  }))

  const onCopy = () => {
    setCopied(true)

    navigator.clipboard.writeText(JSON.stringify(debugResponse))

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[90%] !max-w-full">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>
        <DialogDescription>{debugResponse?.question}</DialogDescription>
        {copied && (
          <div className="absolute left-0 top-0 z-[1000] flex w-full justify-center p-2 pt-3">
            <Alert variant="success" className="animate w-auto animate-slide-down">
              <AlertTitle>Successfully copied JSON</AlertTitle>
            </Alert>
          </div>
        )}
        <div className="max-h-[600px] overflow-y-auto overflow-x-scroll">
          <MarkdownRenderer>
            {`\`\`\`json\n${JSON.stringify({ text: debugResponse?.text, data: debugResponse?.data, error: debugResponse?.error }, null, 2)}\n\`\`\``}
          </MarkdownRenderer>
        </div>
        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={onCopy}>Copy JSON</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(DialogPreviewJson)
