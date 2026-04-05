// Inseminacion Grupal DTOs
export interface CreateInseminacionGrupalDto {
  codigo: string
  fecha: string
  veterinariosId?: number
  observaciones?: string
  animales: CreateInseminacionAnimalDto[]
}

export interface UpdateInseminacionGrupalDto {
  codigo?: string
  fecha?: string
  veterinariosId?: number
  observaciones?: string
}

export interface InseminacionGrupalResponseDto {
  id: number
  predioId: number
  codigo: string
  fecha: string
  veterinariosId: number | null
  observaciones: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
  animales: InseminacionAnimalResponseDto[]
}

// Inseminacion Animal DTOs
export interface CreateInseminacionAnimalDto {
  animalId: number
  veterinarioId?: number
  fecha?: string
  tipoInseminacionKey?: number
  codigoPajuela?: string
  diagnosticoId?: number
  observaciones?: string
}

export interface UpdateInseminacionAnimalDto {
  veterinarioId?: number
  fecha?: string
  tipoInseminacionKey?: number
  codigoPajuela?: string
  diagnosticoId?: number
  observaciones?: string
}

export interface InseminacionAnimalResponseDto {
  id: number
  inseminacionGrupalId: number
  animalId: number
  veterinarioId: number | null
  fecha: string
  tipoInseminacionKey: number | null
  codigoPajuela: string | null
  diagnosticoId: number | null
  observaciones: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}
