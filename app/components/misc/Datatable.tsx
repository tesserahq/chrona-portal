'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from './Pagination'
import { IPagingInfo } from '@/types/pagination'
import { cn } from '@/utils/misc'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: IPagingInfo
  empty?: React.ReactNode
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  empty,
  className,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
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

  return (
    <>
      <div
        className={cn('overflow-hidden rounded-md border dark:border-border', className)}>
        <Table className="w-full">
          <TableHeader className="bg-slate-50 dark:bg-navy-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="dark:hover:bg-navy-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-navy-800 dark:text-navy-100"
                      style={{ width: header.column.columnDef.size }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white dark:bg-navy-700">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="dark:border-border dark:hover:bg-navy-600">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-navy-800 dark:text-navy-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {meta?.page_size && (
        <div className="pt-4">
          <Pagination meta={meta} />
        </div>
      )}
    </>
  )
}
