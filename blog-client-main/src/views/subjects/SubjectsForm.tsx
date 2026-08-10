import { z } from 'zod'

import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { useIsMobile } from '@/hooks/useIsMobile'

const subjectsFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.'),
  codigo: z.string().min(1, 'El codigo es requerido.'),
})

export type SubjectsFormValues = z.infer<typeof subjectsFormSchema>

type SubjectsFormProps = {
  origin: 'creation' | 'edition'
  initialValues?: Partial<SubjectsFormValues>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: SubjectsFormValues) => Promise<void> | void
}

export function SubjectsForm({
  origin,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: SubjectsFormProps) {
  const { isMobile } = useIsMobile()

  const formId = `subjects-form-${origin}`
  const formWidth = isMobile ? 330 : 500

  const fields: BaseFormField<SubjectsFormValues>[] = [
    {
      name: 'nombre',
      label: 'Nombre',
      placeholder: 'Escribe el nombre aca...',
      rules: { required: 'El nombre es requerido.' },
      className: 'col-span-1',
    },
    {
      name: 'codigo',
      label: 'Codigo',
      placeholder: 'Escribe el codigo aca...',
      rules: { required: 'El codigo es requerido.' },
      className: 'col-span-1',
    },
  ]

  return (
    <section
      aria-label={origin === 'creation' ? 'Formulario de nueva materia' : 'Formulario de edicion de materia'}
      className='mx-auto w-full max-w-[520px] space-y-14'
    >
      <BaseForm<SubjectsFormValues>
        className='mx-auto grid grid-cols-1 gap-y-3'
        defaultValues={{
          nombre: initialValues?.nombre ?? '',
          codigo: initialValues?.codigo ?? '',
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