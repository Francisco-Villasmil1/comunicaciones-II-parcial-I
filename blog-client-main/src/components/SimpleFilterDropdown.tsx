import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type FilterOption = {
  label: string
  value: string
}

export type ActiveFilters = {
  genero?: string
  rango?: string
  descripcion?: string
}

type SimpleFilterDropdownProps = {
  onFiltersChange: (filters: ActiveFilters) => void
  activeFilters: ActiveFilters
  className?: string
  showTrigger?: boolean
}

const rangeOptions = [
  { label: '3 - 5', value: '3-5' },
  { label: '6 - 8', value: '6-8' },
  { label: '9 - 12', value: '9-12' },
]

const genderOptions = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Unisex', value: 'unisex' },
]

export function SimpleFilterDropdown({
  onFiltersChange,
  activeFilters,
  className,
  showTrigger = true,
}: SimpleFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(showTrigger ? false : true)
  const [expandedMenu, setExpandedMenu] = useState<'genero' | 'rango' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setExpandedMenu(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleFilterChange = (field: keyof ActiveFilters, value: string) => {
    const currentValue = activeFilters[field]
    
    // Si se le da click al mismo valor lo deselecciona
    if (currentValue === value) {
      const newFilters = { ...activeFilters }
      delete newFilters[field]
      onFiltersChange(newFilters)
    } else {
      // De otra manera, selecciona el nuevo valor
      const newFilters = {
        ...activeFilters,
        [field]: value === '' ? undefined : value
      }
      onFiltersChange(newFilters)
    }
  }

  const toggleMenu = (menu: 'genero' | 'rango') => {
    setExpandedMenu(expandedMenu === menu ? null : menu)
  }


  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).filter(value => value !== undefined && value !== '').length
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  const handleClearAllFilters = () => {
    onFiltersChange({})
    setIsOpen(false)
    setExpandedMenu(null)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      {/* Trigger del boton - solo mostrar si showTrigger es true */}
      {showTrigger && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex h-10 min-w-[100px] items-center justify-center gap-2 rounded-[4px] border border-slate-500 px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
          type="button"
        >
          <span>Filtro</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Contenido del dropdown - mostrar siempre si no hay trigger, o si isOpen es true */}
      {(isOpen || !showTrigger) && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[176px]">
          {/* Menu principal */}
          <div className="p-3">
            <button
              onClick={() => toggleMenu('genero')}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded flex items-center justify-between text-sm font-medium min-h-[44px]"
              type="button"
            >
              <span>Género</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <div className="border-t border-gray-200 my-2 mx-3"></div>
            <button
              onClick={() => toggleMenu('rango')}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded flex items-center justify-between text-sm font-medium min-h-[44px]"
              type="button"
            >
              <span className="whitespace-nowrap">Rango de Edad</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <div className="border-t border-gray-200 my-2 mx-3"></div>
            <button
              onClick={handleClearAllFilters}
              disabled={!hasActiveFilters}
              className="w-full text-left px-4 py-3 rounded flex items-center text-sm font-medium min-h-[44px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              type="button"
            >
              <span>Quitar Filtros</span>
            </button>
          </div>

          {/* Submenu */}
          {expandedMenu && (
            <div className="absolute top-0 left-full ml-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[176px]">
              {expandedMenu === 'genero' && (
                <div className="p-3">
                  {genderOptions.map((option, index) => (
                    <div key={option.value}>
                      <button
                        onClick={() => handleFilterChange('genero', option.value)}
                        className={`w-full text-left px-4 py-3 rounded flex items-center text-sm font-medium min-h-[44px] ${
                          activeFilters.genero === option.value
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        type="button"
                      >
                        <span>{option.label}</span>
                      </button>
                      {index < genderOptions.length - 1 && (
                        <div className="border-t border-gray-200 my-2 mx-3"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {expandedMenu === 'rango' && (
                <div className="p-3">
                  {rangeOptions.map((option, index) => (
                    <div key={option.value}>
                      <button
                        onClick={() => handleFilterChange('rango', option.value)}
                        className={`w-full text-left px-4 py-3 rounded flex items-center text-sm font-medium min-h-[44px] ${
                          activeFilters.rango === option.value
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        type="button"
                      >
                        <span>{option.label}</span>
                      </button>
                      {index < rangeOptions.length - 1 && (
                        <div className="border-t border-gray-200 my-2 mx-3"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
