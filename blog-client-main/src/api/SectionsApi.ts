import { apiClient } from '@/services/http/apiClient'

export type Section = {
  id: number
  materia: string
  docente: string
  campana: string
  numero: string
  materiaId: number
  docenteId: number
  campanaId: number
}

export type SectionsListResponse = {
  items: Section[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type SectionPayload = {
  materia: string
  docente: string
  campana: string
  numero: string
}

export type SectionOption = {
  label: string
  value: string
}

export type SectionOptionsResponse = {
  materias: SectionOption[]
  docentes: SectionOption[]
  campanas: SectionOption[]
}

export const SectionsApi = {
  list(params?: { page?: number; limit?: number; search?: string }) {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const search = params?.search

    let url = `/secciones?page=${page}&limit=${limit}`
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    return apiClient<SectionsListResponse>(
      url,
      {
        method: 'GET',
      },
    )
  },

  getById(sectionId: string | number) {
    return apiClient<Section>(`/secciones/${sectionId}`, {
      method: 'GET',
    })
  },

  getOptions() {
    return apiClient<SectionOptionsResponse>('/secciones/options', {
      method: 'GET',
    })
  },

  create(payload: SectionPayload) {
    return apiClient<Section>('/secciones', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(sectionId: string | number, payload: SectionPayload) {
    return apiClient<Section>(`/secciones/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
