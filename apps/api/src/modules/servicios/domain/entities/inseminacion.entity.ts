/**
 * InseminacionGrupal entity
 * Group insemination service event header
 */
export interface InseminacionGrupalEntity {
  id: number
  predioId: number
  codigo: string
  fecha: Date
  veterinariosId: number | null
  observaciones: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * InseminacionAnimal entity
 * Individual animal insemination record
 */
export interface InseminacionAnimalEntity {
  id: number
  inseminacionGrupalId: number
  animalId: number
  veterinarioId: number | null
  fecha: Date
  tipoInseminacionKey: number | null
  codigoPajuela: string | null
  diagnosticoId: number | null
  observaciones: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
