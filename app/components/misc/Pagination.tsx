/* eslint-disable @typescript-eslint/no-unused-vars */
import { IPagingInfo } from '@/types/pagination'
import {
  PaginationComponent,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { useScopedParams } from '@/utils/scoped_params'
import { useNavigate, useSearchParams } from '@remix-run/react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({ meta }: { meta: IPagingInfo }) => {
  const { getScopedSearch } = useScopedParams()
  const navigate = useNavigate()
  const { pages, page, total, size } = meta
  const [searchParams, setSearchParams] = useSearchParams()

  // Build a sliding window of 3 pages around the active page
  const getVisiblePages = () => {
    if (pages <= 3) return Array.from({ length: pages }, (_, i) => i + 1)

    let start = Math.max(1, page - 1)
    let end = Math.min(pages, page + 1)

    // Ensure we always show 3 items if possible
    while (end - start + 1 < 3) {
      if (start > 1) {
        start -= 1
      } else if (end < pages) {
        end += 1
      } else {
        break
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const windowPages = getVisiblePages()
  const showLeadingEllipsis = windowPages[0] > 1
  const showTrailingEllipsis = windowPages[windowPages.length - 1] < pages

  const [row, setRow] = useState<string>(size.toString())

  const onChange = (value: string) => {
    const currentSize = String(Number(value))

    navigate(getScopedSearch({ size: currentSize, page: 1 }))
    setRow(currentSize)
  }

  const onNavigate = (value: number) => {
    navigate(getScopedSearch({ page: value }))
  }

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-1">
        <p className="w-28 text-navy-800 dark:text-navy-200">Row per page</p>
        <div className="w-20">
          <Select value={row} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="75">75</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <PaginationComponent className="justify-end">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <Button variant="outline" size="icon" onClick={() => onNavigate(page - 1)}>
                <ChevronLeft />
              </Button>
            </PaginationItem>
          )}
          {showLeadingEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {windowPages.map((val) => (
            <PaginationItem key={val}>
              <Button
                variant={val === page ? 'default' : 'outline'}
                onClick={() => {
                  if (val !== page) {
                    onNavigate(val)
                  }
                }}>
                {val}
              </Button>
            </PaginationItem>
          ))}
          {showTrailingEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page !== pages && (
            <PaginationItem>
              <Button size="icon" variant="outline" onClick={() => onNavigate(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
