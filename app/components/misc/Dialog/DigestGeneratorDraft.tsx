/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { IDigestGenerator } from '@/types/digest'
import { FetcherWithComponents, useNavigation, useParams } from '@remix-run/react'
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { DaterangePicker } from '../Datepicker/DaterangePicker'

interface FuncProps {
  onOpen: () => void
  onClose: () => void
}

interface IProps {
  digestGenerator: IDigestGenerator
  fetcher: FetcherWithComponents<unknown>
}

const DigestGeneratorDraft: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { digestGenerator, fetcher }: IProps,
  ref,
) => {
  const { state } = useNavigation()
  const params = useParams()
  const [open, setOpen] = useState<boolean>(false)
  const [fromLastDigest, setFromLastDigest] = useState<boolean>(true)
  const [dateFilter, setDateFilter] = useState<{
    from: string | null
    to: string | null
  }>({ from: null, to: null })
  const { token } = useApp()

  const isSubmitting = useMemo(
    () => fetcher.state === 'submitting',
    [state, fetcher.state],
  )

  useImperativeHandle(ref, () => ({
    onOpen() {
      setOpen(true)
    },

    onClose() {
      setOpen(false)
    },
  }))

  const onClose = () => {
    setOpen(false)
    setFromLastDigest(true)
    setDateFilter({ from: null, to: null })
  }

  const onSubmit = () => {
    const formData = new FormData()

    formData.set('form_type', 'draft')
    formData.set('token', token!)
    formData.set('id', digestGenerator.id)
    formData.set('project_id', params?.project_id || '')

    if (fromLastDigest) {
      formData.set('from_last_digest', 'true')
    } else {
      formData.set('from_last_digest', 'false')
      formData.set('from', dateFilter.from!)
      formData.set('to', dateFilter.to!)
    }

    fetcher.submit(formData, { method: 'POST' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Draft for &quot;{digestGenerator?.title}&quot;</DialogTitle>
        </DialogHeader>
        <Label className="mb-0 mt-3">Settings</Label>
        <Select
          value={fromLastDigest === true ? 'true' : 'false'}
          onValueChange={(value) => {
            setFromLastDigest(value === 'true')
            if (value === 'true') setDateFilter({ from: null, to: null })
          }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">From Last Digest</SelectItem>
            <SelectItem value="false">Custom</SelectItem>
          </SelectContent>
        </Select>
        {fromLastDigest === false && (
          <>
            <Label className="mb-0">Select date</Label>
            <DaterangePicker
              onChange={(start, end) => {
                if (start && end) {
                  setDateFilter({ from: start.toString(), to: end.toString() })
                } else {
                  setDateFilter({ from: null, to: null })
                }
              }}
            />
          </>
        )}
        <DialogFooter className="mt-10 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              isSubmitting || (!fromLastDigest && (!dateFilter.from || !dateFilter.to))
            }
            onClick={onSubmit}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(DigestGeneratorDraft)
