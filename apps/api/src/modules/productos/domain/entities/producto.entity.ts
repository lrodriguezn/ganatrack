/**
 * Producto entity
 * Veterinary product inventory item
 */
export interface ProductoEntity {
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
  fechaVencimiento: Date | null
  laboratorio: string | null
  registroInvima: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * ProductoImagen entity
 * Junction table for product-image relationship
 */
export interface ProductoImagenEntity {
  id: number
  productoId: number
  imagenId: number
  activo: number
  createdAt: Date | null
}
