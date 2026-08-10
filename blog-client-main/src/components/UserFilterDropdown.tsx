import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type UserFilterOption = {
  label: string
  value: string
}

export type UserActiveFilters = {
  rol?: string
  estado?: string
  nombre?: string
}

type UserFilterDropdownProps = {
  onFiltersChange: (filters: UserActiveFilters) => void
  activeFilters: UserActiveFilters
  className?: string
  showTrigger?: boolean
}

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Profesor', value: 'profesor' },
]

const statusOptions = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
]

export function UserFilterDropdown({
  onFiltersChange,
  activeFilters,
  className,
  showTrigger = true,
}: UserFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(showTrigger ? false : true)
  const [expandedMenu, setExpandedMenu] = useState<'rol' | 'estado' | null>(null)
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

  const handleFilterChange = (field: keyof UserActiveFilters, value: string) => {
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

  const toggleMenu = (menu: 'rol' | 'estado') => {
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
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 whitespace-nowrap min-w-[176px]">
          {/* Menu principal */}
          <div className="p-3">
            <button
              onClick={() => toggleMenu('rol')}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded flex items-center justify-between text-sm font-medium min-h-[44px]"
              type="button"
            >
              <span>Rol</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <div className="border-t border-gray-200 my-2 mx-3"></div>
            <button
              onClick={() => toggleMenu('estado')}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded flex items-center justify-between text-sm font-medium min-h-[44px]"
              type="button"
            >
              <span>Estado</span>
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
              {expandedMenu === 'rol' && (
                <div className="p-3">
                  {roleOptions.map((option, index) => (
                    <div key={option.value}>
                      <button
                        onClick={() => handleFilterChange('rol', option.value)}
                        className={`w-full text-left px-4 py-3 rounded flex items-center text-sm font-medium min-h-[44px] ${
                          activeFilters.rol === option.value
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        type="button"
                      >
                        <span>{option.label}</span>
                      </button>
                      {index < roleOptions.length - 1 && (
                        <div className="border-t border-gray-200 my-2 mx-3"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {expandedMenu === 'estado' && (
                <div className="p-3">
                  {statusOptions.map((option, index) => (
                    <div key={option.value}>
                      <button
                        onClick={() => handleFilterChange('estado', option.value)}
                        className={`w-full text-left px-4 py-3 rounded flex items-center text-sm font-medium min-h-[44px] ${
                          activeFilters.estado === option.value
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        type="button"
                      >
                        <span>{option.label}</span>
                      </button>
                      {index < statusOptions.length - 1 && (
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
