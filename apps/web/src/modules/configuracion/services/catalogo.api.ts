// apps/web/src/modules/configuracion/services/catalogo.api.ts
/**
 * Real Catalogo Service — production implementation using apiClient (ky).
 *
 * Routes: /config/{tipo} (matches backend endpoints)
 *
 * API Response: { success: true, data: CatalogoBase[], page, limit, total }
 */

import { apiClient } from '@/shared/lib/api-client';
import { ApiError } from '@/shared/lib/errors';
import type { CatalogoBase, CatalogoTipo, CreateCatalogoDto } from '../types/catalogo.types';
import type { CatalogoService } from './catalogo.service';

export class RealCatalogoService implements CatalogoService {
  async getAll(tipo: CatalogoTipo): Promise<CatalogoBase[]> {
    try {
      const response = await apiClient.get(`config/${tipo}`).json() as {
        success: boolean;
        data?: CatalogoBase[];
        page?: number;
        limit?: number;
        total?: number;
      };
      
      // Handle both paginated ({ success, data: [], page, limit, total }) and direct ({ data: [] }) formats
      const items = response.data;
      if (!items) {
        console.warn('[CatalogoAPI] No data in response:', response);
        return [];
      }
      return items;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('[CatalogoAPI] Error fetching catalog:', error);
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async create(tipo: CatalogoTipo, data: CreateCatalogoDto): Promise<CatalogoBase> {
    try {
      const wrapped = await apiClient.post(`config/${tipo}`, { json: data }).json() as { success: boolean; data: CatalogoBase };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async update(tipo: CatalogoTipo, id: number, data: Partial<CreateCatalogoDto>): Promise<CatalogoBase> {
    try {
      const wrapped = await apiClient.put(`config/${tipo}/${id}`, { json: data }).json() as { success: boolean; data: CatalogoBase };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async remove(tipo: CatalogoTipo, id: number): Promise<void> {
    try {
      await apiClient.delete(`config/${tipo}/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }
}
