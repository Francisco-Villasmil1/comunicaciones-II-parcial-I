import { apiClient } from '@/services/http/apiClient'

export type CampaignStatus = 'activa' | 'cerrada'

export type Campaign = {
  id: number
  nombre: string
  inicio: string
  fin: string
  estado: CampaignStatus
}

export type CampaignsListResponse = {
  items: Campaign[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CampaignPayload = {
  nombre: string
  inicio: string
  fin: string
  estado: CampaignStatus
}

export const CampaignsApi = {
  list(params?: { 
    page?: number; 
    limit?: number; 
    estado?: string; 
    nombre?: string; 
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.estado) searchParams.set('estado', params.estado)
    if (params?.nombre) searchParams.set('nombre', params.nombre)

    return apiClient<CampaignsListResponse>(
      `/periodos?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    )
  },

  getById(campaignId: string | number) {
    return apiClient<Campaign>(`/periodos/${campaignId}`, {
      method: 'GET',
    })
  },

  create(payload: CampaignPayload) {
    return apiClient<Campaign>('/periodos', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(campaignId: string | number, payload: CampaignPayload) {
    return apiClient<Campaign>(`/periodos/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
