import { Navigate, Outlet } from 'react-router-dom'

import { useAppStore } from '@/store/useAppStore'

export function AuthLayout() {
  const token = useAppStore((state) => state.token)

  if (token) {
    return <Navigate replace to='/' />
  }

  return (
    <div className='min-h-screen bg-fondo'>
      <Outlet />
    </div>
  )
}
