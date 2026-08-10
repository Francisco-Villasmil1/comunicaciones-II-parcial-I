import { z } from 'zod'

import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { useIsMobile } from '@/hooks/useIsMobile'

const campaignsFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.'),
  inicio: z.string().min(1, 'La fecha de inicio es requerida.'),
  fin: z.string().min(1, 'La fecha de fin es requerida.'),
  estado: z.string().min(1, 'El estado es requerido.'),
}).refine((data) => data.inicio <= data.fin, {
  message: 'La fecha de inicio no puede ser mayor a la fecha de fin.',
  path: ['fin'],
})

export type CampaignsFormValues = z.infer<typeof campaignsFormSchema>

type CampaignsFormProps = {
  origin: 'creation' | 'edition'
  initialValues?: Partial<CampaignsFormValues>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: CampaignsFormValues) => Promise<void> | void
}

const statusOptions = [
  { label: 'Activa', value: 'activa' },
  { label: 'Cerrada', value: 'cerrada' },
]

export function CampaignsForm({
  origin,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: CampaignsFormProps) {
  const { isMobile } = useIsMobile()

  const formId = `campaigns-form-${origin}`
  const formWidth = isMobile ? 330 : 500

  const fields: BaseFormField<CampaignsFormValues>[] = [
    {
      name: 'nombre',
      label: 'Nombre',
      placeholder: 'Escribe el nombre aca...',
      rules: { required: 'El nombre es requerido.' },
      className: 'col-span-2',
    },
    {
      name: 'inicio',
      label: 'Fecha inicio',
      type: 'date',
      rules: { required: 'La fecha de inicio es requerida.' },
      className: isMobile ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'fin',
      label: 'Fecha fin',
      type: 'date',
      rules: { required: 'La fecha de fin es requerida.' },
      className: isMobile ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'estado',
      label: 'Estado actual',
      placeholder: 'Seleccionar estado - - - ->',
      select: true,
      options: statusOptions,
      rules: { required: 'El estado es requerido.' },
      className: 'col-span-2',
    },
  ]

  return (
    <section
      aria-label={origin === 'creation' ? 'Formulario de nueva campaña' : 'Formulario de edicion de campaña'}
      className='mx-auto w-full max-w-[520px] space-y-14'
    >
      <BaseForm<CampaignsFormValues>
        className='mx-auto grid grid-cols-2 gap-x-3 gap-y-3'
        defaultValues={{
          nombre: initialValues?.nombre ?? '',
          inicio: initialValues?.inicio ?? '',
          fin: initialValues?.fin ?? '',
          estado: initialValues?.estado ?? '',
        }}
        fields={fields}
        id={formId}
        labelFontWeight={600}
        onSubmit={onSubmit}
        width={formWidth}
      />

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
