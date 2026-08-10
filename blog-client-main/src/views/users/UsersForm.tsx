import { Typography } from '@mui/material'
import { z } from 'zod'

import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { useIsMobile } from '@/hooks/useIsMobile'
import { UserRole } from '@/types/user'

const usersFormSchema = z.object({
  nombre: z.string().min(1, 'Los nombres son requeridos.'),
  apellido: z.string().min(1, 'Los apellidos son requeridos.'),
  correo: z.string().email('Correo invalido.'),
  rol: z.string().min(1, 'El rol es requerido.'),
  estado: z.string().min(1, 'El estado es requerido.'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden.',
  path: ['confirmPassword'],
})

export type UsersFormValues = z.infer<typeof usersFormSchema>

type UsersFormProps = {
  origin: 'creation' | 'edition'
  initialValues?: Partial<UsersFormValues>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: UsersFormValues) => Promise<void> | void
}

const roleOptions = [
  { label: 'Profesor', value: UserRole.PROFESOR },
  { label: 'Admin', value: UserRole.ADMIN },
]

const statusOptions = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
]

export function UsersForm({
  origin,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: UsersFormProps) {
  const { isMobile, isTablet } = useIsMobile()

  const formId = `users-form-${origin}`
  const isCompact = isMobile || isTablet
  const formWidth = isMobile ? 330 : isTablet ? 500 : 700

  const fields: BaseFormField<UsersFormValues>[] = [
    {
      name: 'nombre',
      label: 'Nombres',
      placeholder: 'Nombres',
      rules: { required: 'Los nombres son requeridos.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'apellido',
      label: 'Apellidos',
      placeholder: 'Apellidos',
      rules: { required: 'Los apellidos son requeridos.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'correo',
      label: 'Correo institucional',
      placeholder: 'ejemplo@unet.edu.ve',
      type: 'email',
      rules: { required: 'El correo es requerido.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'rol',
      label: 'Rol',
      placeholder: 'Seleccionar rol - - - ->',
      select: true,
      options: roleOptions,
      rules: { required: 'El rol es requerido.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'estado',
      label: 'Estado',
      placeholder: 'Seleccionar estado - - - ->',
      select: true,
      options: statusOptions,
      rules: { required: 'El estado es requerido.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'password',
      label: 'Contraseña',
      placeholder: 'Contraseña',
      type: 'password',
      rules:
        origin === 'creation'
          ? {
            required: 'La contraseña es requerida.',
            minLength: {
              value: 6,
              message: 'La contraseña debe tener al menos 6 caracteres.',
            },
          }
          : {
            validate: (value) =>
              !value || value.length >= 6 || 'La contraseña debe tener al menos 6 caracteres.',
          },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar contrasena',
      placeholder: 'Repetir contrasena',
      type: 'password',
      rules:
        origin === 'creation'
          ? { required: 'Confirmar contraseña es requerido.' }
          : {
            validate: (value, values) =>
              !values.password || value === values.password || 'Las contraseñas no coinciden.',
          },
      className: 'col-span-2',
    },
  ]

  return (
    <section
      aria-label={origin === 'creation' ? 'Formulario de nuevo usuario' : 'Formulario de edicion de usuario'}
      className='mx-auto w-full max-w-[720px] space-y-14'
    >
      <BaseForm<UsersFormValues>
        className='mx-auto grid grid-cols-2 gap-x-4 gap-y-3'
        defaultValues={{
          nombre: initialValues?.nombre ?? '',
          apellido: initialValues?.apellido ?? '',
          correo: initialValues?.correo ?? '',
          rol: initialValues?.rol ?? '',
          estado: initialValues?.estado ?? '',
          password: initialValues?.password ?? '',
          confirmPassword: initialValues?.confirmPassword ?? '',
        }}
        fields={fields}
        id={formId}
        labelFontWeight={600}
        mode='onSubmit'
        onSubmit={onSubmit}
        width={formWidth}
      >
        {({ methods }) => {
          const password = methods.watch('password')
          const confirmPassword = methods.watch('confirmPassword')
          const passwordsMatch = password && confirmPassword && password === confirmPassword

          return !passwordsMatch && confirmPassword ? (
            <div className='col-span-2'>
              <Typography color='error' variant='body2'>
                Las contrasenas no coinciden.
              </Typography>
            </div>
          ) : null
        }}
      </BaseForm>

      <FormActions
        cancelText='Cancelar'
        formId={formId}
        loading={loading}
        onCancel={onCancel}
        saveText='Guardar'
      />
    </section>
  )
}
