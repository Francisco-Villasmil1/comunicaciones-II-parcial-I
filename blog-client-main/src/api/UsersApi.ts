import { apiClient } from '@/services/http/apiClient'
import { UserRole } from '@/types/user'

export type UserStatus = 'activo' | 'inactivo'

export type UserItem = {
  id: number
  nombre: string
  apellido: string
  correo: string
  rol: UserRole
  estado: UserStatus
}

export type UsersListResponse = {
  items: UserItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CreateUserPayload = {
  nombre: string
  apellido: string
  correo: string
  rol: UserRole
  estado: UserStatus
  password: string
}

export type UpdateUserPayload = {
  nombre: string
  apellido: string
  correo: string
  rol: UserRole
  estado: UserStatus
  password?: string
}

export const UsersApi = {
  list(params?: { 
    page?: number; 
    limit?: number; 
    rol?: string; 
    estado?: string; 
    nombre?: string; 
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.rol) searchParams.set('rol', params.rol)
    if (params?.estado) searchParams.set('estado', params.estado)
    if (params?.nombre) searchParams.set('nombre', params.nombre)

    return apiClient<UsersListResponse>(
      `/usuarios?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    )
  },

  getById(userId: string | number) {
    return apiClient<UserItem>(`/usuarios/${userId}`, {
      method: 'GET',
    })
  },

  create(payload: CreateUserPayload) {
    return apiClient<UserItem>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(userId: string | number, payload: UpdateUserPayload) {
    return apiClient<UserItem>(`/usuarios/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
