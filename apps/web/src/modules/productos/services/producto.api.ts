// apps/web/src/modules/productos/services/producto.api.ts
/**
 * Real Producto Service — production API calls.
 *
 * All endpoints are relative to /api/v1/productos
 * Uses apiClient from @/shared/lib/api-client
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  PaginatedProductos,
  ProductoFilters,
} from '../types/producto.types';
import type { ProductoService } from './producto.service';

export class RealProductoService implements ProductoService {
  async getAll(filters: ProductoFilters): Promise<PaginatedProductos> {
    const params = new URLSearchParams();
    params.set('predio_id', String(filters.predioId));
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.tipoKey !== undefined) params.set('tipo_key', String(filters.tipoKey));
    if (filters.estadoKey !== undefined) params.set('estado_key', String(filters.estadoKey));

    const response = await apiClient.get(`productos?${params.toString()}`);
    return response.json() as Promise<PaginatedProductos>;
  }

  async getById(id: number): Promise<Producto> {
    const response = await apiClient.get(`productos/${id}`);
    return response.json() as Promise<Producto>;
  }

  async create(data: CreateProductoDto): Promise<Producto> {
    const response = await apiClient.post('productos', { json: data });
    return response.json() as Promise<Producto>;
  }

  async update(id: number, data: UpdateProductoDto): Promise<Producto> {
    const response = await apiClient.put(`productos/${id}`, { json: data });
    return response.json() as Promise<Producto>;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`productos/${id}`);
  }
}
