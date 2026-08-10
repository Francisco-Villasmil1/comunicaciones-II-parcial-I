import { SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { CampaignsApi } from '@/api/CampaignsApi'
import {
  BaseTable,
  type BaseTableColumn,
} from '@/components/BaseTable'
import { CampaignFilterDropdown, type CampaignActiveFilters } from '@/components/CampaignFilterDropdown'
import { UtilityBar } from '@/components/UtilityBar'
import { usePageTitle } from '@/hooks/usePageTitle'

type CampaignRow = {
  id: string
  nombre: string
  inicio: string
  fin: string
  estado: string
}

const formatEstado = (estado: string) =>
  estado === 'activa' ? 'Activa' : estado === 'cerrada' ? 'Cerrada' : estado

export function CampaignsPage() {
  usePageTitle('Campañas')

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterContainerRef = useRef<HTMLDivElement>(null)

  // Derivando los valores de los parametros de la URL
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  const searchValue = searchParams.get('nombre') || ''

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
  const getActiveFilters = (): CampaignActiveFilters => {
    const filters: CampaignActiveFilters = {}
    const estado = searchParams.get('estado')
    const nombre = searchParams.get('nombre')

    if (estado) filters.estado = estado
    if (nombre) filters.nombre = nombre

    return filters
  }

  // Update los parametros de la URL cuando los filtros activos cambian
  const updateUrlParams = (filters: CampaignActiveFilters, page: number = 1) => {
    const newParams = new URLSearchParams()

    if (filters.estado) newParams.set('estado', filters.estado as string)
    if (filters.nombre) newParams.set('nombre', filters.nombre as string)
    if (page > 1) newParams.set('page', page.toString())

    setSearchParams(newParams)
  }

  // Cambio del filtro del Handle
  const handleFiltersChange = (filters: CampaignActiveFilters) => {
    updateUrlParams(filters, 1)
  }

  // Busqueda del Handle
  const handleSearchChange = (value: string) => {
    const filters = getActiveFilters()
    if (value.trim()) {
      filters.nombre = value.trim()
    } else {
      delete filters.nombre
    }

    updateUrlParams(filters, 1)
  }

  // Construye parametros query para la API
  const apiParams = {
    page: currentPage,
    limit: 10,
    estado: searchParams.get('estado') || undefined,
    nombre: searchParams.get('nombre') || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', currentPage, apiParams],
    queryFn: () => CampaignsApi.list(apiParams),
  })

  const rows: CampaignRow[] =
    data?.items.map((item) => ({
      id: String(item.id),
      nombre: item.nombre,
      inicio: item.inicio,
      fin: item.fin,
      estado: formatEstado(item.estado),
    })) ?? []

  const columns: BaseTableColumn<CampaignRow>[] = [
    { key: 'nombre', header: 'Nombre', align: 'center' },
    { key: 'inicio', header: 'Inicio', align: 'center' },
    { key: 'fin', header: 'Fin', align: 'center' },
    { key: 'estado', header: 'Estado', align: 'center' },
    {
      key: 'editar',
      header: 'Editar',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Editar campaña ${row.nombre}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/campanas/edit/${row.id}`)}
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
    <section aria-label='Modulo de campanas' className='mx-auto w-[calc(100%-10px)] max-w-[980px] space-y-6 pb-6 lg:w-full'>
      <div className="relative" ref={filterContainerRef}>
        <UtilityBar
          createLabel='Nuevo'
          onCreateClick={() => navigate('/campanas/new')}
          searchPlaceholder='Buscar por campaña...'
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          showFilter={true}
          onFilterClick={handleFilterClick}
          filterCount={getActiveFiltersCount()}
        />

        {isFilterOpen && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <CampaignFilterDropdown
              onFiltersChange={handleFiltersChange}
              activeFilters={getActiveFilters()}
              className="shadow-lg"
              showTrigger={false}
            />
          </div>
        )}
      </div>

      <BaseTable<CampaignRow>
        columns={columns}
        emptyMessage={isLoading ? 'Cargando campañas...' : 'Sin campañas registradas.'}
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
        tableAriaLabel='Listado de campanas'
      />
    </section>
  )
}
