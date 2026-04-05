// Veterinario Grupal DTOs
export interface CreateVeterinarioGrupalDto {
  codigo: string
  fecha: string
  veterinariosId?: number
  tipoServicio?: string
  observaciones?: string
  animales: CreateVeterinarioAnimalDto[]
}

export interface UpdateVeterinarioGrupalDto {
  codigo?: string
  fecha?: string
  veterinariosId?: number
  tipoServicio?: string
  observaciones?: string
}

export interface VeterinarioGrupalResponseDto {
  id: number
  predioId: number
  codigo: string
  fecha: string
  veterinariosId: number | null
  tipoServicio: string | null
  observaciones: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
  animales: VeterinarioAnimalResponseDto[]
}

// Veterinario Animal DTOs
export interface CreateVeterinarioAnimalDto {
  animalId: number
  veterinarioId?: number
  diagnosticoId?: number
  fecha?: string
  tipoDiagnosticoKey?: number
  tratamiento?: string
  medicamentos?: string
  dosis?: string
  comentarios?: string
  productos: CreateVeterinarioProductoDto[]
}

export interface UpdateVeterinarioAnimalDto {
  veterinarioId?: number
  diagnosticoId?: number
  fecha?: string
  tipoDiagnosticoKey?: number
  tratamiento?: string
  medicamentos?: string
  dosis?: string
  comentarios?: string
}

export interface VeterinarioAnimalResponseDto {
  id: number
  servicioGrupalId: number
  animalId: number
  veterinarioId: number | null
  diagnosticoId: number | null
  fecha: string
  tipoDiagnosticoKey: number | null
  tratamiento: string | null
  medicamentos: string | null
  dosis: string | null
  comentarios: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
  productos: VeterinarioProductoResponseDto[]
}

// Veterinario Producto DTOs
export interface CreateVeterinarioProductoDto {
  productoId: number
  cantidad?: number
  unidad?: string
}

export interface VeterinarioProductoResponseDto {
  id: number
  servicioAnimalId: number
  productoId: number
  cantidad: number | null
  unidad: string | null
  activo: number
  createdAt: string | null
}
