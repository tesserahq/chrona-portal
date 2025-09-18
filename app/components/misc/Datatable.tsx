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
import { IPagingInfo } from '@/types/pagination'
import { Pagination } from './Pagination'
import { cn } from '@/utils/misc'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: IPagingInfo
  empty?: React.ReactNode
  fixed?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  empty,
  fixed = true,
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
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded border border-border bg-card',
        fixed && 'h-[calc(100vh-10rem)]',
      )}>
      <div className="flex-1 overflow-hidden">
        <div className="no-scrollbar h-full overflow-y-auto">
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
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
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
                      <TableCell
                        key={cell.id}
                        className="text-navy-800 dark:text-navy-100">
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
      </div>
      {meta?.size && (
        <div className="sticky bottom-0 z-10 border-t border-input bg-card p-3 dark:bg-navy-800">
          <Pagination meta={meta} />
        </div>
      )}
    </div>
  )
}
