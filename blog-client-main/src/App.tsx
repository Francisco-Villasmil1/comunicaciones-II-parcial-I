import { AppProvider } from '@/app/providers/AppProvider'
import AppRouter from '@/router'

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}

export default App
