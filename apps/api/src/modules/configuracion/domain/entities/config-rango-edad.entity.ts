// ConfigRangoEdad - Rango de edades (Age range category)
export interface ConfigRangoEdadEntity {
  id: number
  nombre: string
  rango1: number
  rango2: number
  sexo: number | null
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
