import type { ReactNode } from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'

type Align = 'left' | 'center' | 'right'

export type BaseTableColumn<TData> = {
  key: keyof TData | string
  header: string
  align?: Align
  width?: string
  render?: (row: TData, rowIndex: number) => ReactNode
}

export type BaseTablePagination = {
  enabled: boolean
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  labels?: {
    previous?: string
    next?: string
  }
}

type BaseTableProps<TData> = {
  columns: BaseTableColumn<TData>[]
  rows: TData[]
  rowKey?: (row: TData, rowIndex: number) => string
  emptyMessage?: string
  className?: string
  tableAriaLabel?: string
  pagination?: BaseTablePagination
}

const getAlignClass = (align: Align = 'left') => {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

const getCellValue = <TData,>(row: TData, key: keyof TData | string): ReactNode => {
  if (typeof key !== 'string') {
    const value = row[key]
    return value == null ? '' : String(value)
  }

  const value = (row as Record<string, unknown>)[key]
  return value == null ? '' : String(value)
}

export function BaseTable<TData>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Sin datos para mostrar.',
  className,
  tableAriaLabel = 'Tabla de datos',
  pagination,
}: BaseTableProps<TData>) {
  const isPaginationEnabled = Boolean(pagination?.enabled)
  const currentPage = pagination?.currentPage ?? 1
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const previousLabel = pagination?.labels?.previous ?? 'Anterior'
  const nextLabel = pagination?.labels?.next ?? 'Siguiente'
  const { isMobile, isTablet } = useIsMobile()
  const isCompact = isMobile || isTablet

  const containerSpacingClass = isCompact ? 'mb-4 pb-1' : 'mb-2'
  const containerPaddingClass = isCompact ? 'p-3' : 'p-5'
  const Shadow = isCompact
    ? '0px 8px 14px -2px rgba(0,0,0,0.22)'
    : '0px 4px 6px 4px rgba(0,0,0,0.16)'
  const headerCellClass = isCompact ? 'px-2 py-2 text-[12px]' : 'px-4 py-3 text-sm'
  const bodyCellClass = isCompact ? 'px-2 py-2 text-[10px]' : 'px-4 py-3 text-base'
  const paginationTextClass = isCompact ? 'text-[10px]' : 'text-base'
  const paginationButtonPaddingClass = isCompact ? 'px-2 py-1.5' : 'px-4 py-2'
  const pageButtonPaddingClass = isCompact ? 'px-2 py-1.5' : 'px-3 py-2'
  const tableMinWidthClass = isCompact ? 'min-w-full' : 'min-w-[640px]'

  const handlePageChange = (page: number) => {
    if (!pagination?.onPageChange) return
    if (page < 1 || page > totalPages) return
    pagination.onPageChange(page)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <section
      className={[
        'w-full rounded-[12px] bg-white',
        containerSpacingClass,
        containerPaddingClass,
        className ?? '',
      ].join(' ')}
      style={{ boxShadow: Shadow }}
    >
      <div className='w-full overflow-x-auto'>
        <table aria-label={tableAriaLabel} className={['w-full border-collapse', tableMinWidthClass].join(' ')}>
          <thead>
            <tr className='bg-primary text-white'>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={[
                    'font-semibold',
                    headerCellClass,
                    getAlignClass(column.align),
                  ].join(' ')}
                  scope='col'
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className='px-4 py-8 text-center text-ownText' colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowKey ? rowKey(row, rowIndex) : `row-${rowIndex}`} className='border-b border-slate-500/70'>
                  {columns.map((column) => (
                    <td
                      key={`${String(column.key)}-${rowIndex}`}
                      className={[
                        'text-ownText',
                        bodyCellClass,
                        getAlignClass(column.align),
                      ].join(' ')}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : getCellValue(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isPaginationEnabled ? (
        <nav aria-label='Paginacion de la tabla' className='mt-4 flex items-center justify-center gap-1'>
          <button
            className={[
              'border border-slate-300 bg-slate-100 text-ownText transition-colors hover:bg-slate-200 disabled:opacity-50',
              paginationTextClass,
              paginationButtonPaddingClass,
            ].join(' ')}
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            type='button'
          >
            {previousLabel}
          </button>

          {pageNumbers.map((page) => {
            const isCurrent = page === currentPage

            return (
              <button
                key={page}
                aria-current={isCurrent ? 'page' : undefined}
                className={[
                  'min-w-8 border transition-colors',
                  paginationTextClass,
                  pageButtonPaddingClass,
                  isCurrent
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-300 bg-slate-100 text-ownText hover:bg-slate-200',
                ].join(' ')}
                onClick={() => handlePageChange(page)}
                type='button'
              >
                {page}
              </button>
            )
          })}

          <button
            className={[
              'border border-slate-300 bg-slate-100 text-ownText transition-colors hover:bg-slate-200 disabled:opacity-50',
              paginationTextClass,
              paginationButtonPaddingClass,
            ].join(' ')}
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            type='button'
          >
            {nextLabel}
          </button>
        </nav>
      ) : null}
    </section>
  )
}
