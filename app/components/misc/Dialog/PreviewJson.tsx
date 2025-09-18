/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { MarkdownRenderer } from '../Markdown/MarkdownRender'

export interface IDebugResponse {
  json: any
}

interface FuncProps {
  onOpen: (value: IDebugResponse) => void
}

interface IProps {
  title: string
}

const DialogPreviewJson: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { title }: IProps,
  ref,
) => {
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
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {copied && (
          <div className="absolute left-0 top-0 z-[1000] flex w-full justify-center p-2 pt-3">
            <Alert variant="success" className="animate w-auto animate-slide-down">
              <AlertTitle>Successfully copied JSON</AlertTitle>
            </Alert>
          </div>
        )}
        <div className="max-h-[600px] overflow-y-auto overflow-x-scroll">
          <MarkdownRenderer>
            {`\`\`\`json\n${JSON.stringify({ ...debugResponse }, null, 2)}\n\`\`\``}
          </MarkdownRenderer>
        </div>
        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={onCopy} disabled={copied}>
            {copied ? 'Copied' : 'Copy JSON'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(DialogPreviewJson)
