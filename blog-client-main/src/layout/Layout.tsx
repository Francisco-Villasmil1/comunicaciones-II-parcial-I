import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

import {
  ArrowRightFromLine,
  BookCopy,
  Boxes,
  CalendarDays,
  Gift,
  LayoutDashboard,
  LayoutPanelTop,
  Newspaper,
  SquareMenu,
  User,
  X,
} from 'lucide-react'

import { Logo } from '@/components/Logo'
import { LogoFull } from '@/components/LogoFull'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useAppStore } from '@/store/useAppStore'
import { UserRole } from '@/types/user'
import { getUserAvatarStyleFromName } from '@/utils/avatar'

type NavItem = {
  key: string
  label: string
  icon: LucideIcon
  path?: string
}

const navigation: NavItem[] = [
  { key: 'publicaciones', label: 'Publicaciones', icon: Newspaper, path: '/publicaciones' },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'categorias', label: 'Categorias', icon: Boxes, path: '/categorias' },
  { key: 'regalos', label: 'Regalos', icon: Gift, path: '/regalos' },
  { key: 'usuarios', label: 'Usuarios', icon: User, path: '/usuarios' },
  { key: 'campanas', label: 'Campañas', icon: CalendarDays, path: '/campanas' },
  { key: 'materias', label: 'Materias', icon: BookCopy, path: '/materias' },
  { key: 'secciones', label: 'Secciones', icon: LayoutPanelTop, path: '/secciones' },
]

const visibleSectionsByRole: Record<UserRole, string[]> = {
  [UserRole.DUENO]: ['publicaciones'],
  [UserRole.LECTOR]: ['publicaciones'],
  [UserRole.ADMIN]: navigation.map((item) => item.key),
  [UserRole.PROFESOR]: ['dashboard', 'regalos', 'secciones'],
}

const getActiveKeyByPath = (pathname: string) => {
  if (pathname === '/' || pathname.startsWith('/publicaciones')) return 'publicaciones'
  if (pathname.startsWith('/extras')) return 'dashboard'
  if (pathname.startsWith('/categorias')) return 'categorias'
  if (pathname.startsWith('/regalos')) return 'regalos'
  if (pathname.startsWith('/usuarios')) return 'usuarios'
  if (pathname.startsWith('/campanas')) return 'campanas'
  if (pathname.startsWith('/materias')) return 'materias'
  if (pathname.startsWith('/secciones')) return 'secciones'

  return ''
}

const ARROW_KEYS = new Set(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'])
const FOCUSABLE_SELECTOR = [
  'button:not([disabled]):not([tabindex="-1"])',
  'a[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[role="button"]:not([aria-disabled="true"]):not([tabindex="-1"])',
  '[role="combobox"]:not([aria-disabled="true"]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isMobile, isTablet } = useIsMobile()
  const logout = useAppStore((state) => state.logout)
  const user = useAppStore((state) => state.user)
  const userFullName = `${user.nombre} ${user.apellido}`.trim() || 'Usuario'
  const { initial, backgroundColor } = getUserAvatarStyleFromName(userFullName)
  const activeKey = getActiveKeyByPath(pathname)
  const allowedSections = visibleSectionsByRole[user.rol] ?? visibleSectionsByRole[UserRole.PROFESOR]
  const visibleNavigation = navigation.filter((item) => allowedSections.includes(item.key))
  const sidebarWidth = 220
  const desktopSidebarRef = useRef<HTMLElement | null>(null)
  const desktopMainRef = useRef<HTMLElement | null>(null)
  const mobileSidebarRef = useRef<HTMLElement | null>(null)
  const mobileMainRef = useRef<HTMLElement | null>(null)

  const renderNavigation = () => (
    <nav aria-label='Navegacion principal' className='mt-6'>
      <ul className='space-y-2'>
        {visibleNavigation.map(({ key, label, icon: Icon, path }) => {
          const isActive = activeKey === key

          return (
            <li key={label}>
              <button
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 rounded-xl px-6 py-3 text-left transition-colors duration-200 w-[90%]',
                  isActive
                    ? 'bg-sidebarSelected text-black font-semibold'
                    : 'text-white hover:bg-strongPrimary',
                ].join(' ')}
                onClick={() => {
                  if (path) {
                    navigate(path)
                  }

                  if (isMobile) {
                    setIsSidebarOpen(false)
                  }
                }}
                type='button'
              >
                <Icon size={25} />
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      if (isSidebarOpen) {
        event.preventDefault()
        setIsSidebarOpen(false)
        return
      }


      const isBackOrCancel = (button: HTMLButtonElement) => {
        const label = `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`.trim()
        return /(cancelar|volver)/i.test(label)
      }

      const findVisibleBackOrCancel = (scope: ParentNode | null) => {
        if (!scope) return null
        return Array.from(scope.querySelectorAll<HTMLButtonElement>('button:not([disabled])')).find(
          (button) => button.offsetParent !== null && isBackOrCancel(button),
        )
      }

      const active = document.activeElement as HTMLElement | null
      const scopedContainer = active?.closest(
        'form, section, article, main, [role="region"], [data-kbd-main="true"]',
      )

      const candidate =
        findVisibleBackOrCancel(scopedContainer ?? null) ??
        findVisibleBackOrCancel(document.querySelector('[data-kbd-main="true"]')) ??
        findVisibleBackOrCancel(document)

      if (candidate) {
        event.preventDefault()
        candidate.click()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSidebarOpen])

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname, isMobile])

  const getVisibleFocusable = useCallback((root: ParentNode = document) => {
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null,
    )
  }, [])

  const moveFocusToBoundary = useCallback(
    (source: HTMLElement | null, destination: HTMLElement | null) => {
      if (!source || !destination) return false
      const active = document.activeElement as HTMLElement | null
      if (!active || !source.contains(active)) return false
      const destFocusable = getVisibleFocusable(destination)
      if (destFocusable.length === 0) return false
      destFocusable[0]?.focus()
      return true
    },
    [getVisibleFocusable],
  )

  const handleGlobalKeyboardNav = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const tagName = target.tagName.toLowerCase()
      const isTypingField = tagName === 'input' || tagName === 'textarea' || tagName === 'select'
      const isEditable = target.isContentEditable
      const role = target.getAttribute('role')
      const isComboLike = role === 'combobox' || role === 'listbox' || role === 'menuitem'
      if (isEditable) return

      if (event.key === 'Enter') {
        const clickable = target.closest<HTMLElement>('button, [role="button"]')
        if (clickable) {
          event.preventDefault()
          clickable.click()
        }
        return
      }

      if (!ARROW_KEYS.has(event.key)) return
      if (event.altKey || event.ctrlKey || event.metaKey) return


      if (isTypingField && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return

      if (tagName === 'textarea' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) return


      if (isComboLike || isTypingField) {
        event.preventDefault()
      }

      const active = document.activeElement as HTMLElement | null
      const focusables = getVisibleFocusable()
      if (focusables.length === 0) return

      const sidebarRef = isMobile ? mobileSidebarRef.current : desktopSidebarRef.current
      const mainRef = isMobile ? mobileMainRef.current : desktopMainRef.current

      if (active && event.key === 'ArrowRight' && moveFocusToBoundary(sidebarRef, mainRef)) {
        event.preventDefault()
        return
      }
      if (active && event.key === 'ArrowLeft' && moveFocusToBoundary(mainRef, sidebarRef)) {
        event.preventDefault()
        return
      }

      const currentIndex = active ? focusables.indexOf(active) : -1
      event.preventDefault()

      if (currentIndex === -1) {
        focusables[0]?.focus()
        return
      }

      const moveForward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
      const delta = moveForward ? 1 : -1
      const nextIndex = (currentIndex + delta + focusables.length) % focusables.length
      focusables[nextIndex]?.focus()
    },
    [getVisibleFocusable, isMobile, moveFocusToBoundary],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyboardNav)
    return () => window.removeEventListener('keydown', handleGlobalKeyboardNav)
  }, [handleGlobalKeyboardNav])

  if (!isMobile) {
    return (
      <div className='min-h-screen overflow-x-hidden bg-fondo'>
        <aside
          aria-label='Barra lateral de navegación'
          className='fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar px-4 py-4 text-white'
          data-kbd-sidebar='true'
          ref={desktopSidebarRef}
          style={{ width: sidebarWidth }}
        >
          <div className='mb-6 flex justify-center'>
            <div className='flex h-[66px] w-[66px] items-center justify-center rounded-[12px] bg-white shadow-[0px_4px_6px_4px_rgba(0,0,0,0.25)]'>
              <Logo alt='Logo de Blog' className='h-14 w-14' />
            </div>
          </div>

          {renderNavigation()}

          <div className='mt-auto flex flex-col items-center pt-8'>
            <div
              aria-label={`Avatar de ${userFullName}`}
              className='flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white'
              role='img'
              style={{ backgroundColor }}
            >
              {initial}
            </div>
            <p className='mt-2 text-sm text-slate-200'>{userFullName}</p>
          </div>
        </aside>

        <div className='flex min-h-screen flex-col overflow-x-hidden' style={{ paddingLeft: sidebarWidth }}>
          <header className='sticky top-0 z-20 flex h-[56px] items-center justify-end bg-primary px-6 text-white'>
            <button
              aria-label='Cerrar sesion'
              className='inline-flex items-center gap-3 rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:bg-giftRed'
              onClick={logout}
              type='button'
            >
              <span>Cerrar Sesion</span>
              <ArrowRightFromLine size={20} />
            </button>
          </header>

          <main className='flex-1 overflow-x-hidden p-4 md:p-6' data-kbd-main='true' ref={desktopMainRef}>
            <div
              className='w-full'
              style={{
                maxWidth: isTablet ? 'calc(100vw - 230px)' : 'none',
              }}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen overflow-x-hidden bg-fondo'>
      <header className='sticky top-0 z-20 bg-primary px-3 py-3 text-white'>
        <div className='mx-auto flex max-w-[1280px] items-center justify-between gap-3'>
          <button
            aria-controls='mobile-sidebar'
            aria-expanded={isSidebarOpen}
            aria-label='Abrir menu principal'
            className='inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10'
            onClick={() => setIsSidebarOpen(true)}
            type='button'
          >
            <SquareMenu size={40} />
          </button>

          <div className='flex h-[52px] min-w-[150px] items-center justify-center rounded-[12px] bg-white px-3 shadow-[0px_4px_6px_4px_rgba(0,0,0,0.25)]'>
            <LogoFull alt='Logo completo Blog' className='h-8 w-auto' />
          </div>

          <div className='flex items-center gap-2'>
            <button
              aria-label='Cerrar sesion'
              className='inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-giftRed'
              onClick={logout}
              type='button'
            >
              <ArrowRightFromLine size={40} />
            </button>
          </div>
        </div>
      </header>

      <main
        className='mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1280px] overflow-x-hidden px-3 pt-4 pb-8'
        data-kbd-main='true'
        ref={mobileMainRef}
      >
        <div className='w-full max-w-full overflow-x-hidden'>
          <Outlet />
        </div>
      </main>

      <div
        className={[
          'fixed inset-0 z-40 transition-opacity duration-200',
          isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <button
          aria-label='Cerrar menu lateral'
          className='absolute inset-0 bg-black/35'
          onClick={() => setIsSidebarOpen(false)}
          type='button'
        />

        <aside
          aria-label='Barra lateral de navegacion'
          className={[
            'relative z-10 flex h-full w-[78%] max-w-[300px] flex-col bg-sidebar px-4 py-5 text-white shadow-xl',
            'transform transition-transform duration-200 ease-out',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          data-kbd-sidebar='true'
          id='mobile-sidebar'
          ref={mobileSidebarRef}
        >
          <div className='flex items-center justify-between'>
            <p className='text-base font-semibold'>Blog</p>
            <button
              aria-label='Cerrar menu'
              className='inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10'
              onClick={() => setIsSidebarOpen(false)}
              type='button'
            >
              <X size={18} />
            </button>
          </div>

          {renderNavigation()}

          <div className='mt-auto flex flex-col items-center pt-8'>
            <div
              aria-label={`Avatar de ${userFullName}`}
              className='flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white'
              role='img'
              style={{ backgroundColor }}
            >
              {initial}
            </div>
            <p className='mt-2 text-sm text-slate-200'>{userFullName}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
