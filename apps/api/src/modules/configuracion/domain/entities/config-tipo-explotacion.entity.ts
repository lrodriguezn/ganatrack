// ConfigTipoExplotacion - Tipo de explotación ganadera (Farm exploitation type)
export interface ConfigTipoExplotacionEntity {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
