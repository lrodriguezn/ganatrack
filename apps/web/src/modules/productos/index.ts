// apps/web/src/modules/productos/index.ts
/**
 * Producto Module — barrel export.
 */

// Types
export type {
  Producto,
  ProductoFilters,
  PaginatedProductos,
  CreateProductoDto,
  UpdateProductoDto,
} from './types/producto.types';

// Services
export { productoService } from './services';
export type { ProductoService } from './services';

// Hooks
export {
  useProductos,
  useProducto,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
  deleteProductoImperative,
} from './hooks';

// Components
export { ProductoTable } from './components/producto-table';
export { ProductoForm } from './components/producto-form';
export { ProductoDetail } from './components/producto-detail';
export { ProductoFilters } from './components/producto-filters';
