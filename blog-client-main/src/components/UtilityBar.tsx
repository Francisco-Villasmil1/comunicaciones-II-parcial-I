import { ChevronDown } from 'lucide-react'

import { useIsMobile } from '@/hooks/useIsMobile'

type UtilityBarProps = {
  showFilter?: boolean
  showCreate?: boolean
  filterLabel?: string
  filterCount?: number
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onFilterClick?: () => void
  onCreateClick?: () => void
  createLabel?: string
  className?: string
}

export function UtilityBar({
  showFilter = true,
  showCreate = true,
  filterLabel = 'Filtro',
  filterCount = 0,
  searchPlaceholder = '',
  searchValue = '',
  onSearchChange,
  onFilterClick,
  onCreateClick,
  createLabel = 'Nuevo',
  className,
}: UtilityBarProps) {
  const { isMobile, isTablet } = useIsMobile()
  const isCompact = isMobile || isTablet
  const Shadow = isCompact
    ? '0px 4px 6px 0px rgba(0,0,0,0.16)'
    : '0px 4px 6px 4px rgba(0,0,0,0.16)'

  return (
    <section
      aria-label='Barra de utilidades'
      className={[
        'w-full rounded-[12px] bg-white p-3',
        className ?? '',
      ].join(' ')}
      style={{ boxShadow: Shadow }}
    >
      {isCompact ? (
        <div className='flex flex-col gap-3'>
          <input
            aria-label='Busqueda'
            className='h-10 w-full rounded-[4px] border border-slate-500 px-3 text-sm text-ownText outline-none transition-colors focus:border-primary'
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            type='text'
            value={searchValue}
          />

          <div className='flex w-full items-center justify-center gap-3'>
            {showFilter ? (
              <button
                aria-label='Abrir filtros'
                className='inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-[4px] border border-slate-500 px-5 text-sm font-semibold text-ink transition-colors hover:bg-slate-100'
                onClick={onFilterClick}
                type='button'
              >
                <span>{filterLabel}</span>
                {filterCount > 0 && (
                  <span className='bg-primary text-white rounded-full px-2 py-0.5 text-xs'>
                    {filterCount}
                  </span>
                )}
                <ChevronDown size={16} />
              </button>
            ) : null}

            {showCreate ? (
              <button
                aria-label='Crear nuevo registro'
                className={[
                  'h-10 rounded-[10px] bg-actionButton px-7 text-lg font-semibold text-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition-colors hover:brightness-95',
                  showFilter ? 'min-w-[110px]' : 'w-full',
                ].join(' ')}
                onClick={onCreateClick}
                type='button'
              >
                {createLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-[auto,1fr,auto] items-center gap-3'>
          {showFilter ? (
            <button
              aria-label='Abrir filtros'
              className='inline-flex h-10 min-w-[100px] items-center justify-center gap-2 rounded-[4px] border border-slate-500 px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-100'
              onClick={onFilterClick}
              type='button'
            >
              <span>{filterLabel}</span>
              {filterCount > 0 && (
                <span className='bg-primary text-white rounded-full px-2 py-0.5 text-xs'>
                  {filterCount}
                </span>
              )}
              <ChevronDown size={16} />
            </button>
          ) : (
            <span aria-hidden='true' className='hidden sm:block' />
          )}

          <input
            aria-label='Busqueda'
            className='h-10 min-w-0 rounded-[4px] border border-slate-500 px-3 text-sm text-ownText outline-none transition-colors focus:border-primary'
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            type='text'
            value={searchValue}
          />

          {showCreate ? (
            <button
              aria-label='Crear nuevo registro'
              className='h-10 min-w-[110px] rounded-[10px] bg-actionButton px-5 text-lg font-semibold text-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition-colors hover:brightness-95'
              onClick={onCreateClick}
              type='button'
            >
              {createLabel}
            </button>
          ) : (
            <span aria-hidden='true' />
          )}
        </div>
      )}
    </section>
  )
}
