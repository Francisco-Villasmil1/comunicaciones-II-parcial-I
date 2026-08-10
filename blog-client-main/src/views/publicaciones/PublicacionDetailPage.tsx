import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { ComentariosApi } from '@/api/ComentariosApi'
import { PublicacionesApi } from '@/api/PublicacionesApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { resolveImageUrl } from '@/utils/imageUrl'

export function PublicacionDetailPage() {
  const { publicacionId } = useParams<{ publicacionId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
    return <p>ID de publicacion invalido.</p>
  }

  if (publicacionQuery.isLoading) {
    return <p>Cargando publicacion...</p>
  }

  if (publicacionQuery.isError || !publicacionQuery.data) {
    return (
      <div className='space-y-4'>
        <p>No se pudo cargar la publicacion.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/publicaciones')}
          type='button'
        >
          Volver
        </button>
      </div>
    )
  }

  const publicacion = publicacionQuery.data

  return (
    <section className='mx-auto w-full max-w-[760px] space-y-6 pb-8'>
      <button
        className='rounded-md border border-slate-300 px-4 py-2 text-sm'
        onClick={() => navigate('/publicaciones')}
        type='button'
      >
        Volver al listado
      </button>

      <article className='space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <header className='space-y-2'>
          <h1 className='text-2xl font-bold text-ownText'>{publicacion.titulo}</h1>
          <p className='text-sm text-slate-500'>
            Por {publicacion.autorNombre} · {new Date(publicacion.fechaCreacion).toLocaleString()}
          </p>
        </header>

        {publicacion.contenido ? (
          <p className='whitespace-pre-wrap text-ownText'>{publicacion.contenido}</p>
        ) : (
          <p className='text-sm text-slate-400'>Sin contenido de texto.</p>
        )}

        {publicacion.imagenes.length > 0 && (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {publicacion.imagenes.map((imagen) => (
              <figure key={imagen.id} className='overflow-hidden rounded-lg border'>
                <img
                  alt={imagen.descripcion ?? publicacion.titulo}
                  className='h-48 w-full object-cover'
                  src={resolveImageUrl(imagen.url)}
                />
              </figure>
            ))}
          </div>
        )}

      </article>

      <section className='space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='text-lg font-semibold'>Comentarios</h2>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <input
            className='flex-1 rounded-md border border-slate-300 px-3 py-2'
            onChange={(event) => setComentario(event.target.value)}
            placeholder='Escribe un comentario...'
            value={comentario}
          />
          <button
            className='rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50'
            disabled={!comentario.trim() || createComentarioMutation.isPending}
            onClick={() => createComentarioMutation.mutate()}
            type='button'
          >
            Comentar
          </button>
        </div>

        <ul className='space-y-3'>
          {(comentariosQuery.data?.items ?? []).map((item) => (
            <li
              key={item.id}
              className='rounded-lg border border-slate-100 bg-slate-50 p-3'
            >
              <div className='mb-1 flex items-center justify-between gap-2'>
                <p className='text-sm font-semibold'>{item.usuarioNombre}</p>
                <button
                  className='text-xs text-red-600'
                  onClick={() => deleteComentarioMutation.mutate(item.id)}
                  type='button'
                >
                  Eliminar
                </button>
              </div>
              <p className='text-sm text-ownText'>{item.contenido}</p>
              <p className='mt-1 text-xs text-slate-400'>
                {new Date(item.fechaRegistro).toLocaleString()}
              </p>
            </li>
          ))}

          {(comentariosQuery.data?.items.length ?? 0) === 0 && (
            <p className='text-sm text-slate-400'>Aun no hay comentarios.</p>
          )}
        </ul>
      </section>
    </section>
  )
}
