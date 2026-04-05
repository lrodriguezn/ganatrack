// Parto Animal DTOs
export interface CreatePartoAnimalDto {
  animalId: number
  fecha: string
  macho?: number
  hembra?: number
  muertos?: number
  peso?: number
  tipoPartoKey?: number
  observaciones?: string
  crias: CreatePartoCriaDto[]
}

export interface UpdatePartoAnimalDto {
  fecha?: string
  macho?: number
  hembra?: number
  muertos?: number
  peso?: number
  tipoPartoKey?: number
  observaciones?: string
}

export interface PartoAnimalResponseDto {
  id: number
  predioId: number
  animalId: number
  fecha: string
  macho: number | null
  hembra: number | null
  muertos: number | null
  peso: number | null
  tipoPartoKey: number | null
  observaciones: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
  crias: PartoCriaResponseDto[]
}

// Parto Cria DTOs
export interface CreatePartoCriaDto {
  criaId?: number
  sexoKey?: number
  pesoNacimiento?: number
  observaciones?: string
}

export interface PartoCriaResponseDto {
  id: number
  partoId: number
  criaId: number | null
  sexoKey: number | null
  pesoNacimiento: number | null
  observaciones: string | null
  activo: number
  createdAt: string | null
}
