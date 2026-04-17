export interface CreateAnimalDto {
  codigo: string
  nombre?: string
  fechaNacimiento?: string
  fechaCompra?: string
  sexoKey?: number
  tipoIngresoId?: number
  madreId?: number
  codigoMadre?: string
  indTransferenciaEmb?: number
  codigoDonadora?: string
  tipoPadreKey?: number
  padreId?: number
  codigoPadre?: string
  codigoPajuela?: string
  configRazasId?: number
  potreroId?: number
  precioCompra?: number
  pesoCompra?: number
  codigoRfid?: string
  codigoArete?: string
  codigoQr?: string
  saludAnimalKey?: number
  estadoAnimalKey?: number
  indDescartado?: number
}

export interface UpdateAnimalDto {
  nombre?: string
  fechaNacimiento?: string
  fechaCompra?: string
  sexoKey?: number
  tipoIngresoId?: number
  madreId?: number
  codigoMadre?: string
  indTransferenciaEmb?: number
  codigoDonadora?: string
  tipoPadreKey?: number
  padreId?: number
  codigoPadre?: string
  codigoPajuela?: string
  configRazasId?: number
  potreroId?: number
  precioCompra?: number
  pesoCompra?: number
  codigoRfid?: string
  codigoArete?: string
  codigoQr?: string
  saludAnimalKey?: number
  estadoAnimalKey?: number
  indDescartado?: number
}

export interface AnimalResponseDto {
  id: number
  predioId: number
  codigo: string
  nombre: string
  fechaNacimiento: string | null
  fechaCompra: string | null
  sexoKey: number | null
  tipoIngresoId: number | null
  madreId: number | null
  codigoMadre: string | null
  indTransferenciaEmb: number | null
  codigoDonadora: string | null
  tipoPadreKey: number | null
  padreId: number | null
  codigoPadre: string | null
  codigoPajuela: string | null
  configRazasId: number | null
  razaNombre: string | null  // Joined from config_razas
  potreroId: number | null
  precioCompra: number | null
  pesoCompra: number | null
  codigoRfid: string | null
  codigoArete: string | null
  codigoQr: string | null
  saludAnimalKey: number | null
  estadoAnimalKey: number | null
  indDescartado: number | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateImagenDto {
  ruta: string
  nombreOriginal?: string
  mimeType?: string
  tamanoBytes?: number
  descripcion?: string
}

export interface ImagenResponseDto {
  id: number
  predioId: number
  ruta: string
  nombreOriginal: string | null
  mimeType: string | null
  tamanoBytes: number | null
  descripcion: string | null
  activo: number
  createdAt: string | null
}

export interface AssignImagenDto {
  imagenId: number
}

export interface GenealogiaResponseDto {
  animal: AnimalResponseDto
  ancestors: AnimalResponseDto[]
  descendants: AnimalResponseDto[]
}
