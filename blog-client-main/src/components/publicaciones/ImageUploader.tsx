import { useEffect, useMemo, useState } from 'react'

import { resolveImageUrl } from '@/utils/imageUrl'

type ExistingImage = {
  url: string
}

type ImageUploaderProps = {
  existingImages?: ExistingImage[]
  onChange: (value: { existingUrls: string[]; newFiles: File[] }) => void
}

type PreviewItem = {
  key: string
  src: string
  kind: 'existing' | 'new'
  url?: string
  file?: File
}

export function ImageUploader({ existingImages = [], onChange }: ImageUploaderProps) {
  const [keptExistingUrls, setKeptExistingUrls] = useState<string[]>(
    existingImages.map((image) => image.url),
  )
  const [newFiles, setNewFiles] = useState<File[]>([])

  useEffect(() => {
    setKeptExistingUrls(existingImages.map((image) => image.url))
    setNewFiles([])
  }, [existingImages])

  useEffect(() => {
    onChange({ existingUrls: keptExistingUrls, newFiles })
  }, [keptExistingUrls, newFiles, onChange])

  const previews = useMemo<PreviewItem[]>(() => {
    const existingPreviews = keptExistingUrls.map((url) => ({
      key: `existing-${url}`,
      src: resolveImageUrl(url),
      kind: 'existing' as const,
      url,
    }))

    const newPreviews = newFiles.map((file) => ({
      key: `new-${file.name}-${file.lastModified}`,
      src: URL.createObjectURL(file),
      kind: 'new' as const,
      file,
    }))

    return [...existingPreviews, ...newPreviews]
  }, [keptExistingUrls, newFiles])

  useEffect(() => {
    return () => {
      previews
        .filter((preview) => preview.kind === 'new')
        .forEach((preview) => URL.revokeObjectURL(preview.src))
    }
  }, [previews])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) {
      return
    }

    setNewFiles((current) => [...current, ...selectedFiles])
    event.target.value = ''
  }

  const removePreview = (preview: PreviewItem) => {
    if (preview.kind === 'existing' && preview.url) {
      setKeptExistingUrls((current) => current.filter((url) => url !== preview.url))
      return
    }

    if (preview.kind === 'new' && preview.file) {
      setNewFiles((current) => current.filter((file) => file !== preview.file))
    }
  }

  return (
    <div className='space-y-3'>
      <div>
        <label className='mb-1 block text-base font-semibold text-ink' htmlFor='imagenes-input'>
          Imagenes
        </label>
        <p className='text-sm text-slate-500'>
          Selecciona fotos desde tu computadora. Maximo 10 imagenes de 5 MB cada una.
        </p>
      </div>

      <input
        accept='image/jpeg,image/png,image/gif,image/webp'
        className='block w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90'
        id='imagenes-input'
        multiple
        onChange={handleFileChange}
        type='file'
      />

      {previews.length > 0 ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
          {previews.map((preview) => (
            <figure
              key={preview.key}
              className='group relative overflow-hidden rounded-lg border border-slate-200'
            >
              <img
                alt='Vista previa'
                className='h-32 w-full object-cover'
                src={preview.src}
              />
              <button
                className='absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => removePreview(preview)}
                type='button'
              >
                Quitar
              </button>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  )
}
