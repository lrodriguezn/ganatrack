// ============ TENANT-SCOPED DTOs ============

export interface CreateVeterinarioDto {
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  numeroRegistro?: string
  especialidad?: string
}

export interface UpdateVeterinarioDto {
  nombre?: string
  telefono?: string
  email?: string
  direccion?: string
  numeroRegistro?: string
  especialidad?: string
}

export interface VeterinarioResponseDto {
  id: number
  predioId: number
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  numeroRegistro: string | null
  especialidad: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreatePropietarioDto {
  nombre: string
  tipoDocumento?: string
  numeroDocumento?: string
  telefono?: string
  email?: string
  direccion?: string
}

export interface UpdatePropietarioDto {
  nombre?: string
  tipoDocumento?: string
  numeroDocumento?: string
  telefono?: string
  email?: string
  direccion?: string
}

export interface PropietarioResponseDto {
  id: number
  predioId: number
  nombre: string
  tipoDocumento: string | null
  numeroDocumento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateHierroDto {
  nombre: string
  descripcion?: string
}

export interface UpdateHierroDto {
  nombre?: string
  descripcion?: string
}

export interface HierroResponseDto {
  id: number
  predioId: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

// ============ GLOBAL DTOs ============

export interface CreateDiagnosticoVeterinarioDto {
  nombre: string
  descripcion?: string
  categoria?: string
}

export interface UpdateDiagnosticoVeterinarioDto {
  nombre?: string
  descripcion?: string
  categoria?: string
}

export interface DiagnosticoVeterinarioResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  categoria: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateMotivoVentaDto {
  nombre: string
  descripcion?: string
}

export interface UpdateMotivoVentaDto {
  nombre?: string
  descripcion?: string
}

export interface MotivoVentaResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateCausaMuerteDto {
  nombre: string
  descripcion?: string
}

export interface UpdateCausaMuerteDto {
  nombre?: string
  descripcion?: string
}

export interface CausaMuerteResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateLugarCompraDto {
  nombre: string
  tipo?: string
  ubicacion?: string
  contacto?: string
  telefono?: string
}

export interface UpdateLugarCompraDto {
  nombre?: string
  tipo?: string
  ubicacion?: string
  contacto?: string
  telefono?: string
}

export interface LugarCompraResponseDto {
  id: number
  nombre: string
  tipo: string | null
  ubicacion: string | null
  contacto: string | null
  telefono: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateLugarVentaDto {
  nombre: string
  tipo?: string
  ubicacion?: string
  contacto?: string
  telefono?: string
}

export interface UpdateLugarVentaDto {
  nombre?: string
  tipo?: string
  ubicacion?: string
  contacto?: string
  telefono?: string
}

export interface LugarVentaResponseDto {
  id: number
  nombre: string
  tipo: string | null
  ubicacion: string | null
  contacto: string | null
  telefono: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}
