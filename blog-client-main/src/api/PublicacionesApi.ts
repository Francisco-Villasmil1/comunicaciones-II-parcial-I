import { apiClient } from '@/services/http/apiClient'

export type PublicacionImagen = {
  id: number
  url: string
  descripcion: string | null
}

export type Publicacion = {
  id: number
  titulo: string
  contenido: string | null
  fechaCreacion: string
  fechaUpdate: string
  autor: {
    id: number
    nombreUsuario: string
    nombre: string | null
    apellido: string | null
  }
  autorNombre: string
  totalComentarios: number
  imagenes: PublicacionImagen[]
}

export type PublicacionesListResponse = {
  items: Publicacion[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type PublicacionPayload = {
  titulo: string
  contenido?: string
  imagenes?: {
    url: string
    descripcion?: string
  }[]
}

export const PublicacionesApi = {
  list(params?: { page?: number; limit?: number; titulo?: string }) {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const titulo = params?.titulo

    let url = `/publicaciones?page=${page}&limit=${limit}`
    if (titulo) {
      url += `&titulo=${encodeURIComponent(titulo)}`
    }

    return apiClient<PublicacionesListResponse>(url, { method: 'GET' })
  },

  getById(publicacionId: string | number) {
    return apiClient<Publicacion>(`/publicaciones/${publicacionId}`, {
      method: 'GET',
    })
  },

  create(payload: PublicacionPayload) {
    return apiClient<Publicacion>('/publicaciones', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(publicacionId: string | number, payload: PublicacionPayload) {
    return apiClient<Publicacion>(`/publicaciones/${publicacionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
