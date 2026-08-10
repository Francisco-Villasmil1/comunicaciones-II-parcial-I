import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { SectionsApi } from '@/api/SectionsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  SectionsForm,
  type SectionsFormValues,
} from '@/views/sections/SectionsForm'

export function EditSection() {
  usePageTitle('Editar Seccion')

  const navigate = useNavigate()
  const { sectionId } = useParams<{ sectionId: string }>()
  const queryClient = useQueryClient()

  const optionsQuery = useQuery({
    queryKey: ['section-options'],
    queryFn: () => SectionsApi.getOptions(),
  })

  const sectionQuery = useQuery({
    queryKey: ['section', sectionId],
    queryFn: () => {
      if (!sectionId) {
        throw new Error('ID de seccion no provisto.')
      }

      return SectionsApi.getById(sectionId)
    },
    enabled: Boolean(sectionId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: SectionsFormValues) => {
      if (!sectionId) {
        throw new Error('ID de seccion no provisto.')
      }

      console.log('Edit section payload:', { sectionId, ...values })
      return SectionsApi.update(sectionId, values)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sections'] }),
        queryClient.invalidateQueries({ queryKey: ['section', sectionId] }),
      ])

      toast.success('¡La sección se ha actualizado con éxito!.')
      navigate('/secciones')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la seccion.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: SectionsFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  if (!sectionId) {
    return (
      <main aria-label='Vista de edicion de seccion' className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de seccion invalido.</p>
      </main>
    )
  }

  if (optionsQuery.isLoading || sectionQuery.isLoading) {
    return (
      <main aria-label='Vista de edicion de seccion' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando datos de seccion...</p>
      </main>
    )
  }

  if (optionsQuery.isError || sectionQuery.isError || !optionsQuery.data || !sectionQuery.data) {
    return (
      <main aria-label='Vista de edicion de seccion' className='mx-auto w-full max-w-[980px] py-6 space-y-4'>
        <p>No se pudieron cargar los datos de la seccion.</p>
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
    <main aria-label='Vista de edicion de seccion' className='mx-auto w-full max-w-[980px] py-6'>
      <SectionsForm
        key={`edit-section-${sectionQuery.data.id}`}
        initialValues={{
          materia: String(sectionQuery.data.materiaId),
          docente: String(sectionQuery.data.docenteId),
          campana: String(sectionQuery.data.campanaId),
          numero: sectionQuery.data.numero,
        }}
        loading={updateMutation.isPending}
        options={optionsQuery.data}
        onCancel={() => navigate('/secciones')}
        onSubmit={onSubmit}
        origin='edition'
      />
    </main>
  )
}