import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { SubjectsApi } from '@/api/SubjectsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  SubjectsForm,
  type SubjectsFormValues,
} from '@/views/subjects/SubjectsForm'

export function NewSubject() {
  usePageTitle('Nueva Materia')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (values: SubjectsFormValues) => {
      console.log('Create subject payload:', values)
      return SubjectsApi.create(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast.success('¡La materia se ha guardado con éxito!.')
      navigate('/materias')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear la materia.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: SubjectsFormValues) => {
    await createMutation.mutateAsync(values)
  }

  return (
    <main aria-label='Vista de creacion de materia' className='mx-auto w-full max-w-[980px] py-6'>
      <SubjectsForm
        loading={createMutation.isPending}
        onCancel={() => navigate('/materias')}
        onSubmit={onSubmit}
        origin='creation'
      />
    </main>
  )
}