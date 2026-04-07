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
  async getAll(tipo: MaestroTipo): Promise<MaestroBase[]> {
    const endpoint = ENDPOINT_MAP[tipo];
    const response = await apiClient
      .get<PaginatedResponse<MaestroBase>>(endpoint)
      .json();

    return response.data;
  }

  /**
   * GET a single entity by ID
   */
  async getById(tipo: MaestroTipo, id: number): Promise<MaestroBase> {
    const endpoint = ENDPOINT_MAP[tipo];
    const response = await apiClient
      .get<ApiResponse<MaestroBase>>(`${endpoint}/${id}`)
      .json();

    return response.data;
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

    return response.data;
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

    return response.data;
  }

  /**
   * DELETE — soft delete an entity
   */
  async remove(tipo: MaestroTipo, id: number): Promise<void> {
    const endpoint = ENDPOINT_MAP[tipo];
    await apiClient.delete(`${endpoint}/${id}`);
  }
}
