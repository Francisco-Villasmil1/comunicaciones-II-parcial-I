import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import Spinner from '@/components/Spinner'
import { BlogLayout } from '@/layout/BlogLayout'
import { useAppStore } from '@/store/useAppStore'
import { UserRole } from '@/types/user'
import { AuthLayout } from '@/views/auth/AuthLayout'

const LoginPage = lazy(async () => {
  const module = await import('@/views/auth/LoginPage')
  return { default: module.LoginPage }
})

const RegisterPage = lazy(async () => {
  const module = await import('@/views/auth/RegisterPage')
  return { default: module.RegisterPage }
})

const BlogHomePage = lazy(async () => {
  const module = await import('@/views/blog/BlogHomePage')
  return { default: module.BlogHomePage }
})

const BlogPostPage = lazy(async () => {
  const module = await import('@/views/blog/BlogPostPage')
  return { default: module.BlogPostPage }
})

const NewPublicacion = lazy(async () => {
  const module = await import('@/views/publicaciones/NewPublicacion')
  return { default: module.NewPublicacion }
})

const EditPublicacion = lazy(async () => {
  const module = await import('@/views/publicaciones/EditPublicacion')
  return { default: module.EditPublicacion }
})

function RequireDueno() {
  const token = useAppStore((state) => state.token)
  const user = useAppStore((state) => state.user)

  if (!token) {
    return <Navigate replace to='/auth/login' />
  }

  if (user.rol !== UserRole.DUENO) {
    return <Navigate replace to='/' />
  }

  return <Outlet />
}

function LoadingFallback() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Spinner />
    </div>
  )
}

export default function AppRouter() {
  const token = useAppStore((state) => state.token)
  const loadingUser = useAppStore((state) => state.loadingUser)
  const getUser = useAppStore((state) => state.getUser)

  useEffect(() => {
    if (token) {
      void getUser()
    }
  }, [token, getUser])

  if (loadingUser) {
    return <LoadingFallback />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path='/auth/login'
            element={
              <Suspense fallback='Cargando...'>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path='/auth/register'
            element={
              <Suspense fallback='Cargando...'>
                <RegisterPage />
              </Suspense>
            }
          />
        </Route>

        <Route element={<BlogLayout />}>
          <Route
            index
            element={
              <Suspense fallback='Cargando...'>
                <BlogHomePage />
              </Suspense>
            }
          />
          <Route
            path='post/:publicacionId'
            element={
              <Suspense fallback='Cargando...'>
                <BlogPostPage />
              </Suspense>
            }
          />

          <Route element={<RequireDueno />}>
            <Route
              path='publicaciones/new'
              element={
                <Suspense fallback='Cargando...'>
                  <NewPublicacion />
                </Suspense>
              }
            />
            <Route
              path='publicaciones/edit/:publicacionId'
              element={
                <Suspense fallback='Cargando...'>
                  <EditPublicacion />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route path='*' element={<Navigate replace to='/' />} />
      </Routes>
    </BrowserRouter>
  )
}
