import { useAppStore } from '@/store/useAppStore'

export function useIsAuthenticated() {
  const token = useAppStore((state) => state.token)
  return Boolean(token)
}
