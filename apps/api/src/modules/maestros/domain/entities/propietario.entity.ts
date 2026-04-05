// Propietario - Property owner (tenant-scoped)
export interface PropietarioEntity {
  id: number
  predioId: number
  nombre: string
  tipoDocumento: string | null
  numeroDocumento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
