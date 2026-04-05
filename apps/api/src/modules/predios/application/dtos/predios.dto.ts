// Predio DTOs
export interface CreatePredioDto {
  codigo: string
  nombre: string
  departamento?: string
  municipio?: string
  vereda?: string
  areaHectareas?: number
  capacidadMaxima?: number
  tipoExplotacionId?: number
}

export interface UpdatePredioDto {
  codigo?: string
  nombre?: string
  departamento?: string
  municipio?: string
  vereda?: string
  areaHectareas?: number
  capacidadMaxima?: number
  tipoExplotacionId?: number
}

export interface PredioResponseDto {
  id: number
  codigo: string
  nombre: string
  departamento: string | null
  municipio: string | null
  vereda: string | null
  areaHectareas: number | null
  capacidadMaxima: number | null
  tipoExplotacionId: number | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Potrero DTOs
export interface CreatePotreroDto {
  codigo: string
  nombre: string
  areaHectareas?: number
  tipoPasto?: string
  capacidadMaxima?: number
  estado?: string
}

export interface UpdatePotreroDto {
  codigo?: string
  nombre?: string
  areaHectareas?: number
  tipoPasto?: string
  capacidadMaxima?: number
  estado?: string
}

export interface PotreroResponseDto {
  id: number
  predioId: number
  codigo: string
  nombre: string
  areaHectareas: number | null
  tipoPasto: string | null
  capacidadMaxima: number | null
  estado: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Sector DTOs
export interface CreateSectorDto {
  codigo: string
  nombre: string
  areaHectareas?: number
  tipoPasto?: string
  capacidadMaxima?: number
  estado?: string
}

export interface UpdateSectorDto {
  codigo?: string
  nombre?: string
  areaHectareas?: number
  tipoPasto?: string
  capacidadMaxima?: number
  estado?: string
}

export interface SectorResponseDto {
  id: number
  predioId: number
  codigo: string
  nombre: string
  areaHectareas: number | null
  tipoPasto: string | null
  capacidadMaxima: number | null
  estado: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Lote DTOs
export interface CreateLoteDto {
  nombre: string
  descripcion?: string
  tipo?: string
}

export interface UpdateLoteDto {
  nombre?: string
  descripcion?: string
  tipo?: string
}

export interface LoteResponseDto {
  id: number
  predioId: number
  nombre: string
  descripcion: string | null
  tipo: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Grupo DTOs
export interface CreateGrupoDto {
  nombre: string
  descripcion?: string
}

export interface UpdateGrupoDto {
  nombre?: string
  descripcion?: string
}

export interface GrupoResponseDto {
  id: number
  predioId: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// ConfigParametroPredio DTOs
export interface CreateConfigParametroPredioDto {
  codigo: string
  valor?: string
  descripcion?: string
}

export interface UpdateConfigParametroPredioDto {
  codigo?: string
  valor?: string
  descripcion?: string
}

export interface ConfigParametroPredioResponseDto {
  id: number
  predioId: number
  codigo: string
  valor: string | null
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}
