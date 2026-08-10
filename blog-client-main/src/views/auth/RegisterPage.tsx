import { MenuItem, TextField, Typography } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AuthApi } from '@/api/AuthApi'
import { BaseButton } from '@/components/BaseButton'
import { AuthFrame } from '@/components/auth/AuthFrame'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAppStore } from '@/store/useAppStore'

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/

const registerSchema = z
  .object({
    nombreUsuario: z
      .string()
      .regex(
        usernamePattern,
        'El nombre de usuario debe tener entre 3 y 30 caracteres (letras, numeros o _).',
      ),
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    correo: z.string().email('Correo invalido.'),
    password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirmar contrasena es requerido.'),
    rol: z.enum(['DUENO', 'LECTOR']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const fieldSx = {
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    minHeight: 40,
  },
  '& .MuiInputBase-input': {
    color: '#676464',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4b5563',
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#9ca3af',
    opacity: 1,
  },
}

function RegisterSection({ children }: { children: ReactNode }) {
  return (
    <section className='space-y-3 rounded-lg border border-slate-200 bg-white p-4 sm:p-5'>
      {children}
    </section>
  )
}

export function RegisterPage() {
  usePageTitle('Registro')

  const navigate = useNavigate()
  const { isMobile } = useIsMobile()
  const setSession = useAppStore((state) => state.setSession)
  const setUser = useAppStore((state) => state.setUser)

  const canRegisterQuery = useQuery({
    queryKey: ['can-register-dueno'],
    queryFn: () => AuthApi.canRegisterDueno(),
  })

  const canRegisterDueno = canRegisterQuery.data?.canRegisterDueno ?? false

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      nombreUsuario: '',
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      confirmPassword: '',
      rol: 'LECTOR',
    },
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const parsed = registerSchema.safeParse(values)

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Datos invalidos.')
      }

      return AuthApi.register({
        nombreUsuario: parsed.data.nombreUsuario,
        nombre: parsed.data.nombre?.trim() || undefined,
        apellido: parsed.data.apellido?.trim() || undefined,
        correo: parsed.data.correo,
        password: parsed.data.password,
        rol: canRegisterDueno ? parsed.data.rol ?? 'LECTOR' : undefined,
      })
    },
    onSuccess: (result) => {
      setSession(result.token)
      setUser(result.user)
      toast.success('Registro exitoso.')
      navigate('/', { replace: true })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo completar el registro.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    const parsed = registerSchema.safeParse(values)

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Datos invalidos.')
      return
    }

    if (canRegisterDueno && !parsed.data.rol) {
      toast.error('Selecciona un tipo de cuenta.')
      return
    }

    await registerMutation.mutateAsync(values)
  }

  return (
    <AuthFrame maxWidthClassName='max-w-[760px]' title='Crear cuenta'>
      <div className='flex flex-col items-center gap-6'>
        <form
          className='w-full space-y-5'
          id='register-form'
          key={canRegisterDueno ? 'with-dueno' : 'lector-only'}
          onSubmit={handleSubmit(onSubmit)}
        >
          <RegisterSection>
            <div className='space-y-3'>
              <TextField
                error={Boolean(errors.nombreUsuario)}
                fullWidth
                helperText={errors.nombreUsuario?.message}
                placeholder='Nombre de usuario'
                size='small'
                sx={fieldSx}
                {...register('nombreUsuario', {
                  required: 'El nombre de usuario es requerido.',
                })}
              />

              <TextField
                error={Boolean(errors.correo)}
                fullWidth
                helperText={errors.correo?.message}
                placeholder='Correo'
                size='small'
                sx={fieldSx}
                type='email'
                {...register('correo', { required: 'Correo requerido.' })}
              />

              {canRegisterDueno ? (
                <Controller
                  control={control}
                  name='rol'
                  rules={{ required: 'Tipo de cuenta requerido.' }}
                  render={({ field }) => (
                    <TextField
                      error={Boolean(errors.rol)}
                      fullWidth
                      helperText={errors.rol?.message}
                      select
                      size='small'
                      sx={fieldSx}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    >
                      <MenuItem disabled value=''>
                        Seleccionar tipo - - - -&gt;
                      </MenuItem>
                      <MenuItem value='LECTOR'>Usuario del blog</MenuItem>
                      <MenuItem value='DUENO'>Dueño del blog</MenuItem>
                    </TextField>
                  )}
                />
              ) : null}
            </div>
          </RegisterSection>

          <RegisterSection>
            <div className={isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-3'}>
              <TextField
                fullWidth
                placeholder='Nombre (opcional)'
                size='small'
                sx={fieldSx}
                {...register('nombre')}
              />

              <TextField
                fullWidth
                placeholder='Apellido (opcional)'
                size='small'
                sx={fieldSx}
                {...register('apellido')}
              />
            </div>
          </RegisterSection>

          <RegisterSection>
            <div className='space-y-3'>
              <TextField
                error={Boolean(errors.password)}
                fullWidth
                helperText={errors.password?.message}
                placeholder='Contraseña'
                size='small'
                sx={fieldSx}
                type='password'
                {...register('password', { required: 'Contraseña requerida.' })}
              />

              <TextField
                error={Boolean(errors.confirmPassword)}
                fullWidth
                helperText={errors.confirmPassword?.message}
                placeholder='Confirmar contraseña'
                size='small'
                sx={fieldSx}
                type='password'
                {...register('confirmPassword', {
                  required: 'Confirmar contraseña es requerido.',
                })}
              />

              {!passwordsMatch && confirmPassword ? (
                <Typography color='error' variant='body2'>
                  Las contrasenas no coinciden.
                </Typography>
              ) : null}
            </div>
          </RegisterSection>
        </form>

        <div className='mx-auto w-full max-w-[220px]'>
          <BaseButton
            className='min-h-[50px] w-full'
            form='register-form'
            loading={registerMutation.isPending}
            text='Registrarse'
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

        <p className='text-sm text-slate-600'>
          ¿Ya tienes cuenta?{' '}
          <Link className='font-medium text-primary hover:underline' to='/auth/login'>
            Inicia sesion
          </Link>
        </p>
      </div>
    </AuthFrame>
  )
}
