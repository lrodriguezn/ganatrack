export interface CreateProductoDto {
  codigo: string
  nombre?: string
  descripcion?: string
  tipoProducto?: string
  categoria?: string
  presentacion?: string
  unidadMedida?: string
  precioUnitario?: number
  stockMinimo?: number
  stockActual?: number
  fechaVencimiento?: string
  laboratorio?: string
  registroInvima?: string
}

export interface UpdateProductoDto {
  nombre?: string
  descripcion?: string
  tipoProducto?: string
  categoria?: string
  presentacion?: string
  unidadMedida?: string
  precioUnitario?: number
  stockMinimo?: number
  stockActual?: number
  fechaVencimiento?: string
  laboratorio?: string
  registroInvima?: string
}

export interface ProductoResponseDto {
  id: number
  predioId: number
  codigo: string
  nombre: string | null
  descripcion: string | null
  tipoProducto: string | null
  categoria: string | null
  presentacion: string | null
  unidadMedida: string | null
  precioUnitario: number | null
  stockMinimo: number | null
  stockActual: number | null
  fechaVencimiento: string | null
  laboratorio: string | null
  registroInvima: string | null
  activo: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateProductoImagenDto {
  imagenId: number
}

export interface ProductoImagenResponseDto {
  id: number
  productoId: number
  imagenId: number
  activo: number
  createdAt: string | null
}
