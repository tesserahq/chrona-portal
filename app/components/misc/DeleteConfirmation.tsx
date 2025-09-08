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

interface FuncProps {
  onOpen: () => void
  onClose: () => void
}
interface IModalDeleteProps {
  title: string
  alert: string
  error?: string
  data?: any
}

const ModalDelete: React.ForwardRefRenderFunction<FuncProps, IModalDeleteProps> = (
  { title, error, data, alert },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {alert}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-3">
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 overflow-hidden rounded-full bg-slate-100 p-5">
              <img src="/images/warning.svg" alt="image-warning" className="w-full" />
            </div>
            <h1 className="mb-3 mt-3 text-center text-2xl font-medium text-black dark:text-secondary-foreground">
              {title}
            </h1>
            <p className="mb-3 text-sm">
              To confirm, type &quot;delete&quot; in the box below
            </p>
            <Input
              name="delete_confirm"
              className={cn('mb-2 text-black', fieldError && 'input-error')}
              onChange={(e) => setConfirmMsg(e.target.value)}
            />
          </div>
        </DialogDescription>

        <DialogFooter className="mt-3">
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
                  confirmMsg.toLocaleLowerCase() !== 'delete'
                }>
                {formMethod === 'DELETE' && isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </Form>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(ModalDelete)
