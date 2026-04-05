// Raza DTOs
export interface CreateConfigRazaDto {
  nombre: string
  descripcion?: string
  origen?: string
  tipoProduccion?: string
}

export interface UpdateConfigRazaDto {
  nombre?: string
  descripcion?: string
  origen?: string
  tipoProduccion?: string
}

export interface ConfigRazaResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  origen: string | null
  tipoProduccion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Condicion Corporal DTOs
export interface CreateConfigCondicionCorporalDto {
  nombre: string
  descripcion?: string
  valorMin?: number
  valorMax?: number
}

export interface UpdateConfigCondicionCorporalDto {
  nombre?: string
  descripcion?: string
  valorMin?: number
  valorMax?: number
}

export interface ConfigCondicionCorporalResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  valorMin: number | null
  valorMax: number | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Tipo Explotacion DTOs
export interface CreateConfigTipoExplotacionDto {
  nombre: string
  descripcion?: string
}

export interface UpdateConfigTipoExplotacionDto {
  nombre?: string
  descripcion?: string
}

export interface ConfigTipoExplotacionResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Calidad Animal DTOs
export interface CreateConfigCalidadAnimalDto {
  nombre: string
  descripcion?: string
}

export interface UpdateConfigCalidadAnimalDto {
  nombre?: string
  descripcion?: string
}

export interface ConfigCalidadAnimalResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Color DTOs
export interface CreateConfigColorDto {
  nombre: string
  codigo?: string
}

export interface UpdateConfigColorDto {
  nombre?: string
  codigo?: string
}

export interface ConfigColorResponseDto {
  id: number
  nombre: string
  codigo: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Rango Edad DTOs
export interface CreateConfigRangoEdadDto {
  nombre: string
  rango1: number
  rango2: number
  sexo?: number
  descripcion?: string
}

export interface UpdateConfigRangoEdadDto {
  nombre?: string
  rango1?: number
  rango2?: number
  sexo?: number
  descripcion?: string
}

export interface ConfigRangoEdadResponseDto {
  id: number
  nombre: string
  rango1: number
  rango2: number
  sexo: number | null
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// Key Value DTOs
export interface CreateConfigKeyValueDto {
  opcion: string
  key: string
  value?: string
  descripcion?: string
}

export interface UpdateConfigKeyValueDto {
  opcion?: string
  key?: string
  value?: string
  descripcion?: string
}

export interface ConfigKeyValueResponseDto {
  id: number
  opcion: string
  key: string
  value: string | null
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}
