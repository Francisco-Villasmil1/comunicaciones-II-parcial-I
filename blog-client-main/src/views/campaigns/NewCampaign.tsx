import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { CampaignsApi, type CampaignPayload } from '@/api/CampaignsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  CampaignsForm,
  type CampaignsFormValues,
} from '@/views/campaigns/CampaignsForm'

export function NewCampaign() {
  usePageTitle('Nueva Campaña')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (values: CampaignsFormValues) => {
      const payload: CampaignPayload = {
        nombre: values.nombre,
        inicio: values.inicio,
        fin: values.fin,
        estado: values.estado as CampaignPayload['estado'],
      }

      console.log('Create campaign payload:', payload)
      return CampaignsApi.create(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('¡La campaña se ha guardado con éxito!.')
      navigate('/campanas')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear la campana.'
      toast.error(message)
    },
  })

  const onSubmit = async (values: CampaignsFormValues) => {
    await createMutation.mutateAsync(values)
  }

  return (
    <main aria-label='Vista de creacion de campana' className='mx-auto w-full max-w-[980px] py-6'>
      <CampaignsForm
        loading={createMutation.isPending}
        onCancel={() => navigate('/campanas')}
        onSubmit={onSubmit}
        origin='creation'
      />
    </main>
  )
}
