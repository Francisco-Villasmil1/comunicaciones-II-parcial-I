import type { StateCreator } from 'zustand'

import { AuthApi } from '@/api/AuthApi'
import { AUTH_USER_KEY } from '@/store/authStorage'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'

type UserSliceDeps = {
  clearSession: () => void
}

export type UserSlice = {
  user: User
  loadingUser: boolean
  setUser: (data: User) => void
  getUser: () => Promise<void>
  logout: () => void
}

const emptyUser: User = {
  id: null,
  nombreUsuario: '',
  nombre: null,
  apellido: null,
  correo: '',
  rol: UserRole.PROFESOR,
  isActive: false,
}

const getLocalUser = (): User => {
  const raw = localStorage.getItem(AUTH_USER_KEY)

  if (!raw) {
    return emptyUser
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    return emptyUser
  }
}

export const createUserSlice: StateCreator<
  UserSlice & UserSliceDeps,
  [],
  [],
  UserSlice
> = (set, get) => ({
  loadingUser: false,
  user: getLocalUser(),

  getUser: async () => {
    try {
      set({ loadingUser: true })
      const user = await AuthApi.me()

      get().setUser(user)
      set({ loadingUser: false })
    } catch {
      localStorage.removeItem(AUTH_USER_KEY)
      set({ user: emptyUser, loadingUser: false })
      get().clearSession()
    }
  },

  setUser: (data) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data))
    set({ user: data })
  },

  logout: () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem(AUTH_USER_KEY)
      get().clearSession()
      set({ user: emptyUser })
    }
  },
})
