// ConfigRaza - Raza de ganado (Cattle breed)
export interface ConfigRazaEntity {
  id: number
  nombre: string
  descripcion: string | null
  origen: string | null
  tipoProduccion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
