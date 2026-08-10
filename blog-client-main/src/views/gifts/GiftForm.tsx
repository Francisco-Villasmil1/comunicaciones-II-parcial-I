import { useMemo, useState } from 'react'
import { z } from 'zod'

import type { GiftOption } from '@/api/GiftsApi'
import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { useIsMobile } from '@/hooks/useIsMobile'

const giftsFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre del estudiante es requerido.'),
  cedula: z.string().min(1, 'La cedula del estudiante es requerida.'),
  materia: z.string().min(1, 'La materia es requerida.'),
  seccion: z.string().min(1, 'La seccion es requerida.'),
  categoria: z.string().min(1, 'La categoria es requerida.'),
  descripcion: z.string().optional(),
  puntos: z.string().min(1, 'Los puntos son requeridos.'),
})

export type GiftsFormValues = z.infer<typeof giftsFormSchema>

type GiftsFormProps = {
  origin: 'creation' | 'edition'
  options: {
    materias: GiftOption[]
    secciones: GiftOption[]
    categorias: GiftOption[]
    puntos: GiftOption[]
  }
  sectionSubjectMap?: Record<string, string>
  lockSectionAndSubject?: boolean
  initialValues?: Partial<GiftsFormValues>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: GiftsFormValues) => Promise<void> | void
}

export function GiftsForm({
  origin,
  options,
  sectionSubjectMap,
  lockSectionAndSubject = false,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: GiftsFormProps) {
  const { isMobile, isTablet } = useIsMobile()
  const isCompact = isMobile || isTablet
  const [isFormValid, setIsFormValid] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(initialValues?.materia ?? '')

  const formId = `gifts-form-${origin}`

  const filteredSections = useMemo(() => {
    if (!selectedSubject || !sectionSubjectMap) {
      return options.secciones
    }

    return options.secciones.filter((section) => sectionSubjectMap[section.value] === selectedSubject)
  }, [options.secciones, sectionSubjectMap, selectedSubject])

  const fields: BaseFormField<GiftsFormValues>[] = [
    {
      name: 'nombre',
      label: 'Nombre del Estudiante',
      placeholder: 'Añade el nombre del estudiante',
      rules: { required: 'El nombre del estudiante es requerido.' },
      className: 'col-span-2',
    },
    {
      name: 'cedula',
      label: 'Cedula del Estudiante',
      placeholder: 'Añade la cedula del estudiante',
      rules: { required: 'La cedula del estudiante es requerida.' },
      className: 'col-span-2',
    },
    {
      name: 'materia',
      label: 'Materia',
      placeholder: '↓ Seleccionar',
      select: true,
      disabled: lockSectionAndSubject,
      options: options.materias,
      onValueChange: (selectedMateria, methods) => {
        setSelectedSubject(selectedMateria)

        const selectedSection = methods.getValues('seccion')

        if (!selectedSection) {
          return
        }

        const isSectionValidForSubject = sectionSubjectMap?.[selectedSection] === selectedMateria

        if (isSectionValidForSubject) {
          return
        }

        methods.setValue('seccion', '', {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      },
      rules: { required: 'La materia es requerida.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'seccion',
      label: 'Seccion',
      placeholder: '↓ Seleccionar',
      select: true,
      disabled: lockSectionAndSubject,
      options: filteredSections,
      onValueChange: (selectedSection, methods) => {
        const mappedSubject = sectionSubjectMap?.[selectedSection]

        if (!mappedSubject) {
          return
        }

        setSelectedSubject(mappedSubject)

        methods.setValue('materia', mappedSubject, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      },
      rules: { required: 'La seccion es requerida.' },
      className: isCompact ? 'col-span-2' : 'col-span-1',
    },
    {
      name: 'categoria',
      label: 'Categoria',
      placeholder: '↓ Seleccionar',
      select: true,
      options: options.categorias,
      rules: { required: 'La categoria es requerida.' },
      className: 'col-span-2',
    },
    {
      name: 'descripcion',
      label: 'Descripcion',
      placeholder: 'Añade una descripcion...',
      className: 'col-span-2',
    },
    {
      name: 'puntos',
      label: 'Puntos',
      placeholder: '↓ Seleccionar',
      select: true,
      options: options.puntos,
      rules: { required: 'Los puntos son requeridos.' },
      className: 'col-span-2',
    },
  ]

  const formWidth = isMobile ? 330 : isTablet ? 500 : 600

  return (
    <section
      aria-label={
        origin === 'creation' ? 'Formulario de nuevo regalo' : 'Formulario de edicion de regalo'
      }
      className='mx-auto w-full max-w-[620px] space-y-14'
    >
      <BaseForm<GiftsFormValues>
        className='mx-auto grid grid-cols-2 gap-x-4 gap-y-3'
        defaultValues={{
          nombre: initialValues?.nombre ?? '',
          cedula: initialValues?.cedula ?? '',
          materia: initialValues?.materia ?? '',
          seccion: initialValues?.seccion ?? '',
          categoria: initialValues?.categoria ?? '',
          descripcion: initialValues?.descripcion ?? '',
          puntos: initialValues?.puntos != null ? String(initialValues.puntos) : '',
        }}
        fields={fields}
        id={formId}
        labelFontWeight={600}
        mode='onChange'
        onSubmit={onSubmit}
        onValidityChange={setIsFormValid}
        width={formWidth}
      />

      <FormActions
        cancelText='Cancelar'
        formId={formId}
        loading={loading}
        onCancel={onCancel}
        saveDisabled={!isFormValid}
        saveText='Guardar'
      />
    </section>
  )
}
