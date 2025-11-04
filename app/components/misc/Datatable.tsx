'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Table as ReactTableType,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IPagingInfo } from '@/types/pagination'
import { cn } from '@/utils/misc'
import { Pagination } from './Pagination'
import { useState, useEffect, useRef } from 'react'
import type { Table as ReactTable, HeaderGroup } from '@tanstack/react-table'

type TableCellSkeletonsProps<TData> = {
  table: ReactTable<TData>
  count: number
}

export const TableCellSkeletons = <TData,>({
  table,
  count,
}: TableCellSkeletonsProps<TData>) => {
  return Array.from({ length: count }).map((_, skeletonIndex) => {
    return table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
      <TableRow
        key={`${headerGroup.id}-${skeletonIndex}`}
        className="border-border dark:hover:bg-navy-700">
        {headerGroup.headers.map((header) => {
          return (
            <TableCell
              key={`${header.id}-${skeletonIndex}`}
              className="py-2 ps-4 font-semibold text-navy-800 dark:text-navy-100"
              style={{ width: header.column.columnDef.size }}>
              <div className="h-6 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-500"></div>
            </TableCell>
          )
        })}
      </TableRow>
    ))
  })
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: IPagingInfo
  empty?: React.ReactNode
  fixed?: boolean
  isLoading?: boolean
  hasFilter?: boolean
  table?: ReactTableType<TData>
  onTableReady?: (table: ReactTableType<TData>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  empty,
  fixed = true,
  isLoading,
  hasFilter = false,
  table: tableProp,
  onTableReady,
}: DataTableProps<TData, TValue>) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [skeletonRowCount, setSkeletonRowCount] = useState<number>(10)

  useEffect(() => {
    const updateSkeletonCount = () => {
      const container = scrollContainerRef.current
      if (!container) return

      const containerHeight = container.clientHeight
      const headerElement = container.querySelector('thead') as HTMLElement | null
      const headerHeight = headerElement?.offsetHeight ?? 0
      const estimatedRowHeight = 40
      const availableHeight = Math.max(0, containerHeight - headerHeight)
      const count = Math.max(1, Math.floor(availableHeight / estimatedRowHeight))
      setSkeletonRowCount(count)
    }

    updateSkeletonCount()

    const container = scrollContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => updateSkeletonCount())
    resizeObserver.observe(container)
    window.addEventListener('resize', updateSkeletonCount)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSkeletonCount)
    }
  }, [])

  const internalTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
  })

  const table = tableProp || internalTable

  useEffect(() => {
    if (table && onTableReady) {
      onTableReady(table)
    }
  }, [table, onTableReady])

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded border border-border bg-card',
        fixed && 'h-[calc(100vh-10rem)]',
        hasFilter && 'h-[calc(100vh-13rem)]',
      )}>
      <div className="flex-1 overflow-hidden">
        <div ref={scrollContainerRef} className="no-scrollbar h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 w-full bg-slate-100/20 shadow-sm backdrop-blur-md dark:bg-slate-800/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-border dark:hover:bg-navy-700">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="py-3 font-semibold text-navy-800 dark:text-navy-100"
                        style={{ width: header.column.columnDef.size }}>
                        {header.column.columnDef.header ? (
                          header.isPlaceholder ? null : (
                            flexRender(
                              header.column.columnDef.header || '',
                              header.getContext(),
                            )
                          )
                        ) : (
                          <div className="w-10"></div>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-white dark:bg-transparent">
              {isLoading && <TableCellSkeletons table={table} count={skeletonRowCount} />}

              {!isLoading &&
                table.getRowModel().rows?.length > 0 &&
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-slate-50 dark:border-border dark:hover:bg-navy-600">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2 ps-4 text-navy-800 dark:text-navy-100">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && table.getRowModel().rows?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {meta?.size && (
        <div className="sticky bottom-0 z-10 border-t border-input bg-card p-3 dark:bg-navy-800">
          <Pagination meta={meta} />
        </div>
      )}
    </div>
  )
}
