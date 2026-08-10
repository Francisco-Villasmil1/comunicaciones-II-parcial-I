import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import { PublicacionesApi } from '@/api/PublicacionesApi'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { useIsDueno } from '@/hooks/useIsDueno'
import { usePageTitle } from '@/hooks/usePageTitle'

const categoryCards = [
  {
    label: 'Viajes',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Comida',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Relax',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
]

export function BlogHomePage() {
  usePageTitle('Mi Blog')
  const isDueno = useIsDueno()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1

  const { data, isLoading } = useQuery({
    queryKey: ['publicaciones', currentPage],
    queryFn: () => PublicacionesApi.list({ page: currentPage, limit: 6 }),
  })

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <section className='relative h-[360px] overflow-hidden sm:h-[420px]'>
        <img
          alt='Paisaje del blog'
          className='absolute inset-0 h-full w-full object-cover'
          src='https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80'
        />
        <div className='absolute inset-0 bg-black/35' />
        <div className='relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center text-white sm:px-6'>
          <p className='text-sm uppercase tracking-[0.35em] text-white/90'>Blog personal</p>
          <h1 className='mt-3 font-serif text-5xl sm:text-6xl'>Going Places</h1>
          <p className='mt-4 max-w-xl text-base text-white/90 sm:text-lg'>
            No he estado en todas partes, pero esta en mi lista.
          </p>
        </div>
      </section>

      <section className='mx-auto max-w-3xl px-4 py-12 text-center sm:px-6'>
        <p className='text-base leading-8 text-ownText'>
          Bienvenido a mi espacio en linea. Aqui comparto experiencias, ideas y
          momentos que merecen quedarse escritos. Explora las publicaciones y deja
          tus comentarios.
        </p>
      </section>

      <section className='mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6'>
        {categoryCards.map((category) => (
          <a
            key={category.label}
            className='group relative block h-56 overflow-hidden'
            href='#publicaciones'
          >
            <img
              alt={category.label}
              className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              src={category.image}
            />
            <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
              <span className='bg-white px-6 py-2 text-sm font-semibold uppercase tracking-wide text-primary'>
                {category.label}
              </span>
            </div>
          </a>
        ))}
      </section>

      <section className='mx-auto mt-10 max-w-6xl border-y border-slate-200 bg-slate-50 px-4 py-6 sm:px-6'>
        <p className='text-center text-xs uppercase tracking-[0.25em] text-slate-500'>
          Publicaciones recientes
        </p>
      </section>

      <section
        aria-label='Listado de publicaciones'
        className='mx-auto max-w-4xl px-4 py-12 sm:px-6'
        id='publicaciones'
      >
        {isLoading ? (
          <p className='text-center text-slate-500'>Cargando publicaciones...</p>
        ) : null}

        {!isLoading && (data?.items.length ?? 0) === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center'>
            <p className='text-lg text-slate-600'>Aun no hay publicaciones.</p>
            {isDueno ? (
              <p className='mt-2 text-sm text-slate-500'>
                Usa el boton &quot;Nueva publicacion&quot; para crear la primera entrada.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className='space-y-12'>
          {(data?.items ?? []).map((publicacion) => (
            <BlogPostCard
              key={publicacion.id}
              publicacion={publicacion}
              showOwnerActions={isDueno}
            />
          ))}
        </div>

        {(data?.meta.totalPages ?? 1) > 1 ? (
          <div className='mt-12 flex items-center justify-center gap-3'>
            <button
              className='rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40'
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              type='button'
            >
              Anterior
            </button>
            <span className='text-sm text-slate-500'>
              Pagina {currentPage} de {data?.meta.totalPages ?? 1}
            </span>
            <button
              className='rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40'
              disabled={currentPage >= (data?.meta.totalPages ?? 1)}
              onClick={() => handlePageChange(currentPage + 1)}
              type='button'
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </section>
    </>
  )
}
