const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(
  /\/api\/?$/,
  '',
)

export function resolveImageUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`
  }

  return url
}
