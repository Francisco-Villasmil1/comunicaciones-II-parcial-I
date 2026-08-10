import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { SubjectsApi } from '@/api/SubjectsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  SubjectsForm,
  type SubjectsFormValues,
} from '@/views/subjects/SubjectsForm'

export function EditSubject() {
  usePageTitle('Editar Materia')

  const navigate = useNavigate()
  const { subjectId } = useParams<{ subjectId: string }>()
  const queryClient = useQueryClient()

  const subjectQuery = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => {
      if (!subjectId) {
        throw new Error('ID de materia no provisto.')
      }

      return SubjectsApi.getById(subjectId)
    },
    enabled: Boolean(subjectId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: SubjectsFormValues) => {
      if (!subjectId) {
        throw new Error('ID de materia no provisto.')
      }

      console.log('Edit subject payload:', { subjectId, ...values })
      return SubjectsApi.update(subjectId, values)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['subjects'] }),
        queryClient.invalidateQueries({ queryKey: ['subject', subjectId] }),
      ])

      toast.success('¡La materia se ha actualizado con éxito!.')
      navigate('/materias')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la materia.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: SubjectsFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  if (!subjectId) {
    return (
      <main aria-label='Vista de edicion de materia' className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de materia invalido.</p>
      </main>
    )
  }

  if (subjectQuery.isLoading) {
    return (
      <main aria-label='Vista de edicion de materia' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando materia...</p>
      </main>
    )
  }

  if (subjectQuery.isError || !subjectQuery.data) {
    return (
      <main aria-label='Vista de edicion de materia' className='mx-auto w-full max-w-[980px] py-6 space-y-4'>
        <p>No se pudo cargar la materia.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/materias')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de edicion de materia' className='mx-auto w-full max-w-[980px] py-6'>
      <SubjectsForm
        key={`edit-subject-${subjectQuery.data.id}`}
        initialValues={{
          nombre: subjectQuery.data.nombre,
          codigo: subjectQuery.data.codigo,
        }}
        loading={updateMutation.isPending}
        onCancel={() => navigate('/materias')}
        onSubmit={onSubmit}
        origin='edition'
      />
    </main>
  )
}