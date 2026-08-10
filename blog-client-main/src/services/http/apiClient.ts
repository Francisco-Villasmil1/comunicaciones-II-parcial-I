import { AUTH_TOKEN_KEY } from '@/store/authStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string }
    if (data?.message) {
      return data.message
    }
  } catch {
    return `API request failed with status ${response.status}`
  }

  return `API request failed with status ${response.status}`
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  }).catch(() => {
    throw new Error(
      'No se pudo conectar con el servidor. Verifica que la API este en ejecucion.',
    )
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return response.json() as Promise<T>
}
