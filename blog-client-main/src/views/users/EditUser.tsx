import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { UsersApi } from '@/api/UsersApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { UsersForm, type UsersFormValues } from '@/views/users/UsersForm'

export function EditUser() {
  usePageTitle('Editar Usuario')

  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const queryClient = useQueryClient()

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('ID de usuario no provisto.')
      }

      return UsersApi.getById(userId)
    },
    enabled: Boolean(userId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: UsersFormValues) => {
      if (!userId) {
        throw new Error('ID de usuario no provisto.')
      }

      const payload = {
        nombre: values.nombre,
        apellido: values.apellido,
        correo: values.correo,
        rol: values.rol as 'ADMIN' | 'PROFESOR',
        estado: values.estado as 'activo' | 'inactivo',
        password: values.password?.trim() ? values.password : undefined,
      }

      console.log('Edit user payload:', { userId, ...payload })
      return UsersApi.update(userId, payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['user', userId] }),
      ])

      toast.success('¡El usuario se ha actualizado con éxito!.')
      navigate('/usuarios')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el usuario.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: UsersFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  if (!userId) {
    return (
      <main aria-label='Vista de edicion de usuario' className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de usuario invalido.</p>
      </main>
    )
  }

  if (userQuery.isLoading) {
    return (
      <main aria-label='Vista de edicion de usuario' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando usuario...</p>
      </main>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <main aria-label='Vista de edicion de usuario' className='mx-auto w-full max-w-[980px] py-6 space-y-4'>
        <p>No se pudo cargar el usuario.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/usuarios')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de edicion de usuario' className='mx-auto w-full max-w-[980px] py-6'>
      <UsersForm
        key={`edit-user-${userQuery.data.id}`}
        initialValues={{
          nombre: userQuery.data.nombre,
          apellido: userQuery.data.apellido,
          correo: userQuery.data.correo,
          rol: userQuery.data.rol,
          estado: userQuery.data.estado,
          password: '',
          confirmPassword: '',
        }}
        loading={updateMutation.isPending}
        onCancel={() => navigate('/usuarios')}
        onSubmit={onSubmit}
        origin='edition'
      />
    </main>
  )
}
