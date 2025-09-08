/* eslint-disable @typescript-eslint/no-unused-vars */
import { IPagingInfo } from '@/types/pagination'
import {
  PaginationComponent,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useScopedParams } from '@/utils/scoped_params'
import { useNavigate } from '@remix-run/react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({ meta }: { meta: IPagingInfo }) => {
  const { getScopedSearch } = useScopedParams()
  const navigate = useNavigate()
  const { current_page, total_pages, total_count, page_size } = meta
  const pages = Array.from({ length: total_pages }, (_, i) => i + 1)

  const [row, setRow] = useState<string>(meta.page_size.toString())

  const onChange = (value: string) => {
    navigate(getScopedSearch({ page_size: value }))
    setRow(value)
  }

  const onNavigate = (value: number) => {
    navigate(getScopedSearch({ page: value }))
  }

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="w-28 text-navy-800 dark:text-navy-200">Row per page </p>
        <div className="w-20">
          <Select value={row} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="150">150</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <PaginationComponent>
        <PaginationContent>
          {current_page > 1 && (
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate(current_page - 1)}>
                <ChevronLeft />
              </Button>
            </PaginationItem>
          )}
          {pages.map((page) => (
            <PaginationItem key={page}>
              <Button
                variant={page === current_page ? 'default' : 'outline'}
                onClick={() => {
                  if (page !== current_page) {
                    onNavigate(page)
                  }
                }}>
                {page}
              </Button>
            </PaginationItem>
          ))}
          {current_page !== total_pages && (
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onNavigate(current_page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
