import { Button, Card, CardContent, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { usePageTitle } from '@/hooks/usePageTitle'
import { useAppStore } from '@/store/useAppStore'

export function FallbackPage() {
  usePageTitle('Fallback')

  const user = useAppStore((state) => state.user)
  const logout = useAppStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className='mx-auto flex w-full max-w-3xl items-center justify-center px-3 py-6 sm:px-0 sm:py-10'>
      <Card className='w-full max-w-full rounded-3xl shadow-panel'>
        <CardContent className='space-y-4 p-5 sm:p-8'>
          <Typography sx={{ wordBreak: 'break-word' }} variant='h4'>
            Autenticacion base completada
          </Typography>
          <Typography color='text.secondary'>
            Esta es la vista fallback temporal mientras terminamos autorizacion por roles y pantallas protegidas.
          </Typography>

          <div className='rounded-2xl bg-mist p-4'>
            <Typography variant='body2'>Usuario actual: {user.nombre} {user.apellido}</Typography>
            <Typography variant='body2'>Correo: {user.correo}</Typography>
            <Typography variant='body2'>Rol: {user.rol}</Typography>
          </div>

          <Button onClick={handleLogout} variant='outlined'>
            Cerrar sesion
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}