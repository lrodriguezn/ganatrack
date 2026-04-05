/**
 * PartoAnimal entity
 * Individual birth record for an animal
 */
export interface PartoAnimalEntity {
  id: number
  predioId: number
  animalId: number
  fecha: Date
  macho: number | null
  hembra: number | null
  muertos: number | null
  peso: number | null
  tipoPartoKey: number | null
  observaciones: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * PartoCria entity
 * Offspring from a birth record
 */
export interface PartoCriaEntity {
  id: number
  partoId: number
  criaId: number | null
  sexoKey: number | null
  pesoNacimiento: number | null
  observaciones: string | null
  activo: number
  createdAt: Date | null
}
