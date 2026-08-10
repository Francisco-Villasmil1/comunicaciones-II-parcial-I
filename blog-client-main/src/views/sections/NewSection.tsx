import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { SectionsApi } from '@/api/SectionsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  SectionsForm,
  type SectionsFormValues,
} from '@/views/sections/SectionsForm'

export function NewSection() {
  usePageTitle('Nueva Seccion')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const optionsQuery = useQuery({
    queryKey: ['section-options'],
    queryFn: () => SectionsApi.getOptions(),
  })

  const createMutation = useMutation({
    mutationFn: async (values: SectionsFormValues) => {
      console.log('Create section payload:', values)
      return SectionsApi.create(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sections'] })
      toast.success('¡La sección se ha guardado con éxito!.')
      navigate('/secciones')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear la seccion.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: SectionsFormValues) => {
    await createMutation.mutateAsync(values)
  }

  if (optionsQuery.isLoading) {
    return (
      <main aria-label='Vista de creacion de seccion' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando opciones del formulario...</p>
      </main>
    )
  }

  if (optionsQuery.isError || !optionsQuery.data) {
    return (
      <main aria-label='Vista de creacion de seccion' className='mx-auto w-full max-w-[980px] py-6 space-y-4'>
        <p>No se pudieron cargar las opciones del formulario.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/secciones')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de creacion de seccion' className='mx-auto w-full max-w-[980px] py-6'>
      <SectionsForm
        loading={createMutation.isPending}
        options={optionsQuery.data}
        onCancel={() => navigate('/secciones')}
        onSubmit={onSubmit}
        origin='creation'
      />
    </main>
  )
}