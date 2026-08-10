import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { GiftsApi, type GiftDetail, type GiftPayload } from '@/api/GiftsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { GiftsForm, type GiftsFormValues } from '@/views/gifts/GiftForm'

function detailToInitialValues(detail: GiftDetail): Partial<GiftsFormValues> {
  return {
    nombre: detail.nombre,
    cedula: detail.cedula,
    materia: String(detail.materiaId),
    seccion: String(detail.seccionId),
    categoria: String(detail.categoriaId),
    descripcion: detail.descripcion,
    puntos: String(detail.puntos),
  }
}

function toPayload(values: GiftsFormValues): GiftPayload {
  const descripcion = values.descripcion?.trim()

  return {
    nombre: values.nombre,
    cedula: values.cedula,
    materia: values.materia,
    seccion: values.seccion,
    categoria: values.categoria,
    descripcion: descripcion ? descripcion : undefined,
    puntos: values.puntos,
  }
}

export function EditGift() {
  usePageTitle('Editar Regalo')

  const navigate = useNavigate()
  const { giftId } = useParams<{ giftId: string }>()
  const queryClient = useQueryClient()

  const optionsQuery = useQuery({
    queryKey: ['gift-options'],
    queryFn: () => GiftsApi.getOptions(),
  })

  const giftQuery = useQuery({
    queryKey: ['gift', giftId],
    queryFn: () => {
      if (!giftId) {
        throw new Error('ID de regalo no provisto.')
      }

      return GiftsApi.getById(giftId)
    },
    enabled: Boolean(giftId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: GiftsFormValues) => {
      if (!giftId) {
        throw new Error('ID de regalo no provisto.')
      }

      return GiftsApi.update(giftId, toPayload(values))
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['donaciones'] }),
        queryClient.invalidateQueries({ queryKey: ['gift', giftId] }),
      ])
      toast.success('¡El regalo se ha actualizado con éxito!.')
      navigate('/regalos')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el regalo.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: GiftsFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  if (!giftId) {
    return (
      <main aria-label='Vista de edicion de regalo' className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de regalo invalido.</p>
      </main>
    )
  }

  if (optionsQuery.isLoading || giftQuery.isLoading) {
    return (
      <main aria-label='Vista de edicion de regalo' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando datos del regalo...</p>
      </main>
    )
  }

  if (optionsQuery.isError || giftQuery.isError || !optionsQuery.data || !giftQuery.data) {
    return (
      <main
        aria-label='Vista de edicion de regalo'
        className='mx-auto w-full max-w-[980px] space-y-4 py-6'
      >
        <p>No se pudieron cargar los datos del regalo.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/regalos')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de edicion de regalo' className='mx-auto w-full max-w-[980px] py-6'>
      <GiftsForm
        key={`edit-gift-${giftQuery.data.id}`}
        initialValues={detailToInitialValues(giftQuery.data)}
        loading={updateMutation.isPending}
        options={optionsQuery.data}
        origin='edition'
        onCancel={() => navigate('/regalos')}
        onSubmit={onSubmit}
      />
    </main>
  )
}
