// ConfigCondicionCorporal - Condición corporal (Body condition score)
export interface ConfigCondicionCorporalEntity {
  id: number
  nombre: string
  descripcion: string | null
  valorMin: number | null
  valorMax: number | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
