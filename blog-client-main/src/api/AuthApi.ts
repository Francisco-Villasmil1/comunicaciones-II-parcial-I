import { apiClient } from '@/services/http/apiClient'
import { AUTH_TOKEN_KEY } from '@/store/authStorage'
import type { User } from '@/types/user'

export type AuthRole = 'DUENO' | 'LECTOR' | 'ADMIN' | 'PROFESOR'

export type AuthUser = User & {
  id: number
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export type RegisterPayload = {
  nombreUsuario: string
  nombre?: string
  apellido?: string
  correo: string
  password: string
  rol?: 'DUENO' | 'LECTOR'
}

export type LoginPayload = {
  identificador: string
  password: string
}

export const AuthApi = {
  canRegisterDueno() {
    return apiClient<{ canRegisterDueno: boolean }>('/auth/can-register', {
      method: 'GET',
    })
  },

  register(payload: RegisterPayload) {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload) {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  me() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)

    return apiClient<User>('/auth/me', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  },
}
