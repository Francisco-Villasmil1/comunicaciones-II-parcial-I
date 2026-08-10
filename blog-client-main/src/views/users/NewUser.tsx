import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { UsersApi } from '@/api/UsersApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { UsersForm, type UsersFormValues } from '@/views/users/UsersForm'

export function NewUser() {
  usePageTitle('Nuevo Usuario')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (values: UsersFormValues) => {
      const payload = {
        nombre: values.nombre,
        apellido: values.apellido,
        correo: values.correo,
        rol: values.rol as 'ADMIN' | 'PROFESOR',
        estado: values.estado as 'activo' | 'inactivo',
        password: values.password ?? '',
      }

      console.log('Create user payload:', payload)
      return UsersApi.create(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('¡El usuario se ha creado con éxito!.')
      navigate('/usuarios')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear el usuario.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: UsersFormValues) => {
    await createMutation.mutateAsync(values)
  }

  return (
    <main aria-label='Vista de creacion de usuario' className='mx-auto w-full max-w-[980px] py-6'>
      <UsersForm
        loading={createMutation.isPending}
        onCancel={() => navigate('/usuarios')}
        onSubmit={onSubmit}
        origin='creation'
      />
    </main>
  )
}
