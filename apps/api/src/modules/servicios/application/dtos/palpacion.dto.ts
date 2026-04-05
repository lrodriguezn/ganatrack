// Palpacion Grupal DTOs
export interface CreatePalpacionGrupalDto {
  codigo: string
  fecha: string
  veterinariosId?: number
  observaciones?: string
  animales: CreatePalpacionAnimalDto[]
}

export interface UpdatePalpacionGrupalDto {
  codigo?: string
  fecha?: string
  veterinariosId?: number
  observaciones?: string
}

export interface PalpacionGrupalResponseDto {
  id: number
  predioId: number
  codigo: string
  fecha: string
  veterinariosId: number | null
  observaciones: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
  animales: PalpacionAnimalResponseDto[]
}

// Palpacion Animal DTOs
export interface CreatePalpacionAnimalDto {
  animalId: number
  veterinarioId?: number
  diagnosticoId?: number
  condicionCorporalId?: number
  fecha?: string
  diasGestacion?: number
  fechaParto?: string
  comentarios?: string
}

export interface UpdatePalpacionAnimalDto {
  veterinarioId?: number
  diagnosticoId?: number
  condicionCorporalId?: number
  fecha?: string
  diasGestacion?: number
  fechaParto?: string
  comentarios?: string
}

export interface PalpacionAnimalResponseDto {
  id: number
  palpacionGrupalId: number
  animalId: number
  veterinarioId: number | null
  diagnosticoId: number | null
  condicionCorporalId: number | null
  fecha: string
  diasGestacion: number | null
  fechaParto: string | null
  comentarios: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}
