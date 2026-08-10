import { apiClient } from '@/services/http/apiClient'

export type Category = {
  id: number
  descripcion: string
  rango: string
  genero: 'masculino' | 'femenino' | 'unisex'
}

export type CategoriesListResponse = {
  items: Category[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CategoryPayload = {
  descripcion: string
  rango: string
  genero: 'masculino' | 'femenino' | 'unisex'
}

export const CategoriesApi = {
  list(params?: { 
    page?: number; 
    limit?: number;
    genero?: string;
    rango?: string;
    descripcion?: string;
  }) {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (params?.genero) {
      queryParams.append('genero', params.genero)
    }

    if (params?.rango) {
      queryParams.append('rango', params.rango)
    }

    if (params?.descripcion) {
      queryParams.append('descripcion', params.descripcion)
    }

    return apiClient<CategoriesListResponse>(
      `/categorias-juguetes?${queryParams.toString()}`,
      {
        method: 'GET',
      },
    )
  },

  getById(categoryId: string | number) {
    return apiClient<Category>(`/categorias-juguetes/${categoryId}`, {
      method: 'GET',
    })
  },

  create(payload: CategoryPayload) {
    return apiClient<Category>('/categorias-juguetes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(categoryId: string | number, payload: CategoryPayload) {
    return apiClient<Category>(`/categorias-juguetes/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
