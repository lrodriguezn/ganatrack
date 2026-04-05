// ConfigParametroPredio - Farm-specific configuration parameter (child - has tenant filter)
export interface ConfigParametroPredioEntity {
  id: number
  predioId: number
  codigo: string
  valor: string | null
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
