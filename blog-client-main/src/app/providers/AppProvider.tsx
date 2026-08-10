import type { PropsWithChildren } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ToastContainer } from 'react-toastify'

import { queryClient } from '@/lib/queryClient'
import { muiTheme } from '@/theme/muiTheme'

import 'react-toastify/dist/ReactToastify.css'

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer position='top-right' autoClose={3000} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}