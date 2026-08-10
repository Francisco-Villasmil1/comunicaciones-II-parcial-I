import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

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

type FilterPanelProps = {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: ActiveFilters) => void
  onClearFilters: () => void
  activeFilters: ActiveFilters
  filterGroups: FilterGroup[]
  className?: string
}

export function FilterPanel({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  activeFilters,
  filterGroups,
  className,
}: FilterPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set())
  const [selectedFilters, setSelectedFilters] = useState<ActiveFilters>(activeFilters)

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
      // Remove selection
      const newValues = currentValues.filter((v) => v !== currentValue)
      handleFilterChange(groupId, newValues)
    } else {
      // Add selection
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
      <div key={group.id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
        <button
          onClick={() => toggleGroup(group.id)}
          className="flex items-center justify-between w-full py-2 px-3 hover:bg-gray-50 rounded transition-colors"
          type="button"
        >
          <h3 className="font-medium text-gray-900">{group.title}</h3>
          <ChevronDown
            size={16}
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="mt-3 px-3">
            {group.type === 'multilevel' && (
              <div className="space-y-2">
                {renderMultilevelOptions(group.id, group.options)}
              </div>
            )}

            {group.type === 'single' && (
              <div className="space-y-2">
                {group.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={group.id}
                      value={option.value || option.id}
                      checked={currentValues === (option.value || option.id)}
                      onChange={() => handleFilterChange(group.id, option.value || option.id)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative bg-white w-full max-w-md h-full shadow-xl ${className || ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Groups */}
        <div className="flex-1 overflow-y-auto p-4">
          {filterGroups.map(renderFilterGroup)}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClearFilters()
                setSelectedFilters({})
              }}
              disabled={!hasActiveFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Limpiar
            </button>
            <button
              onClick={() => onApplyFilters(selectedFilters)}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
              type="button"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
