import { createTheme } from '@mui/material/styles'

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#c2410c',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Space Grotesk, Segoe UI, sans-serif',
    h4: {
      fontFamily: 'Fraunces, Georgia, serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'Fraunces, Georgia, serif',
      fontWeight: 700,
    },
  },
})
