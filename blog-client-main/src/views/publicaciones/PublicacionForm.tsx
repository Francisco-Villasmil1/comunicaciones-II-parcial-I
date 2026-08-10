import { useCallback, useState } from 'react'
import { z } from 'zod'

import { BaseForm, type BaseFormField } from '@/components/BaseForm'
import { FormActions } from '@/components/FormActions'
import { ImageUploader } from '@/components/publicaciones/ImageUploader'
import { UploadsApi } from '@/api/UploadsApi'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { PublicacionPayload } from '@/api/PublicacionesApi'

const publicacionFormSchema = z.object({
  titulo: z.string().min(1, 'El titulo es requerido.'),
  contenido: z.string().optional(),
})

export type PublicacionFormValues = z.infer<typeof publicacionFormSchema>

type PublicacionFormProps = {
  origin: 'creation' | 'edition'
  initialValues?: Partial<PublicacionFormValues>
  initialImages?: { url: string }[]
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: PublicacionPayload) => Promise<void> | void
}

export function PublicacionForm({
  origin,
  initialValues,
  initialImages = [],
  loading = false,
  onCancel,
  onSubmit,
}: PublicacionFormProps) {
  const { isMobile } = useIsMobile()
  const formId = `publicacion-form-${origin}`
  const formWidth = isMobile ? 330 : 500
  const [imageSelection, setImageSelection] = useState({
    existingUrls: initialImages.map((image) => image.url),
    newFiles: [] as File[],
  })
  const [uploading, setUploading] = useState(false)

  const handleImageChange = useCallback(
    (value: { existingUrls: string[]; newFiles: File[] }) => {
      setImageSelection(value)
    },
    [],
  )

  const fields: BaseFormField<PublicacionFormValues>[] = [
    {
      name: 'titulo',
      label: 'Titulo',
      placeholder: 'Escribe el titulo aqui...',
      rules: { required: 'El titulo es requerido.' },
      className: 'col-span-1',
    },
    {
      name: 'contenido',
      label: 'Contenido',
      placeholder: 'Escribe el contenido aqui...',
      type: 'text',
      multiline: true,
      rows: 5,
      className: 'col-span-1',
    },
  ]

  const handleSubmit = async (values: PublicacionFormValues) => {
    const parsed = publicacionFormSchema.safeParse(values)

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? 'Datos invalidos.')
    }

    setUploading(true)

    try {
      const uploadResult = await UploadsApi.upload(imageSelection.newFiles)
      const imagenes = [
        ...imageSelection.existingUrls.map((url) => ({ url })),
        ...uploadResult.urls.map((url) => ({ url })),
      ]

      await onSubmit({
        titulo: parsed.data.titulo,
        contenido: parsed.data.contenido?.trim() || undefined,
        imagenes: imagenes.length > 0 ? imagenes : undefined,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <section
      aria-label={
        origin === 'creation'
          ? 'Formulario de nueva publicacion'
          : 'Formulario de edicion de publicacion'
      }
      className='mx-auto w-full max-w-[520px] space-y-8'
    >
      <BaseForm<PublicacionFormValues>
        className='mx-auto grid grid-cols-1 gap-y-3'
        defaultValues={{
          titulo: initialValues?.titulo ?? '',
          contenido: initialValues?.contenido ?? '',
        }}
        fields={fields}
        id={formId}
        labelFontWeight={600}
        onSubmit={handleSubmit}
        width={formWidth}
      />

      <ImageUploader existingImages={initialImages} onChange={handleImageChange} />

      <FormActions
        cancelText='Cancelar'
        formId={formId}
        loading={loading || uploading}
        onCancel={onCancel}
        saveText='Guardar'
      />
    </section>
  )
}
