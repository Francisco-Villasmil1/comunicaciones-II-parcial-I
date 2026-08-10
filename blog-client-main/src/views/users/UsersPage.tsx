import { SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { UsersApi } from '@/api/UsersApi'
import {
  BaseTable,
  type BaseTableColumn,
} from '@/components/BaseTable'
import { UserFilterDropdown, type UserActiveFilters } from '@/components/UserFilterDropdown'
import { UtilityBar } from '@/components/UtilityBar'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageTitle } from '@/hooks/usePageTitle'

type UserRow = {
  id: string
  nombre: string
  apellido: string
  correo: string
  rol: string
  estado: string
}

const formatEstado = (estado: string) =>
  estado === 'activo' ? 'Activo' : estado === 'inactivo' ? 'Inactivo' : estado

export function UsersPage() {
  usePageTitle('Usuarios')

  const navigate = useNavigate()
  const { isMobile } = useIsMobile()
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
  const getActiveFilters = (): UserActiveFilters => {
    const filters: UserActiveFilters = {}
    const rol = searchParams.get('rol')
    const estado = searchParams.get('estado')
    const nombre = searchParams.get('nombre')

    if (rol) filters.rol = rol
    if (estado) filters.estado = estado
    if (nombre) filters.nombre = nombre

    return filters
  }

  // Update los parametros de la URL cuando los filtros activos cambian
  const updateUrlParams = (filters: UserActiveFilters, page: number = 1) => {
    const newParams = new URLSearchParams()

    if (filters.rol) newParams.set('rol', filters.rol as string)
    if (filters.estado) newParams.set('estado', filters.estado as string)
    if (filters.nombre) newParams.set('nombre', filters.nombre as string)
    if (page > 1) newParams.set('page', page.toString())

    setSearchParams(newParams)
  }

  // Cambio del filtro del Handle
  const handleFiltersChange = (filters: UserActiveFilters) => {
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
    rol: searchParams.get('rol') || undefined,
    estado: searchParams.get('estado') || undefined,
    nombre: searchParams.get('nombre') || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['users', currentPage, apiParams],
    queryFn: () => UsersApi.list(apiParams),
  })

  const rows: UserRow[] =
    data?.items.map((item) => ({
      id: String(item.id),
      nombre: item.nombre,
      apellido: item.apellido,
      correo: item.correo,
      rol: item.rol,
      estado: formatEstado(item.estado),
    })) ?? []

  const columns: BaseTableColumn<UserRow>[] = [
    { key: 'nombre', header: 'Nombre', align: 'center' },
    { key: 'apellido', header: 'Apellido', align: 'center' },
    ...(isMobile
      ? []
      : [
        {
          key: 'correo',
          header: 'Correo',
          align: 'center' as const,
        },
      ]),
    { key: 'rol', header: 'Rol', align: 'center' },
    ...(isMobile
      ? []
      : [
        {
          key: 'estado',
          header: 'Estado',
          align: 'center' as const,
        },
      ]),
    {
      key: 'editar',
      header: 'Editar',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Editar usuario ${row.nombre} ${row.apellido}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/usuarios/edit/${row.id}`)}
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
    <section aria-label='Modulo de usuarios' className='mx-auto w-[calc(100%-10px)] max-w-[980px] space-y-6 pb-6 lg:w-full'>
      <div className="relative" ref={filterContainerRef}>
        <UtilityBar
          createLabel='Nuevo'
          onCreateClick={() => navigate('/usuarios/new')}
          searchPlaceholder='Buscar por nombre...'
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          showFilter={true}
          onFilterClick={handleFilterClick}
          filterCount={getActiveFiltersCount()}
        />

        {/* Filter dropdown positioned relative to UtilityBar */}
        {isFilterOpen && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <UserFilterDropdown
              onFiltersChange={handleFiltersChange}
              activeFilters={getActiveFilters()}
              className="shadow-lg"
              showTrigger={false}
            />
          </div>
        )}
      </div>

      <BaseTable<UserRow>
        columns={columns}
        emptyMessage={isLoading ? 'Cargando usuarios...' : 'Sin usuarios registrados.'}
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
        tableAriaLabel='Listado de usuarios'
      />
    </section>
  )
}
