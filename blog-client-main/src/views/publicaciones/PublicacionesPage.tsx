import { Eye, SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { PublicacionesApi } from '@/api/PublicacionesApi'
import {
  BaseTable,
  type BaseTableColumn,
} from '@/components/BaseTable'
import { UtilityBar } from '@/components/UtilityBar'
import { usePageTitle } from '@/hooks/usePageTitle'

type PublicacionRow = {
  id: string
  titulo: string
  autor: string
  comentarios: string
}

export function PublicacionesPage() {
  usePageTitle('Publicaciones')

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  const searchValue = searchParams.get('titulo') || ''

  const updateUrlParams = (titulo: string, page: number = 1) => {
    const newParams = new URLSearchParams()

    if (titulo.trim()) newParams.set('titulo', titulo.trim())
    if (page > 1) newParams.set('page', page.toString())

    setSearchParams(newParams)
  }

  const handleSearchChange = (value: string) => {
    updateUrlParams(value, 1)
  }

  const apiParams = {
    page: currentPage,
    limit: 10,
    titulo: searchParams.get('titulo') || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['publicaciones', currentPage, apiParams],
    queryFn: () => PublicacionesApi.list(apiParams),
  })

  const rows: PublicacionRow[] =
    data?.items.map((item) => ({
      id: String(item.id),
      titulo: item.titulo,
      autor: item.autorNombre,
      comentarios: String(item.totalComentarios),
    })) ?? []

  const columns: BaseTableColumn<PublicacionRow>[] = [
    { key: 'titulo', header: 'Titulo', align: 'center' },
    { key: 'autor', header: 'Autor', align: 'center' },
    { key: 'comentarios', header: 'Comentarios', align: 'center' },
    {
      key: 'ver',
      header: 'Ver',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Ver publicacion ${row.titulo}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/publicaciones/${row.id}`)}
          type='button'
        >
          <Eye size={18} />
        </button>
      ),
    },
    {
      key: 'editar',
      header: 'Editar',
      align: 'center',
      render: (row) => (
        <button
          aria-label={`Editar publicacion ${row.titulo}`}
          className='inline-flex items-center justify-center text-ownText transition-colors hover:text-primary'
          onClick={() => navigate(`/publicaciones/edit/${row.id}`)}
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
    <section
      aria-label='Modulo de publicaciones'
      className='mx-auto w-[calc(100%-10px)] max-w-[980px] space-y-6 pb-6 lg:w-full'
    >
      <UtilityBar
        createLabel='Nuevo'
        onCreateClick={() => navigate('/publicaciones/new')}
        searchPlaceholder='Buscar por titulo...'
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showFilter={false}
      />

      <BaseTable<PublicacionRow>
        columns={columns}
        emptyMessage={isLoading ? 'Cargando publicaciones...' : 'Sin publicaciones registradas.'}
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
        tableAriaLabel='Listado de publicaciones'
      />
    </section>
  )
}
