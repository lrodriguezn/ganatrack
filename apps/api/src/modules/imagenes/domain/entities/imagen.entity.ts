/**
 * Imagen entity
 * Image metadata for file storage
 */
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
