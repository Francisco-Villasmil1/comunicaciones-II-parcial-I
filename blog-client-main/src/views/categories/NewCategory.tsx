import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { CategoriesApi, type CategoryPayload } from '@/api/CategoriesApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  CategoriesForm,
  type CategoriesFormValues,
} from '@/views/categories/CategoriesForm'

export function NewCategory() {
  usePageTitle('Nueva Categoria')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (values: CategoriesFormValues) => {
      console.log('Create category payload:', values)

      const payload: CategoryPayload = {
        descripcion: values.descripcion,
        rango: values.rango,
        genero: values.genero as CategoryPayload['genero'],
      }

      return CategoriesApi.create(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('¡La categoría se ha guardado con éxito!.')
      navigate('/categorias')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear la categoria.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: CategoriesFormValues) => {
    await createMutation.mutateAsync(values)
  }

  return (
    <main aria-label='Vista de creacion de categoria' className='mx-auto w-full max-w-[980px] py-6'>
      <CategoriesForm
        loading={createMutation.isPending}
        onCancel={() => navigate('/categorias')}
        onSubmit={onSubmit}
        origin='creation'
      />
    </main>
  )
}
