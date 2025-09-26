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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface FuncProps {
  onOpen: () => void
  onClose: () => void
}
interface IProps {
  data?: any
}

const BackfillDialog: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { data },
  ref,
) => {
  const { formMethod, state } = useNavigation()
  const [open, setOpen] = useState<boolean>(false)
  const [force, setForce] = useState<boolean>(false)
  const [days, setDays] = useState<number>(0)
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
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent>
        <Form method="POST">
          <DialogHeader>
            <DialogTitle>Backfill for &quot;{data?.title}&quot;</DialogTitle>
          </DialogHeader>

          <DialogDescription className="mt-5">
            <input type="hidden" name="form_type" value="backfill" />
            {Object.entries(data).map(([key, value]: any) => {
              return <input type="hidden" key={key} name={key} value={value || ''} />
            })}
            <div className="mb-5">
              <Label className="required font-semibold">Days</Label>
              <Input
                name="days"
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="force" className="mb-0 cursor-pointer font-semibold">
                Force
              </Label>
              <Switch
                id="force"
                name="force"
                checked={force}
                className="border-input"
                onCheckedChange={(checked) => setForce(Boolean(checked))}
              />
            </div>
          </DialogDescription>

          <DialogFooter className="mt-10">
            <div className="flex w-full justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>

              <Button disabled={(formMethod === 'POST' && isLoading) || days === 0}>
                {formMethod === 'POST' && isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(BackfillDialog)
