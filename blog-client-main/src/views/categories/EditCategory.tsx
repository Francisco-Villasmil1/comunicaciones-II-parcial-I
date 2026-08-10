import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { CategoriesApi, type CategoryPayload } from '@/api/CategoriesApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  CategoriesForm,
  type CategoriesFormValues,
} from '@/views/categories/CategoriesForm'

export function EditCategory() {
  usePageTitle('Editar Categoria')

  const navigate = useNavigate()
  const { categoryId } = useParams<{ categoryId: string }>()
  const queryClient = useQueryClient()

  const categoryQuery = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => {
      if (!categoryId) {
        throw new Error('ID de categoria no provisto.')
      }

      return CategoriesApi.getById(categoryId)
    },
    enabled: Boolean(categoryId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: CategoriesFormValues) => {
      if (!categoryId) {
        throw new Error('ID de categoria no provisto.')
      }

      console.log('Edit category payload:', { categoryId, ...values })

      const payload: CategoryPayload = {
        descripcion: values.descripcion,
        rango: values.rango,
        genero: values.genero as CategoryPayload['genero'],
      }

      return CategoriesApi.update(categoryId, payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['category', categoryId] }),
      ])

      toast.success('¡La categoría se ha actualizado con éxito!.')
      navigate('/categorias')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la categoria.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: CategoriesFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  if (!categoryId) {
    return (
      <main aria-label='Vista de edicion de categoria' className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de categoria invalido.</p>
      </main>
    )
  }

  if (categoryQuery.isLoading) {
    return (
      <main aria-label='Vista de edicion de categoria' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando categoria...</p>
      </main>
    )
  }

  if (categoryQuery.isError || !categoryQuery.data) {
    return (
      <main aria-label='Vista de edicion de categoria' className='mx-auto w-full max-w-[980px] py-6 space-y-4'>
        <p>No se pudo cargar la categoria.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/categorias')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de edicion de categoria' className='mx-auto w-full max-w-[980px] py-6'>
      <CategoriesForm
        key={`edit-category-${categoryQuery.data.id}`}
        initialValues={{
          descripcion: categoryQuery.data.descripcion,
          rango: categoryQuery.data.rango,
          genero: categoryQuery.data.genero,
        }}
        loading={updateMutation.isPending}
        onCancel={() => navigate('/categorias')}
        onSubmit={onSubmit}
        origin='edition'
      />
    </main>
  )
}
