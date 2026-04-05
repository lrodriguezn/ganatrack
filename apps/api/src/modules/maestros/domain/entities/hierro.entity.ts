// Hierro - Brand iron (tenant-scoped)
export interface HierroEntity {
  id: number
  predioId: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
