export const UserRole = {
  DUENO: 'DUENO',
  LECTOR: 'LECTOR',
  ADMIN: 'ADMIN',
  PROFESOR: 'PROFESOR',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export type User = {
  id: number | null
  nombreUsuario: string
  nombre: string | null
  apellido: string | null
  correo: string
  rol: UserRole
  isActive: boolean
}
