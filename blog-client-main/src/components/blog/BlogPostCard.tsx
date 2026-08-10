import { MessageCircle, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Publicacion } from '@/api/PublicacionesApi'
import { resolveImageUrl } from '@/utils/imageUrl'
import { getUserAvatarStyleFromName } from '@/utils/avatar'
import { formatBlogDate, getExcerpt, getReadingTimeMinutes } from '@/utils/blog'

type BlogPostCardProps = {
  publicacion: Publicacion
  showOwnerActions?: boolean
}

export function BlogPostCard({ publicacion, showOwnerActions = false }: BlogPostCardProps) {
  const coverUrl = publicacion.imagenes[0]?.url
    ? resolveImageUrl(publicacion.imagenes[0].url)
    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'

  const { initial, backgroundColor } = getUserAvatarStyleFromName(publicacion.autorNombre)
  const readingTime = getReadingTimeMinutes(publicacion.contenido)

  return (
    <article className='overflow-hidden border-b border-slate-200 pb-10'>
      <Link className='block overflow-hidden' to={`/post/${publicacion.id}`}>
        <img
          alt={publicacion.titulo}
          className='h-[280px] w-full object-cover transition-transform duration-300 hover:scale-[1.01] sm:h-[360px]'
          src={coverUrl}
        />
      </Link>

      <div className='mt-5 flex items-center gap-3 text-sm text-slate-500'>
        <span
          className='flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white'
          style={{ backgroundColor }}
        >
          {initial}
        </span>
        <span>{formatBlogDate(publicacion.fechaCreacion)}</span>
        <span aria-hidden='true'>·</span>
        <span>{readingTime} min de lectura</span>
      </div>

      <Link className='group mt-4 block' to={`/post/${publicacion.id}`}>
        <h2 className='font-serif text-3xl leading-tight text-ink transition-colors group-hover:text-primary sm:text-4xl'>
          {publicacion.titulo}
        </h2>
      </Link>

      <p className='mt-4 max-w-3xl text-base leading-7 text-ownText'>
        {getExcerpt(publicacion.contenido)}
      </p>

      <div className='mt-5 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4 text-sm text-slate-500'>
          <span className='inline-flex items-center gap-1.5'>
            <MessageCircle size={16} />
            {publicacion.totalComentarios} comentarios
          </span>
        </div>

        {showOwnerActions ? (
          <Link
            className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline'
            to={`/publicaciones/edit/${publicacion.id}`}
          >
            <Pencil size={15} />
            Editar
          </Link>
        ) : null}
      </div>
    </article>
  )
}
