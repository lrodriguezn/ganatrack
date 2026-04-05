// Veterinario - Veterinarian (tenant-scoped)
export interface VeterinarioEntity {
  id: number
  predioId: number
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  numeroRegistro: string | null
  especialidad: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
