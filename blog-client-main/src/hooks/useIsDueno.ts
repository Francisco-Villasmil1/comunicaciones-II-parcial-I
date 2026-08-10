import { useAppStore } from '@/store/useAppStore'
import { UserRole } from '@/types/user'

export function useIsDueno() {
  const user = useAppStore((state) => state.user)
  const token = useAppStore((state) => state.token)

  return Boolean(token && user.rol === UserRole.DUENO)
}
