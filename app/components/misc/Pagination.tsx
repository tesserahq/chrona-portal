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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export const Pagination = ({ meta }: { meta: IPagingInfo }) => {
  const { getScopedSearch } = useScopedParams()
  const navigate = useNavigate()
  const { pages, page, total, size } = meta
  const [searchParams, setSearchParams] = useSearchParams()

  // Build a sliding window of pages around the active page
  const getVisiblePages = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)

    const delta = 2 // Number of pages to show on each side of current page
    let start = Math.max(1, page - delta)
    let end = Math.min(pages, page + delta)

    // Adjust to ensure we show enough pages
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(pages, start + 4)
      } else if (end === pages) {
        start = Math.max(1, end - 4)
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const windowPages = getVisiblePages()
  const showLeadingEllipsis = windowPages[0] > 2
  const showTrailingEllipsis = windowPages[windowPages.length - 1] < pages - 1
  const showFirstPage = windowPages[0] > 1
  const showLastPage = windowPages[windowPages.length - 1] < pages

  // Calculate record range
  const startRecord = (page - 1) * size + 1
  const endRecord = Math.min(page * size, total)

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
        <p className="w-28 text-sm text-navy-800 dark:text-navy-200">Items per page:</p>
        <div className="w-20">
          <Select value={row} onValueChange={onChange}>
            <SelectTrigger className="h-8">
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
          <div className="mr-2 text-sm text-navy-800 dark:text-navy-200">
            {startRecord}-{endRecord} of {total.toLocaleString()}
          </div>
          {/* First page button */}
          {showFirstPage && (
            <PaginationItem>
              <Button variant="outline" size="icon" onClick={() => onNavigate(1)}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
          {/* Previous page button */}
          {page > 1 && (
            <PaginationItem>
              <Button variant="outline" size="icon" onClick={() => onNavigate(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
          {/* First page number */}
          {showFirstPage && (
            <PaginationItem>
              <Button
                variant={1 === page ? 'default' : 'outline'}
                onClick={() => onNavigate(1)}>
                1
              </Button>
            </PaginationItem>
          )}
          {/* Leading ellipsis */}
          {showLeadingEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {/* Window pages */}
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
          {/* Trailing ellipsis */}
          {showTrailingEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {/* Last page number */}
          {showLastPage && (
            <PaginationItem>
              <Button
                variant={pages === page ? 'default' : 'outline'}
                onClick={() => onNavigate(pages)}>
                {pages}
              </Button>
            </PaginationItem>
          )}
          {/* Next page button */}
          {page < pages && (
            <PaginationItem>
              <Button variant="outline" size="icon" onClick={() => onNavigate(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
          {/* Last page button */}
          {showLastPage && (
            <PaginationItem>
              <Button variant="outline" size="icon" onClick={() => onNavigate(pages)}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
