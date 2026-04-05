// MotivoVenta - Sale reason (global)
export interface MotivoVentaEntity {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
