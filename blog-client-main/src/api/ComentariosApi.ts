import { apiClient } from '@/services/http/apiClient'

export type Comentario = {
  id: number
  contenido: string
  fechaRegistro: string
  usuario: {
    id: number
    nombreUsuario: string
    nombre: string | null
    apellido: string | null
  }
  usuarioNombre: string
  publicacion: {
    id: number
    titulo: string
  }
}

export type ComentariosListResponse = {
  items: Comentario[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ComentarioPayload = {
  contenido: string
  idPublicacion: number
}

export const ComentariosApi = {
  list(params?: { page?: number; limit?: number; publicacionId?: number }) {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const publicacionId = params?.publicacionId

    let url = `/comentarios?page=${page}&limit=${limit}`
    if (publicacionId) {
      url += `&publicacionId=${publicacionId}`
    }

    return apiClient<ComentariosListResponse>(url, { method: 'GET' })
  },

  create(payload: ComentarioPayload) {
    return apiClient<Comentario>('/comentarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  remove(comentarioId: string | number) {
    return apiClient<{ ok: boolean }>(`/comentarios/${comentarioId}`, {
      method: 'DELETE',
    })
  },
}
