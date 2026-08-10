import { create } from 'zustand'

import { createAuthSlice, type AuthSlice } from '@/store/slices/authSlice'
import { createUiSlice, type UiSlice } from '@/store/slices/uiSlice'
import { createUserSlice, type UserSlice } from '@/store/slices/userSlice'

type AppStore = UiSlice & AuthSlice & UserSlice

export const useAppStore = create<AppStore>()((...args) => ({
  ...createUiSlice(...args),
  ...createAuthSlice(...args),
  ...createUserSlice(...args),
}))
