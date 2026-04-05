// ConfigKeyValue - Configuración clave-valor genérica (Generic key-value configuration)
export interface ConfigKeyValueEntity {
  id: number
  opcion: string
  key: string
  value: string | null
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
