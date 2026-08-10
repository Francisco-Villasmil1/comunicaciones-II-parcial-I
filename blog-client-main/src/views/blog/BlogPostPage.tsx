import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { ComentariosApi } from '@/api/ComentariosApi'
import { PublicacionesApi } from '@/api/PublicacionesApi'
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated'
import { useIsDueno } from '@/hooks/useIsDueno'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAppStore } from '@/store/useAppStore'
import { getUserAvatarStyleFromName } from '@/utils/avatar'
import { formatBlogDate, getReadingTimeMinutes } from '@/utils/blog'
import { resolveImageUrl } from '@/utils/imageUrl'

export function BlogPostPage() {
  const { publicacionId } = useParams<{ publicacionId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isDueno = useIsDueno()
  const isAuthenticated = useIsAuthenticated()
  const user = useAppStore((state) => state.user)
  const [comentario, setComentario] = useState('')

  const publicacionQuery = useQuery({
    queryKey: ['publicacion', publicacionId],
    queryFn: () => PublicacionesApi.getById(publicacionId!),
    enabled: Boolean(publicacionId),
  })

  const comentariosQuery = useQuery({
    queryKey: ['comentarios', publicacionId],
    queryFn: () =>
      ComentariosApi.list({
        publicacionId: Number(publicacionId),
        page: 1,
        limit: 50,
      }),
    enabled: Boolean(publicacionId),
  })

  usePageTitle(publicacionQuery.data?.titulo ?? 'Publicacion')

  const createComentarioMutation = useMutation({
    mutationFn: () =>
      ComentariosApi.create({
        contenido: comentario,
        idPublicacion: Number(publicacionId),
      }),
    onSuccess: async () => {
      setComentario('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['comentarios', publicacionId] }),
        queryClient.invalidateQueries({ queryKey: ['publicaciones'] }),
        queryClient.invalidateQueries({ queryKey: ['publicacion', publicacionId] }),
      ])
      toast.success('Comentario agregado.')
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo agregar el comentario.'
      toast.error(message)
    },
  })

  const deleteComentarioMutation = useMutation({
    mutationFn: (comentarioId: number) => ComentariosApi.remove(comentarioId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['comentarios', publicacionId] }),
        queryClient.invalidateQueries({ queryKey: ['publicaciones'] }),
      ])
      toast.success('Comentario eliminado.')
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo eliminar el comentario.'
      toast.error(message)
    },
  })

  if (!publicacionId) {
    return <p className='px-4 py-10 text-center'>Publicacion invalida.</p>
  }

  if (publicacionQuery.isLoading) {
    return <p className='px-4 py-10 text-center text-slate-500'>Cargando publicacion...</p>
  }

  if (publicacionQuery.isError || !publicacionQuery.data) {
    return (
      <div className='mx-auto max-w-3xl space-y-4 px-4 py-10 text-center sm:px-6'>
        <p>No se pudo cargar la publicacion.</p>
        <Link className='text-primary underline' to='/'>
          Volver al inicio
        </Link>
      </div>
    )
  }

  const publicacion = publicacionQuery.data
  const coverUrl = publicacion.imagenes[0]?.url
    ? resolveImageUrl(publicacion.imagenes[0].url)
    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  const { initial, backgroundColor } = getUserAvatarStyleFromName(publicacion.autorNombre)
  const readingTime = getReadingTimeMinutes(publicacion.contenido)

  return (
    <article className='pb-16'>
      <div className='relative h-[320px] overflow-hidden sm:h-[420px]'>
        <img alt={publicacion.titulo} className='h-full w-full object-cover' src={coverUrl} />
        <div className='absolute inset-0 bg-black/30' />
      </div>

      <div className='mx-auto max-w-3xl px-4 sm:px-6'>
        <div className='-mt-16 relative rounded-xl bg-white p-6 shadow-panel sm:p-8'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3 text-sm text-slate-500'>
              <span
                className='flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white'
                style={{ backgroundColor }}
              >
                {initial}
              </span>
              <div>
                <p>{publicacion.autorNombre}</p>
                <p>
                  {formatBlogDate(publicacion.fechaCreacion)} · {readingTime} min de lectura
                </p>
              </div>
            </div>

            {isDueno ? (
              <button
                className='inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50'
                onClick={() => navigate(`/publicaciones/edit/${publicacion.id}`)}
                type='button'
              >
                <Pencil size={15} />
                Editar
              </button>
            ) : null}
          </div>

          <h1 className='mt-6 font-serif text-4xl leading-tight text-ink sm:text-5xl'>
            {publicacion.titulo}
          </h1>

          {publicacion.contenido ? (
            <div className='mt-6 whitespace-pre-wrap text-base leading-8 text-ownText'>
              {publicacion.contenido}
            </div>
          ) : null}

          {publicacion.imagenes.length > 1 ? (
            <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {publicacion.imagenes.slice(1).map((imagen) => (
                <figure key={imagen.id} className='overflow-hidden rounded-lg'>
                  <img
                    alt={imagen.descripcion ?? publicacion.titulo}
                    className='h-56 w-full object-cover'
                    src={resolveImageUrl(imagen.url)}
                  />
                </figure>
              ))}
            </div>
          ) : null}

          <div className='mt-8 flex items-center gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500'>
            <MessageCircle size={16} />
            {publicacion.totalComentarios} comentarios
          </div>
        </div>

        <section className='mt-10 space-y-6'>
          <h2 className='font-serif text-2xl text-ink'>Comentarios</h2>

          {isAuthenticated ? (
            <div className='flex flex-col gap-3 sm:flex-row'>
              <input
                className='flex-1 rounded-md border border-slate-300 px-4 py-3'
                onChange={(event) => setComentario(event.target.value)}
                placeholder='Escribe un comentario...'
                value={comentario}
              />
              <button
                className='rounded-md bg-primary px-5 py-3 text-white disabled:opacity-50'
                disabled={!comentario.trim() || createComentarioMutation.isPending}
                onClick={() => createComentarioMutation.mutate()}
                type='button'
              >
                Comentar
              </button>
            </div>
          ) : (
            <p className='text-sm text-slate-500'>
              <Link className='font-medium text-primary hover:underline' to='/auth/login'>
                Inicia sesion
              </Link>{' '}
              o{' '}
              <Link className='font-medium text-primary hover:underline' to='/auth/register'>
                registrate
              </Link>{' '}
              para dejar un comentario.
            </p>
          )}

          <ul className='space-y-4'>
            {(comentariosQuery.data?.items ?? []).map((item) => (
              <li key={item.id} className='rounded-lg border border-slate-200 bg-white p-4'>
                <div className='mb-2 flex items-center justify-between gap-3'>
                  <p className='font-medium text-ink'>{item.usuarioNombre}</p>
                  {isDueno || item.usuario.id === user.id ? (
                    <button
                      className='text-xs text-red-600'
                      onClick={() => deleteComentarioMutation.mutate(item.id)}
                      type='button'
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
                <p className='text-ownText'>{item.contenido}</p>
                <p className='mt-2 text-xs text-slate-400'>
                  {formatBlogDate(item.fechaRegistro)}
                </p>
              </li>
            ))}

            {(comentariosQuery.data?.items.length ?? 0) === 0 ? (
              <p className='text-sm text-slate-400'>Aun no hay comentarios.</p>
            ) : null}
          </ul>
        </section>

        <div className='mt-10'>
          <Link className='text-sm font-medium text-primary hover:underline' to='/'>
            ← Volver al blog
          </Link>
        </div>
      </div>
    </article>
  )
}
