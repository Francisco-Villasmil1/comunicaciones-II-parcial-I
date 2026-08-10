import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { PublicacionesApi } from '@/api/PublicacionesApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  PublicacionForm,
} from '@/views/publicaciones/PublicacionForm'
import type { PublicacionPayload } from '@/api/PublicacionesApi'

export function NewPublicacion() {
  usePageTitle('Nueva Publicacion')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (payload: PublicacionPayload) => {
      return PublicacionesApi.create(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['publicaciones'] })
      toast.success('La publicacion se ha guardado con exito.')
      navigate('/')
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo crear la publicacion.'
      toast.error(message)
    },
  })

  const onSubmit = async (payload: PublicacionPayload) => {
    await createMutation.mutateAsync(payload)
  }

  return (
    <section className='mx-auto max-w-3xl px-4 py-10 sm:px-6'>
      <h1 className='mb-8 font-serif text-3xl text-ink'>Nueva publicacion</h1>
      <PublicacionForm
        loading={createMutation.isPending}
        onCancel={() => navigate('/')}
        onSubmit={onSubmit}
        origin='creation'
      />
    </section>
  )
}
