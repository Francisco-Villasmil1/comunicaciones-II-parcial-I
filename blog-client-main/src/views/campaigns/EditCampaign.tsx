import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { CampaignsApi, type CampaignPayload } from '@/api/CampaignsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  CampaignsForm,
  type CampaignsFormValues,
} from '@/views/campaigns/CampaignsForm'

export function EditCampaign() {
  usePageTitle('Editar Campaña')

  const navigate = useNavigate()
  const { campaignId } = useParams<{ campaignId: string }>()
  const queryClient = useQueryClient()

  const campaignQuery = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => {
      if (!campaignId) {
        throw new Error('ID de campana no provisto.')
      }

      return CampaignsApi.getById(campaignId)
    },
    enabled: Boolean(campaignId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: CampaignsFormValues) => {
      if (!campaignId) {
        throw new Error('ID de campana no provisto.')
      }

      const payload: CampaignPayload = {
        nombre: values.nombre,
        inicio: values.inicio,
        fin: values.fin,
        estado: values.estado as CampaignPayload['estado'],
      }

      console.log('Edit campaign payload:', { campaignId, ...payload })
      return CampaignsApi.update(campaignId, payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] }),
      ])

      toast.success('Campaña actualizada correctamente.')
      navigate('/campanas')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la campana.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: CampaignsFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  if (!campaignId) {
    return (
      <main aria-label='Vista de edicion de campana' className='mx-auto w-full max-w-[980px] py-6'>
        <p>ID de campana invalido.</p>
      </main>
    )
  }

  if (campaignQuery.isLoading) {
    return (
      <main aria-label='Vista de edicion de campana' className='mx-auto w-full max-w-[980px] py-6'>
        <p>Cargando campaña...</p>
      </main>
    )
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return (
      <main aria-label='Vista de edicion de campana' className='mx-auto w-full max-w-[980px] py-6 space-y-4'>
        <p>No se pudo cargar la campaña.</p>
        <button
          className='rounded-md border border-slate-300 px-4 py-2'
          onClick={() => navigate('/campanas')}
          type='button'
        >
          Volver
        </button>
      </main>
    )
  }

  return (
    <main aria-label='Vista de edicion de campana' className='mx-auto w-full max-w-[980px] py-6'>
      <CampaignsForm
        key={`edit-campaign-${campaignQuery.data.id}`}
        initialValues={{
          nombre: campaignQuery.data.nombre,
          inicio: campaignQuery.data.inicio,
          fin: campaignQuery.data.fin,
          estado: campaignQuery.data.estado,
        }}
        loading={updateMutation.isPending}
        onCancel={() => navigate('/campanas')}
        onSubmit={onSubmit}
        origin='edition'
      />
    </main>
  )
}
