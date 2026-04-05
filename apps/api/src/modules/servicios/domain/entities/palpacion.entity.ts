/**
 * PalpacionGrupal entity
 * Group palpation service event header
 */
export interface PalpacionGrupalEntity {
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
 * PalpacionAnimal entity
 * Individual animal palpation result
 */
export interface PalpacionAnimalEntity {
  id: number
  palpacionGrupalId: number
  animalId: number
  veterinarioId: number | null
  diagnosticoId: number | null
  condicionCorporalId: number | null
  fecha: Date
  diasGestacion: number | null
  fechaParto: Date | null
  comentarios: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
