// Lote - Lot entity (child - has tenant filter)
export interface LoteEntity {
  id: number
  predioId: number
  nombre: string
  descripcion: string | null
  tipo: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
