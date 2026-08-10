import { apiClient } from '@/services/http/apiClient'

export type Subject = {
  id: number
  nombre: string
  codigo: string
}

export type SubjectsListResponse = {
  items: Subject[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type SubjectPayload = {
  nombre: string
  codigo: string
}

export const SubjectsApi = {
  list(params?: { page?: number; limit?: number; nombre?: string }) {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const nombre = params?.nombre

    let url = `/asignaturas?page=${page}&limit=${limit}`
    if (nombre) {
      url += `&nombre=${encodeURIComponent(nombre)}`
    }

    return apiClient<SubjectsListResponse>(
      url,
      {
        method: 'GET',
      },
    )
  },

  getById(subjectId: string | number) {
    return apiClient<Subject>(`/asignaturas/${subjectId}`, {
      method: 'GET',
    })
  },

  create(payload: SubjectPayload) {
    return apiClient<Subject>('/asignaturas', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(subjectId: string | number, payload: SubjectPayload) {
    return apiClient<Subject>(`/asignaturas/${subjectId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
