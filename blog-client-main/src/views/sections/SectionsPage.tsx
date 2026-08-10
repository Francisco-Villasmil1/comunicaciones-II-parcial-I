import { SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { SectionsApi } from '@/api/SectionsApi'
import {
  BaseTable,
  type BaseTableColumn,
} from '@/components/BaseTable'
import { UtilityBar } from '@/components/UtilityBar'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageTitle } from '@/hooks/usePageTitle'

type SectionRow = {
  id: string
  materia: string
  docente: string
  campana: string
  numero: string
}

export function SectionsPage() {
  usePageTitle('Secciones')

  const { isMobile, isTablet } = useIsMobile()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Derivando los valores de los parametros de la URL
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  const searchValue = searchParams.get('search') || ''

  // Update los parametros de la URL cuando la búsqueda cambia
  const updateUrlParams = (search: string, page: number = 1) => {
    const newParams = new URLSearchParams()

    if (search.trim()) newParams.set('search', search.trim())
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
    search: searchParams.get('search') || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['sections', currentPage, apiParams],
    queryFn: () => SectionsApi.list(apiParams),
  })

  const rows: SectionRow[] =
    data?.items.map((item) => ({
      id: String(item.id),
      materia: item.materia,
      docente: isMobile ? item.docente.split(' ')[0] ?? item.docente : item.docente,
      campana: item.campana,
      numero: item.numero,
    })) ?? []

  const columns: BaseTableColumn<SectionRow>[] = [
    { key: 'materia', header: 'Materia', align: 'center' },
    { key: 'docente', header: 'Docente', align: 'center' },
    { key: 'campana', header: 'Campaña', align: 'center' },
    { key: 'numero', header: isMobile || isTablet ? 'Numero' : 'Numero de Seccion', align: 'center' },
    {
      key: 'editar',
      header: 'Editar',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Editar seccion ${row.numero}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/secciones/edit/${row.id}`)}
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
    <section aria-label='Modulo de secciones' className='mx-auto w-[calc(100%-10px)] max-w-[980px] space-y-6 pb-6 lg:w-full'>
      <UtilityBar
        createLabel='Nuevo'
        onCreateClick={() => navigate('/secciones/new')}
        searchPlaceholder='Buscar por docente, materia o número de sección...'
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showFilter={false}
      />

      <BaseTable<SectionRow>
        columns={columns}
        emptyMessage={isLoading ? 'Cargando secciones...' : 'Sin secciones registradas.'}
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
        tableAriaLabel='Listado de secciones'
      />
    </section>
  )
}
