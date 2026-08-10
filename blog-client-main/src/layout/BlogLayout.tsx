import { Facebook, Instagram, LogOut, Plus, Twitter } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { useIsAuthenticated } from '@/hooks/useIsAuthenticated'
import { useIsDueno } from '@/hooks/useIsDueno'
import { useAppStore } from '@/store/useAppStore'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Publicaciones', to: '/#publicaciones' },
]

export function BlogLayout() {
  const navigate = useNavigate()
  const isDueno = useIsDueno()
  const isAuthenticated = useIsAuthenticated()
  const logout = useAppStore((state) => state.logout)
  const user = useAppStore((state) => state.user)
  const userDisplayName = user.nombreUsuario || 'Usuario'

  return (
    <div className='min-h-screen bg-white text-ink'>
      <header className='border-b border-slate-200 bg-white'>
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <Link className='text-lg font-semibold tracking-wide text-primary' to='/'>
            Mi Blog
          </Link>

          <nav aria-label='Navegacion del blog' className='hidden items-center gap-6 md:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                className='text-sm text-slate-600 transition-colors hover:text-primary'
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-3'>
            {isDueno ? (
              <button
                className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003366]'
                onClick={() => navigate('/publicaciones/new')}
                type='button'
              >
                <Plus size={16} />
                Nueva publicacion
              </button>
            ) : null}

            {isAuthenticated ? (
              <button
                aria-label='Cerrar sesion'
                className='inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50'
                onClick={logout}
                type='button'
              >
                <LogOut size={16} />
                <span className='hidden sm:inline'>{userDisplayName}</span>
              </button>
            ) : (
              <>
                <Link
                  className='rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50'
                  to='/auth/login'
                >
                  Iniciar sesion
                </Link>
                <Link
                  className='rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-[#003366]'
                  to='/auth/register'
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className='mt-16 bg-primary py-8 text-white'>
        <div className='mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6'>
          <p className='text-sm text-white/80'>Mi Blog · Compartiendo historias</p>
          <div className='flex items-center gap-5'>
            <Facebook aria-hidden='true' size={18} />
            <Instagram aria-hidden='true' size={18} />
            <Twitter aria-hidden='true' size={18} />
          </div>
        </div>
      </footer>
    </div>
  )
}
