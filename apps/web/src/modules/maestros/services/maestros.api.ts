// apps/web/src/modules/maestros/services/maestros.api.ts
/**
 * Real Maestros Service — production implementation.
 *
 * Connects to the backend API endpoints for all 8 maestro entities.
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  CreateMaestroDto,
  MaestroBase,
  MaestroTipo,
} from '../types/maestro.types';
import { parseActivo } from '../types/maestro.types';
import type { MaestrosService } from './maestros.service';

// ============================================================================
// Endpoint mapping — maps MaestroTipo to API path
// ============================================================================

const ENDPOINT_MAP: Record<MaestroTipo, string> = {
  veterinarios: '/veterinarios',
  propietarios: '/propietarios',
  hierros: '/hierros',
  diagnosticos: '/diagnosticos',
  'motivos-ventas': '/motivos-ventas',
  'causas-muerte': '/causas-muerte',
  'lugares-compras': '/lugares-compras',
  'lugares-ventas': '/lugares-ventas',
};

// ============================================================================
// Response types matching backend response format
// ============================================================================

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================================
// RealMaestrosService Implementation
// ============================================================================

export class RealMaestrosService implements MaestrosService {
  /**
   * GET all entities of a given tipo
   * Supports pagination and search
   */
  async getAll(
    tipo: MaestroTipo,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<{ data: MaestroBase[]; meta: { page: number; limit: number; total: number } }> {
    const endpoint = ENDPOINT_MAP[tipo];
    const response = await apiClient
      .get<PaginatedResponse<MaestroBase>>(endpoint, {
        searchParams: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.search ? { search: params.search } : {}),
        },
      })
      .json();

    if (!response.success) {
      throw new Error('La solicitud falló');
    }

    // Transform activo from number (backend) to boolean (frontend)
    const transformedData = response.data.map((item) => ({
      ...item,
      activo: parseActivo(item.activo),
    }));

    return { data: transformedData, meta: response.meta };
  }

  /**
   * GET a single entity by ID
   */
  async getById(tipo: MaestroTipo, id: number): Promise<MaestroBase> {
    const endpoint = ENDPOINT_MAP[tipo];
    const response = await apiClient
      .get<ApiResponse<MaestroBase>>(`${endpoint}/${id}`)
      .json();

    return { ...response.data, activo: parseActivo(response.data.activo) };
  }

  /**
   * POST — create a new entity
   */
  async create(tipo: MaestroTipo, data: CreateMaestroDto): Promise<MaestroBase> {
    const endpoint = ENDPOINT_MAP[tipo];
    const response = await apiClient
      .post<ApiResponse<MaestroBase>>(endpoint, {
        json: data,
      })
      .json();

    return { ...response.data, activo: parseActivo(response.data.activo) };
  }

  /**
   * PUT — update an existing entity
   */
  async update(
    tipo: MaestroTipo,
    id: number,
    data: Partial<CreateMaestroDto>,
  ): Promise<MaestroBase> {
    const endpoint = ENDPOINT_MAP[tipo];
    const response = await apiClient
      .put<ApiResponse<MaestroBase>>(`${endpoint}/${id}`, {
        json: data,
      })
      .json();

    return { ...response.data, activo: parseActivo(response.data.activo) };
  }

  /**
   * DELETE — soft delete an entity
   */
  async remove(tipo: MaestroTipo, id: number): Promise<void> {
    const endpoint = ENDPOINT_MAP[tipo];
    await apiClient.delete(`${endpoint}/${id}`);
  }
}
