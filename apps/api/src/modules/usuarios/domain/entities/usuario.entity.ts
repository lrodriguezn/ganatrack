export interface UsuarioEntity {
  id: number
  nombre: string
  email: string
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
