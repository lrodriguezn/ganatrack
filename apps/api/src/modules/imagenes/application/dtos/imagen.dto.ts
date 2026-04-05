export interface UploadImagenDto {
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
