/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Form, useFetcher, useNavigation } from '@remix-run/react'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { cn } from '@/utils/misc'
import { Trash2 } from 'lucide-react'

interface FuncProps {
  onOpen: () => void
  onClose: () => void
}
interface IModalDeleteProps {
  title: string
  description: string
  error?: string
  data?: any
  showInputValidation?: boolean
}

const ModalDelete: React.ForwardRefRenderFunction<FuncProps, IModalDeleteProps> = (
  { title, error, data, description, showInputValidation },
  ref,
) => {
  const { formMethod, state } = useNavigation()
  const [open, setOpen] = useState<boolean>(false)
  const [confirmMsg, setConfirmMsg] = useState<string>('')
  const [fieldError, setFieldError] = useState<string>(error || '')
  const fetcher = useFetcher()

  const isLoading = state === 'submitting' || fetcher.state === 'loading'

  useImperativeHandle(ref, () => ({
    onOpen() {
      setOpen(true)
    },
    onClose() {
      setOpen(false)
    },
  }))

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false)
        setFieldError('')
        setConfirmMsg('')
      }}>
      <DialogContent className="max-w-md border-t-4 border-t-destructive">
        {/* <DialogHeader>
          <DialogTitle>Delete {alert}</DialogTitle>
        </DialogHeader> */}
        <DialogHeader className="flex flex-col items-center">
          <div className="-mt-16 flex h-16 w-16 items-center justify-center rounded-full bg-destructive p-3">
            <Trash2 size={100} className="text-white" />
          </div>
          <DialogTitle className="hidden"></DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-3">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-semibold text-black dark:text-secondary-foreground">
              {title}
            </h1>
            <p
              className={cn(
                'mt-3 text-center text-lg text-black dark:text-secondary-foreground',
                !showInputValidation && 'mb-3 text-base text-secondary-foreground',
              )}>
              {description}
            </p>
            {showInputValidation && (
              <div className="mt-3">
                <p className="mb-3 text-sm">
                  To confirm, type &quot;delete&quot; in the box below
                </p>
                <Input
                  name="delete_confirm"
                  className={cn(
                    'mb-2 text-center text-black',
                    fieldError && 'input-error',
                  )}
                  onChange={(e) => setConfirmMsg(e.target.value)}
                />
              </div>
            )}
          </div>
        </DialogDescription>

        <DialogFooter className={cn(showInputValidation && 'mt-3')}>
          <div className="flex w-full justify-center gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Form method="DELETE">
              <input
                name="delete_confirm"
                value={confirmMsg.toLowerCase()}
                className="hidden"
              />
              {Object.entries(data).map(([key, value]: any) => {
                return (
                  <input key={key} name={key} value={value || ''} className="hidden" />
                )
              })}
              <Button
                variant="destructive"
                disabled={
                  (formMethod === 'DELETE' && isLoading) ||
                  (showInputValidation && confirmMsg.toLocaleLowerCase() !== 'delete')
                }>
                {formMethod === 'DELETE' && isLoading ? 'Deleting...' : 'Confirm'}
              </Button>
            </Form>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(ModalDelete)
