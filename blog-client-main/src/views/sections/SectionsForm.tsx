import { z } from 'zod'

import type { SectionOption } from '@/api/SectionsApi'
import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { useIsMobile } from '@/hooks/useIsMobile'

const sectionsFormSchema = z.object({
  materia: z.string().min(1, 'La materia es requerida.'),
  docente: z.string().min(1, 'El docente es requerido.'),
  campana: z.string().min(1, 'La campana es requerida.'),
  numero: z
    .string()
    .min(1, 'El numero de seccion es requerido.')
    .regex(/^\d+$/, 'El numero de seccion debe ser un entero positivo.'),
})

export type SectionsFormValues = z.infer<typeof sectionsFormSchema>

type SectionsFormProps = {
  origin: 'creation' | 'edition'
  options: {
    materias: SectionOption[]
    docentes: SectionOption[]
    campanas: SectionOption[]
  }
  initialValues?: Partial<SectionsFormValues>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: SectionsFormValues) => Promise<void> | void
}

export function SectionsForm({
  origin,
  options,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: SectionsFormProps) {
  const { isMobile, isTablet } = useIsMobile()

  const formId = `sections-form-${origin}`
  const isCompact = isMobile || isTablet
  const formWidth = isMobile ? 330 : isTablet ? 500 : 700

  const fields: BaseFormField<SectionsFormValues>[] = [
    {
      name: 'materia',
      label: 'Materia',
      placeholder: 'Seleccionar materia - - - ->',
      select: true,
      options: options.materias,
      rules: { required: 'La materia es requerida.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'docente',
      label: 'Docente',
      placeholder: 'Seleccionar docente - - - ->',
      select: true,
      options: options.docentes,
      rules: { required: 'El docente es requerido.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'campana',
      label: 'Campaña',
      placeholder: 'Seleccionar campana - - - ->',
      select: true,
      options: options.campanas,
      rules: { required: 'La campana es requerida.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'numero',
      label: 'Numero de seccion',
      placeholder: 'Escribe el numero aca...',
      type: 'number',
      rules: { required: 'El numero de seccion es requerido.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
  ]

  return (
    <section
      aria-label={origin === 'creation' ? 'Formulario de nueva seccion' : 'Formulario de edicion de seccion'}
      className='mx-auto w-full max-w-[720px] space-y-14'
    >
      <BaseForm<SectionsFormValues>
        className='mx-auto grid grid-cols-2 gap-x-4 gap-y-3'
        defaultValues={{
          materia: initialValues?.materia ?? '',
          docente: initialValues?.docente ?? '',
          campana: initialValues?.campana ?? '',
          numero: initialValues?.numero ?? '',
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