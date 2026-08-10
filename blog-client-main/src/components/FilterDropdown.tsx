import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export type FilterOption = {
  id: string
  label: string
  value?: string
  children?: FilterOption[]
}

export type FilterGroup = {
  id: string
  title: string
  type: 'multilevel' | 'single' | 'range'
  options: FilterOption[]
}

export type ActiveFilters = {
  [key: string]: string | string[]
}

type FilterDropdownProps = {
  onApplyFilters: (filters: ActiveFilters) => void
  onClearFilters: () => void
  activeFilters: ActiveFilters
  filterGroups: FilterGroup[]
  className?: string
}

export function FilterDropdown({
  onApplyFilters,
  onClearFilters,
  activeFilters,
  filterGroups,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set())
  const [selectedFilters, setSelectedFilters] = useState<ActiveFilters>(activeFilters)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cierrar el dropdown cuando hace click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Sync selected filters with active filters
  useEffect(() => {
    setSelectedFilters(activeFilters)
  }, [activeFilters])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const toggleOption = (groupId: string, optionId: string) => {
    setExpandedOptions((prev) => {
      const newSet = new Set(prev)
      const key = `${groupId}-${optionId}`
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleFilterChange = (groupId: string, value: string | string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [groupId]: value,
    }))
  }

  const handleMultilevelSelect = (groupId: string, option: FilterOption, path: string[] = []) => {
    const currentPath = [...path, option.id]
    const currentValue = currentPath.join('>')
    
    const currentValues = selectedFilters[groupId] as string[] || []
    
    if (currentValues.includes(currentValue)) {
      // Quita la seleccion
      const newValues = currentValues.filter((v) => v !== currentValue)
      handleFilterChange(groupId, newValues)
    } else {
      // Añade la seleccion
      const newValues = [...currentValues, currentValue]
      handleFilterChange(groupId, newValues)
    }
  }

  const renderMultilevelOptions = (groupId: string, options: FilterOption[], level: number = 0, path: string[] = []) => {
    return options.map((option) => {
      const currentPath = [...path, option.id]
      const pathValue = currentPath.join('>')
      const isSelected = (selectedFilters[groupId] as string[] || []).includes(pathValue)
      const hasChildren = option.children && option.children.length > 0
      const isExpanded = expandedOptions.has(`${groupId}-${option.id}`)

      return (
        <div key={option.id} style={{ marginLeft: `${level * 16}px` }}>
          <div className="flex items-center gap-2 py-1">
            {hasChildren && (
              <button
                onClick={() => toggleOption(groupId, option.id)}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleMultilevelSelect(groupId, option, path)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          </div>
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderMultilevelOptions(groupId, option.children!, level + 1, currentPath)}
            </div>
          )}
        </div>
      )
    })
  }

  const renderFilterGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.id)
    const currentValues = selectedFilters[group.id]

    return (
      <div key={group.id} className="border-b border-gray-100 pb-2 mb-2 last:border-b-0">
        <button
          onClick={() => toggleGroup(group.id)}
          className="flex items-center justify-between w-full py-1 px-2 hover:bg-gray-50 rounded transition-colors"
          type="button"
        >
          <h3 className="font-medium text-gray-900 text-sm">{group.title}</h3>
          <ChevronDown
            size={14}
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="mt-1 px-2">
            {group.type === 'multilevel' && (
              <div className="space-y-1">
                {renderMultilevelOptions(group.id, group.options)}
              </div>
            )}

            {group.type === 'single' && (
              <div className="space-y-1">
                {group.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name={group.id}
                      value={option.value || option.id}
                      checked={currentValues === (option.value || option.id)}
                      onChange={() => handleFilterChange(group.id, option.value || option.id)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const hasActiveFilters = Object.keys(selectedFilters).some(
    (key) => {
      const value = selectedFilters[key]
      return Array.isArray(value) ? value.length > 0 : value !== ''
    }
  )

  const handleApply = () => {
    onApplyFilters(selectedFilters)
    setIsOpen(false)
  }

  const handleClear = () => {
    onClearFilters()
    setSelectedFilters({})
    setIsOpen(false)
  }

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).filter(key => {
      const value = activeFilters[key]
      return Array.isArray(value) ? value.length > 0 : value !== ''
    }).length
  }

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      {/* Trigger del boton */}
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

      {/* Contenido del dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Grupos del filtro */}
          <div className="p-2">
            {filterGroups.map(renderFilterGroup)}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-2 space-y-2 sticky bottom-0 bg-white">
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                disabled={!hasActiveFilters}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                Limpiar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-2 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary-600 transition-colors"
                type="button"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
