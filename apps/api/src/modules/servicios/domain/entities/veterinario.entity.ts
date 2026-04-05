/**
 * VeterinarioGrupal entity
 * Group veterinary service event header
 */
export interface VeterinarioGrupalEntity {
  id: number
  predioId: number
  codigo: string
  fecha: Date
  veterinariosId: number | null
  tipoServicio: string | null
  observaciones: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * VeterinarioAnimal entity
 * Individual animal veterinary treatment record
 */
export interface VeterinarioAnimalEntity {
  id: number
  servicioGrupalId: number
  animalId: number
  veterinarioId: number | null
  diagnosticoId: number | null
  fecha: Date
  tipoDiagnosticoKey: number | null
  tratamiento: string | null
  medicamentos: string | null
  dosis: string | null
  comentarios: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * VeterinarioProducto entity
 * Product used in a veterinary service for an animal
 */
export interface VeterinarioProductoEntity {
  id: number
  servicioAnimalId: number
  productoId: number
  cantidad: number | null
  unidad: string | null
  activo: number
  createdAt: Date | null
}
