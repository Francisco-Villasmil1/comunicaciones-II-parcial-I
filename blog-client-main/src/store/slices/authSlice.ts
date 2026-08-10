import type { StateCreator } from 'zustand'
import { AUTH_TOKEN_KEY } from '@/store/authStorage'

const getInitialToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export type AuthSlice = {
  token: string | null
  setSession: (token: string) => void
  clearSession: () => void
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
) => ({
  token: getInitialToken(),

  setSession: (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    set({ token })
  },

  clearSession: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    set({ token: null })
  },
})
