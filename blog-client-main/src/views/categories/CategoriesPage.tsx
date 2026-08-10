import { SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

import { CategoriesApi } from '@/api/CategoriesApi'
import {
  BaseTable,
  type BaseTableColumn,
} from '@/components/BaseTable'
import { SimpleFilterDropdown, type ActiveFilters } from '@/components/SimpleFilterDropdown'
import { UtilityBar } from '@/components/UtilityBar'
import { usePageTitle } from '@/hooks/usePageTitle'

type CategoryRow = {
  id: string
  descripcion: string
  rangoEdad: string
  genero: string
}


const formatGenero = (genero: string) => {
  if (genero === 'masculino') return 'Masculino'
  if (genero === 'femenino') return 'Femenino'
  if (genero === 'unisex') return 'Unisex'
  return genero
}

export function CategoriesPage() {
  usePageTitle('Categorias')

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterContainerRef = useRef<HTMLDivElement>(null)

  // Derivando los valores de los parametros de la URL ¿
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  const searchValue = searchParams.get('descripcion') || ''

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFilterOpen])

  // Get filtros activos de los parametros de la URL
  const getActiveFilters = (): ActiveFilters => {
    const filters: ActiveFilters = {}
    const genero = searchParams.get('genero')
    const rango = searchParams.get('rango')
    const descripcion = searchParams.get('descripcion')

    if (genero) filters.genero = genero
    if (rango) filters.rango = rango
    if (descripcion) filters.descripcion = descripcion

    return filters
  }

  // Update los parametros de la URL cuando los filtros activos camvian
  const updateUrlParams = (filters: ActiveFilters, page: number = 1) => {
    const newParams = new URLSearchParams()

    if (filters.genero) newParams.set('genero', filters.genero as string)
    if (filters.rango) newParams.set('rango', filters.rango as string)
    if (filters.descripcion) newParams.set('descripcion', filters.descripcion as string)
    if (page > 1) newParams.set('page', page.toString())

    setSearchParams(newParams)
  }

  // Cambio del filtro del Handle
  const handleFiltersChange = (filters: ActiveFilters) => {
    updateUrlParams(filters, 1)
  }

  // Busqueda del Handle
  const handleSearchChange = (value: string) => {
    const filters = getActiveFilters()
    if (value.trim()) {
      filters.descripcion = value.trim()
    } else {
      delete filters.descripcion
    }

    updateUrlParams(filters, 1)
  }

  // Consturye parametros query para la API
  const apiParams = {
    page: currentPage,
    limit: 10,
    genero: searchParams.get('genero') || undefined,
    rango: searchParams.get('rango') || undefined,
    descripcion: searchParams.get('descripcion') || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['categories', currentPage, apiParams],
    queryFn: () => CategoriesApi.list(apiParams),
  })

  const rows: CategoryRow[] =
    data?.items.map((item) => ({
      id: String(item.id),
      descripcion: item.descripcion,
      rangoEdad: item.rango,
      genero: formatGenero(item.genero),
    })) ?? []

  const columns: BaseTableColumn<CategoryRow>[] = [
    {
      key: 'descripcion',
      header: 'Descripcion',
      align: 'center',
    },
    {
      key: 'rangoEdad',
      header: 'Rango de Edad',
      align: 'center',
    },
    {
      key: 'genero',
      header: 'Genero',
      align: 'center',
    },
    {
      key: 'editar',
      header: 'Editar',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Editar categoria ${row.descripcion}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/categorias/edit/${row.id}`)}
          type='button'
        >
          <SquarePen size={18} />
        </button>
      ),
    },
  ]

  const handlePageChange = (page: number) => {
    updateUrlParams(getActiveFilters(), page)
  }

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const getActiveFiltersCount = () => {
    const filters = getActiveFilters()
    return Object.values(filters).filter(value => value !== undefined && value !== '').length
  }

  return (
    <section aria-label='Modulo de categorias' className='mx-auto w-[calc(100%-10px)] max-w-[900px] space-y-6 pb-6 lg:w-full'>
      <div className="relative" ref={filterContainerRef}>
        <UtilityBar
          createLabel='Nuevo'
          onCreateClick={() => navigate('/categorias/new')}
          searchPlaceholder='Buscar por descripción...'
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          showFilter={true}
          onFilterClick={handleFilterClick}
          filterCount={getActiveFiltersCount()}
        />

        {/* Filter dropdown positioned relative to UtilityBar */}
        {isFilterOpen && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <SimpleFilterDropdown
              onFiltersChange={handleFiltersChange}
              activeFilters={getActiveFilters()}
              className="shadow-lg"
              showTrigger={false}
            />
          </div>
        )}
      </div>

      <BaseTable<CategoryRow>
        columns={columns}
        emptyMessage={isLoading ? 'Cargando categorias...' : 'Sin categorias registradas.'}
        pagination={{
          enabled: true,
          currentPage,
          totalPages: data?.meta.totalPages ?? 1,
          onPageChange: handlePageChange,
          labels: {
            previous: 'Anterior',
            next: 'Siguiente',
          },
        }}
        rowKey={(row) => row.id}
        rows={rows}
        tableAriaLabel='Listado de categorias'
      />
    </section>
  )
}
