import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { PublicacionesApi } from '@/api/PublicacionesApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  PublicacionForm,
} from '@/views/publicaciones/PublicacionForm'
import type { PublicacionPayload } from '@/api/PublicacionesApi'

export function EditPublicacion() {
  usePageTitle('Editar Publicacion')

  const navigate = useNavigate()
  const { publicacionId } = useParams<{ publicacionId: string }>()
  const queryClient = useQueryClient()

  const publicacionQuery = useQuery({
    queryKey: ['publicacion', publicacionId],
    queryFn: () => {
      if (!publicacionId) {
        throw new Error('ID de publicacion no provisto.')
      }

      return PublicacionesApi.getById(publicacionId)
    },
    enabled: Boolean(publicacionId),
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: PublicacionPayload) => {
      if (!publicacionId) {
        throw new Error('ID de publicacion no provisto.')
      }

      return PublicacionesApi.update(publicacionId, payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['publicaciones'] }),
        queryClient.invalidateQueries({ queryKey: ['publicacion', publicacionId] }),
      ])

      toast.success('La publicacion se ha actualizado con exito.')
      navigate('/')
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar la publicacion.'
      toast.error(message)
    },
  })

  const onSubmit = async (payload: PublicacionPayload) => {
    await updateMutation.mutateAsync(payload)
  }

  if (!publicacionId) {
    return (
      <main className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de publicacion invalido.</p>
      </main>
    )
  }

  if (publicacionQuery.isLoading) {
    return (
      <main className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando publicacion...</p>
      </main>
    )
  }

  if (publicacionQuery.isError || !publicacionQuery.data) {
    return (
      <main className='mx-auto w-full max-w-[980px] space-y-4 py-6'>
        <p>No se pudo cargar la publicacion.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <section className='mx-auto max-w-3xl px-4 py-10 sm:px-6'>
      <h1 className='mb-8 font-serif text-3xl text-ink'>Editar publicacion</h1>
      <PublicacionForm
        key={`edit-publicacion-${publicacionQuery.data.id}`}
        initialValues={{
          titulo: publicacionQuery.data.titulo,
          contenido: publicacionQuery.data.contenido ?? '',
        }}
        initialImages={publicacionQuery.data.imagenes.map((imagen) => ({
          url: imagen.url,
        }))}
        loading={updateMutation.isPending}
        onCancel={() => navigate('/')}
        onSubmit={onSubmit}
        origin='edition'
      />
    </section>
  )
}
