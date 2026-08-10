import { AUTH_TOKEN_KEY } from '@/store/authStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const parseUploadError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string }
    if (data?.message) {
      return data.message
    }
  } catch {
    return `No se pudo subir la imagen (${response.status}).`
  }

  return `No se pudo subir la imagen (${response.status}).`
}

export const UploadsApi = {
  async upload(files: File[]) {
    if (files.length === 0) {
      return { urls: [] as string[] }
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('imagenes', file)
    })

    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const headers = new Headers()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers,
      body: formData,
    }).catch(() => {
      throw new Error(
        'No se pudo conectar con el servidor. Verifica que la API este en ejecucion.',
      )
    })

    if (!response.ok) {
      throw new Error(await parseUploadError(response))
    }

    return response.json() as Promise<{ urls: string[] }>
  },
}
