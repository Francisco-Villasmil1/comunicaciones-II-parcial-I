import { Button } from '@mui/material'
import type { MouseEventHandler, ReactNode } from 'react'

type BaseButtonProps = {
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  form?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
  startIcon?: ReactNode
  ariaLabel?: string
  tone?: 'primary' | 'secondary'
  borderRadius?: number | string
  sx?: object
}

export function BaseButton({
  text,
  onClick,
  type = 'button',
  form,
  disabled = false,
  loading = false,
  className,
  fullWidth = true,
  startIcon,
  ariaLabel,
  tone = 'primary',
  borderRadius = '10px',
  sx,
}: BaseButtonProps) {
  const isSecondary = tone === 'secondary'

  return (
    <Button
      className={className}
      disabled={disabled || loading}
      form={form}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={startIcon ? <span aria-hidden="true">{startIcon}</span> : undefined}
      type={type}
      aria-label={ariaLabel ?? text}
      aria-busy={loading}
      variant='contained'
      sx={{
        backgroundColor: isSecondary ? '#ffffff' : '#065F46',
        color: isSecondary ? '#111827' : '#ffffff',
        border: isSecondary ? '1px solid #111827' : 'none',
        borderRadius,
        boxShadow: '0px 4px 6px 4px rgba(0,0,0,0.25)',
        fontWeight: 700,
        letterSpacing: '0.2px',
        fontSize: '20px',
        minHeight: 56,
        py: 1.5,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: isSecondary ? '#f8fafc' : '#064E3B',
        },
        ...sx
      }}
    >
      {loading ? 'Procesando...' : text}
    </Button>
  )
}
