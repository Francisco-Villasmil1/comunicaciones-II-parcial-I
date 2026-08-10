import { SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { SubjectsApi } from '@/api/SubjectsApi'
import {
  BaseTable,
  type BaseTableColumn,
} from '@/components/BaseTable'
import { UtilityBar } from '@/components/UtilityBar'
import { usePageTitle } from '@/hooks/usePageTitle'

type SubjectRow = {
  id: string
  nombre: string
  codigo: string
}

export function SubjectsPage() {
  usePageTitle('Materias')

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Derivando los valores de los parametros de la URL
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  const searchValue = searchParams.get('nombre') || ''

  // Update los parametros de la URL cuando la búsqueda cambia
  const updateUrlParams = (nombre: string, page: number = 1) => {
    const newParams = new URLSearchParams()

    if (nombre.trim()) newParams.set('nombre', nombre.trim())
    if (page > 1) newParams.set('page', page.toString())

    setSearchParams(newParams)
  }

  // Búsqueda del Handle
  const handleSearchChange = (value: string) => {
    updateUrlParams(value, 1)
  }

  // Construye parametros query para la API
  const apiParams = {
    page: currentPage,
    limit: 10,
    nombre: searchParams.get('nombre') || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['subjects', currentPage, apiParams],
    queryFn: () => SubjectsApi.list(apiParams),
  })

  const rows: SubjectRow[] =
    data?.items.map((item) => ({
      id: String(item.id),
      nombre: item.nombre,
      codigo: item.codigo,
    })) ?? []

  const columns: BaseTableColumn<SubjectRow>[] = [
    { key: 'nombre', header: 'Nombre', align: 'center' },
    { key: 'codigo', header: 'Codigo', align: 'center' },
    {
      key: 'editar',
      header: 'Editar',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Editar materia ${row.nombre}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/materias/edit/${row.id}`)}
          type='button'
        >
          <SquarePen size={18} />
        </button>
      ),
    },
  ]

  const handlePageChange = (page: number) => {
    updateUrlParams(searchValue, page)
  }

  return (
    <section aria-label='Modulo de materias' className='mx-auto w-[calc(100%-10px)] max-w-[980px] space-y-6 pb-6 lg:w-full'>
      <UtilityBar
        createLabel='Nuevo'
        onCreateClick={() => navigate('/materias/new')}
        searchPlaceholder='Buscar por nombre de materia...'
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showFilter={false}
      />

      <BaseTable<SubjectRow>
        columns={columns}
        emptyMessage={isLoading ? 'Cargando materias...' : 'Sin materias registradas.'}
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
        tableAriaLabel='Listado de materias'
      />
    </section>
  )
}
