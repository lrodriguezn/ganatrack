// Sector - Sector entity (child - has tenant filter)
export interface SectorEntity {
  id: number
  predioId: number
  codigo: string
  nombre: string
  areaHectareas: number | null
  tipoPasto: string | null
  capacidadMaxima: number | null
  estado: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
