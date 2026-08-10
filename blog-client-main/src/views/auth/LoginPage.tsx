import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { AuthApi } from '@/api/AuthApi'
import { BaseButton } from '@/components/BaseButton'
import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { AuthFrame } from '@/components/auth/AuthFrame'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAppStore } from '@/store/useAppStore'

const loginSchema = z.object({
  identificador: z.string().min(1, 'El correo o usuario es requerido.'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  usePageTitle('Login')

  const navigate = useNavigate()
  const setSession = useAppStore((state) => state.setSession)
  const setUser = useAppStore((state) => state.setUser)

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const parsed = loginSchema.safeParse(values)

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Datos invalidos.')
      }

      return AuthApi.login(parsed.data)
    },
    onSuccess: (result) => {
      setSession(result.token)
      setUser(result.user)
      toast.success('Inicio de sesion exitoso.')
      navigate('/', { replace: true })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesion.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    const parsed = loginSchema.safeParse(values)

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Datos invalidos.')
      return
    }

    await loginMutation.mutateAsync(values)
  }

  const loginFields: BaseFormField<LoginFormValues>[] = [
    {
      name: 'identificador',
      label: 'Correo o nombre de usuario',
      placeholder: 'Correo o nombre de usuario...',
      type: 'text' as const,
      rules: {
        required: 'El correo o usuario es requerido.',
      },
    },
    {
      name: 'password',
      label: 'Contraseña',
      placeholder: 'Escribe tu contraseña aca...',
      type: 'password' as const,
      rules: {
        required: 'La contraseña es requerida.',
      },
    },
  ]

  return (
    <AuthFrame title='Iniciar sesion'>
      <div className='flex flex-col gap-6'>
        <BaseForm<LoginFormValues>
          className='space-y-3 !p-0 !shadow-none'
          defaultValues={{
            identificador: '',
            password: '',
          }}
          fields={loginFields}
          id='login-form'
          onSubmit={onSubmit}
          width='100%'
        />

        <div className='mx-auto w-full max-w-[220px]'>
          <BaseButton
            className='min-h-[50px] w-full'
            form='login-form'
            loading={loginMutation.isPending}
            text='Iniciar Sesion'
            type='submit'
            tone='primary'
            sx={{
              backgroundColor: '#002244',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0px 4px 6px rgba(0, 34, 68, 0.25)',
              fontWeight: 700,
              fontSize: '18px',
              minHeight: 50,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#003366',
              },
            }}
          />
        </div>

        <p className='text-center text-sm text-slate-600'>
          ¿No tienes cuenta?{' '}
          <Link className='font-medium text-primary hover:underline' to='/auth/register'>
            Registrate
          </Link>
        </p>
      </div>
    </AuthFrame>
  )
}
