// apps/web/src/modules/productos/types/producto.types.ts
/**
 * Producto types — veterinary product inventory management.
 *
 * Products include medications, supplements, and supplies.
 * Each product belongs to a predio and tracks stock levels.
 */

export interface Producto {
  id: number;
  predioId: number;
  nombre: string;
  descripcion?: string;
  tipoKey: number;           // 1=Medicamento, 2=Suplemento, 3=Insumo
  unidadMedida: string;      // 'ml', 'kg', 'dosis', 'unidad'
  precioUnitario?: number;
  stockActual: number;
  stockMinimo?: number;
  estadoKey: number;         // 1=Activo, 2=Inactivo
  fechaVencimiento?: string; // ISO date
  proveedorId?: number;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  tipoNombre?: string;
  proveedorNombre?: string;
}

export interface ProductoFilters {
  predioId: number;
  page: number;
  limit: number;
  search?: string;
  tipoKey?: number;
  estadoKey?: number;
}

export interface PaginatedProductos {
  data: Producto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type CreateProductoDto = Omit<Producto, 'id' | 'createdAt' | 'updatedAt' | 'tipoNombre' | 'proveedorNombre'>;

export type UpdateProductoDto = Partial<CreateProductoDto>;
