import type { ReactNode } from 'react'

type DashboardCardProps = {
  title?: string
  hideTitle?: boolean
  children: ReactNode
  className?: string
}

export function DashboardCard({ title, hideTitle = false, children, className = '' }: DashboardCardProps) {
  return (
    <section
      aria-label={title ?? 'Tarjeta dashboard'}
      className={[
        'w-full rounded-[12px] bg-white p-3 shadow-[0px_4px_6px_4px_rgba(0,0,0,0.25)]',
        className,
      ].join(' ')}
    >
      {title && !hideTitle ? <h3 className='mb-3 text-[24px] leading-tight text-ink'>{title}</h3> : null}
      {children}
    </section>
  )
}
