'use client'

import { ChangeEventHandler } from 'react'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface IProps {
  currentDate: Date | null
  onChange: (date: Date | null) => void
}

export function DatetimePicker({ currentDate, onChange }: IProps) {
  const [open, setOpen] = React.useState<boolean>(false)
  const [selected, setSelected] = React.useState<Date | undefined>(
    currentDate || undefined,
  )
  const [timeValue, setTimeValue] = React.useState<string>('00:00')

  // Sync timeValue with selected date when it changes
  React.useEffect(() => {
    if (selected) {
      const hours = String(selected.getHours()).padStart(2, '0')
      const minutes = String(selected.getMinutes()).padStart(2, '0')
      setTimeValue(`${hours}:${minutes}`)
    }
  }, [selected])

  React.useEffect(() => {
    if (currentDate) {
      const hours = String(currentDate.getHours()).padStart(2, '0')
      const minutes = String(currentDate.getMinutes()).padStart(2, '0')
      setTimeValue(`${hours}:${minutes}`)
    }
  }, [currentDate])

  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value
    setTimeValue(time)

    if (!selected) {
      return
    }

    const [hours, minutes] = time.split(':').map((str) => parseInt(str, 10))
    // Create date in local timezone for consistent display
    const year = selected.getFullYear()
    const month = selected.getMonth()
    const day = selected.getDate()
    const newSelectedDate = new Date(year, month, day, hours, minutes)
    setSelected(newSelectedDate)
    onChange(newSelectedDate)
    setOpen(false)
  }

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) {
      setSelected(undefined)
      setTimeValue('00:00')
      onChange(null)
      return
    }

    const [hours, minutes] = timeValue.split(':').map((str) => parseInt(str, 10))
    // Create date in local timezone for consistent display
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const newDate = new Date(year, month, day, hours, minutes)

    setSelected(newDate)
    onChange(newDate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className="justify-start rounded bg-transparent text-left font-normal data-[empty=true]:text-muted-foreground">
          <CalendarIcon />
          {selected ? format(selected, 'PPP p') : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-3">
          <Calendar mode="single" selected={selected} onSelect={handleDaySelect} />
          <div className="mt-4 border-t pt-4">
            <label className="mb-2 block text-sm font-medium">Set the time:</label>
            <Input type="time" value={timeValue} onChange={handleTimeChange} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
