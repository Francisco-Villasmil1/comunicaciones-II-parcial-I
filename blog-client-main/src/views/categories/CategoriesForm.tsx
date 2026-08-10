import { z } from 'zod'

import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { useIsMobile } from '@/hooks/useIsMobile'

const categoriesFormSchema = z.object({
  descripcion: z.string().min(1, 'La descripcion es requerida.'),
  rango: z.string().min(1, 'El rango es requerido.'),
  genero: z.string().min(1, 'El genero es requerido.'),
})

export type CategoriesFormValues = z.infer<typeof categoriesFormSchema>

type CategoriesFormProps = {
  origin: 'creation' | 'edition'
  initialValues?: Partial<CategoriesFormValues>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: CategoriesFormValues) => Promise<void> | void
}

const rangeOptions = [
  { label: '3 - 5', value: '3-5' },
  { label: '6 - 8', value: '6-8' },
  { label: '9 - 12', value: '9-12' },
]

const genderOptions = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Unisex', value: 'unisex' },
]

export function CategoriesForm({
  origin,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: CategoriesFormProps) {
  const { isMobile, isTablet } = useIsMobile()

  const formId = `categories-form-${origin}`

  const fields: BaseFormField<CategoriesFormValues>[] = [
    {
      name: 'descripcion',
      label: 'Descripcion',
      placeholder: 'Anade una descripcion...',
      rules: { required: 'La descripcion es requerida.' },
      className: 'col-span-2',
    },
    {
      name: 'rango',
      label: 'Rango',
      placeholder: '↓ Seleccionar',
      select: true,
      options: rangeOptions,
      rules: { required: 'El rango es requerido.' },
      className: 'col-span-1',
    }, {
      name: 'genero',
      label: 'Genero',
      placeholder: '↓ Seleccionar',
      select: true,
      options: genderOptions,
      rules: { required: 'El genero es requerido.' },
      className: 'col-span-1',
    },
  ]

  const formWidth = isMobile ? 330 : isTablet ? 500 : 600

  return (
    <section aria-label={origin === 'creation' ? 'Formulario de nueva categoria' : 'Formulario de edicion de categoria'} className='mx-auto w-full max-w-[620px] space-y-14'>
      <BaseForm<CategoriesFormValues>
        className='mx-auto grid grid-cols-2 gap-x-4 gap-y-3'
        defaultValues={{
          descripcion: initialValues?.descripcion ?? '',
          rango: initialValues?.rango ?? '',
          genero: initialValues?.genero ?? '',
        }}
        fields={fields}
        id={formId}
        labelFontWeight={600}
        mode='onSubmit'
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
