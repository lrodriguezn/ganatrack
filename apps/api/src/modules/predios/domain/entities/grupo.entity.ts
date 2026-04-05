// Grupo - Group entity (child - has tenant filter)
export interface GrupoEntity {
  id: number
  predioId: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
