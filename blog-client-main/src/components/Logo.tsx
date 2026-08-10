type LogoProps = {
  className?: string
  alt?: string
}

export function Logo({ className = 'h-16 w-16', alt = 'Logo Blog' }: LogoProps) {
  return (
    <img
      alt={alt}
      className={className}
      decoding='async'
      height={64}
      loading='eager'
      src='/RUNETLogoMini.png'
      width={64}
    />
  )
}