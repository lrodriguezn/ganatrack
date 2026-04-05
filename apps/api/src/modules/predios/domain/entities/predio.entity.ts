// Predio - Farm/Estate entity (parent entity - no tenant filter)
export interface PredioEntity {
  id: number
  codigo: string
  nombre: string
  departamento: string | null
  municipio: string | null
  vereda: string | null
  areaHectareas: number | null
  capacidadMaxima: number | null
  tipoExplotacionId: number | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
