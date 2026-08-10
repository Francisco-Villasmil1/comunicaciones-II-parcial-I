export function getExcerpt(content: string | null | undefined, maxLength = 160) {
  if (!content?.trim()) {
    return 'Publicacion sin descripcion.'
  }

  const normalized = content.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trim()}...`
}

export function getReadingTimeMinutes(content: string | null | undefined) {
  if (!content?.trim()) {
    return 1
  }

  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function formatBlogDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
