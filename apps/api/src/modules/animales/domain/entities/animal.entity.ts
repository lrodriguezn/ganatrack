// Animal entity with self-referencing lineage
export interface AnimalEntity {
  id: number
  predioId: number
  codigo: string
  nombre: string | null
  fechaNacimiento: Date | null
  fechaCompra: Date | null
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
  createdAt: Date | null
  updatedAt: Date | null
}

// Image entity
export interface ImagenEntity {
  id: number
  predioId: number
  ruta: string
  nombreOriginal: string | null
  mimeType: string | null
  tamanoBytes: number | null
  descripcion: string | null
  activo: number
  createdAt: Date | null
}

// Animal-Image junction
export interface AnimalImagenEntity {
  id: number
  animalId: number
  imagenId: number
  activo: number
  createdAt: Date | null
}
