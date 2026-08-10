import { apiClient } from '@/services/http/apiClient'
import { AUTH_TOKEN_KEY } from '@/store/authStorage'

import { CategoriesApi } from '@/api/CategoriesApi'
import { SectionsApi } from '@/api/SectionsApi'
import { SubjectsApi } from '@/api/SubjectsApi'

export type GiftOption = {
  label: string
  value: string
}

export type GiftSectionOption = GiftOption & {
  docenteId: number
  materiaId: number
}

export type GiftOptionsResponse = {
  materias: GiftOption[]
  secciones: GiftSectionOption[]
  categorias: GiftOption[]
  puntos: GiftOption[]
}

export type GiftDetail = {
  id: number
  nombre: string
  cedula: string
  materia: string
  seccion: string
  categoria: string
  descripcion: string
  puntos: string
  materiaId: number
  seccionId: number
  categoriaId: number
  docente: string
  campana: string
}

export type GiftsListResponse = {
  items: GiftDetail[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type GiftPayload = {
  nombre: string
  cedula: string
  materia: string
  seccion: string
  categoria: string
  descripcion?: string
  puntos: string
}

const puntosOptions = (): GiftOption[] =>
  Array.from({ length: 30 }, (_, i) => {
    const n = i + 1
    return { label: String(n), value: String(n) }
  })

export const GiftsApi = {
  list(params?: { page?: number; limit?: number }) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const page = params?.page ?? 1
    const limit = params?.limit ?? 16

    return apiClient<GiftsListResponse>(
      `/donaciones?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    )
  },

  async getOptions(): Promise<GiftOptionsResponse> {
    const [subjectsRes, sectionsRes, categoriesRes] = await Promise.all([
      SubjectsApi.list({ page: 1, limit: 200 }),
      SectionsApi.list({ page: 1, limit: 200 }),
      CategoriesApi.list({ page: 1, limit: 200 }),
    ])

    const materias = subjectsRes.items.map((s) => ({
      label: s.nombre,
      value: String(s.id),
    }))

    const secciones = sectionsRes.items.map((s) => ({
      label: `Seccion ${s.numero} — ${s.materia}`,
      value: String(s.id),
      docenteId: s.docenteId,
      materiaId: s.materiaId,
    }))

    const categorias = categoriesRes.items.map((c) => ({
      label: c.descripcion,
      value: String(c.id),
    }))

    return {
      materias,
      secciones,
      categorias,
      puntos: puntosOptions(),
    }
  },

  getById(giftId: string | number) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    return apiClient<GiftDetail>(`/donaciones/${giftId}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  },

  create(payload: GiftPayload) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    return apiClient<GiftDetail>('/donaciones', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  },

  update(giftId: string | number, payload: GiftPayload) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    return apiClient<GiftDetail>(`/donaciones/${giftId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  },
}
