// CausaMuerte - Death cause (global)
export interface CausaMuerteEntity {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
