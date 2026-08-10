type LogoFullProps = {
  className?: string
  alt?: string
}

export function LogoFull({ className = 'h-auto w-full', alt = 'Logo completo Blog' }: LogoFullProps) {
  return (
    <img
      alt={alt}
      className={className}
      decoding='async'
      loading='lazy'
      src='/RU_Logo.png'
    />
  )
}