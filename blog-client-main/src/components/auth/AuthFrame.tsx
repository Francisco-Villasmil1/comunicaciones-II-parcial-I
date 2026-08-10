import type { ReactNode } from 'react'

type AuthFrameProps = {
  title: string
  children: ReactNode
  maxWidthClassName?: string
}

export function AuthFrame({
  title,
  children,
  maxWidthClassName = 'max-w-[430px]',
}: AuthFrameProps) {
  return (
    <main className='flex min-h-screen items-center justify-center bg-fondo px-4 py-10'>
      <div
        className={[
          'w-full rounded-md border-[6px] border-primary bg-white p-6 shadow-panel sm:p-8',
          maxWidthClassName,
        ].join(' ')}
      >
        <header className='mb-6 border-b border-primary/15 pb-5 text-center'>
          <p className='text-xs uppercase tracking-[0.35em] text-primary/70'>Mi Blog</p>
          <h1 className='mt-2 font-serif text-3xl text-ink'>{title}</h1>
        </header>

        {children}
      </div>
    </main>
  )
}
