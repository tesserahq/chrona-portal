'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/misc'

interface IProps {
  initialFrom?: string | null
  initialTo?: string | null
  className?: string
  onChange: (start: Date | null, end: Date | null) => void
}

export function DaterangePicker({ onChange, initialFrom, initialTo, className }: IProps) {
  const [open, setOpen] = React.useState<boolean>(false)
  const [dateFilter, setDateFilter] = React.useState<{
    from: Date | null
    to: Date | null
  }>({
    from: initialFrom ? new Date(initialFrom) : null,
    to: initialTo ? new Date(initialTo) : null,
  })

  // Update when initial values change
  React.useEffect(() => {
    setDateFilter({
      from: initialFrom ? new Date(initialFrom) : null,
      to: initialTo ? new Date(initialTo) : null,
    })
  }, [initialFrom, initialTo])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!dateFilter.from || !dateFilter.to}
          className={cn(
            'justify-start bg-transparent text-left font-normal data-[empty=true]:text-muted-foreground',
            className,
          )}>
          <CalendarIcon />
          {dateFilter.from && dateFilter.to ? (
            format(dateFilter.from, 'PPP') + ' - ' + format(dateFilter.to, 'PPP')
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={{
            from: dateFilter?.from || undefined,
            to: dateFilter?.to || undefined,
          }}
          disabled={(date) => date > new Date()}
          onSelect={(selected) => {
            if (selected?.from && selected?.to) {
              setDateFilter({ from: selected?.from, to: selected?.to })
              onChange(selected.from, selected.to)
            } else {
              onChange(null, null)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
