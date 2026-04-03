// apps/web/src/modules/usuarios/services/usuarios.api.ts
/**
 * Real Usuarios Service — production API calls.
 *
 * All endpoints are relative to /api/v1/usuarios
 * Uses apiClient from @/shared/lib/api-client
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  PaginatedUsuarios,
  UsuarioFilters,
  Rol,
} from '../types/usuarios.types';
import type {
  PermisoMatrixState,
  BatchSavePermisosPayload,
} from '../types/roles.types';
import type { UsuariosService } from './usuarios.service';

export class RealUsuariosService implements UsuariosService {
  async getAll(filters: UsuarioFilters): Promise<PaginatedUsuarios> {
    const params = new URLSearchParams();
    params.set('predio_id', String(filters.predioId));
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.rolId !== undefined) params.set('rol_id', String(filters.rolId));
    if (filters.activo !== undefined) params.set('activo', String(filters.activo));

    const response = await apiClient.get(`usuarios?${params.toString()}`);
    return response.json();
  }

  async getById(id: number): Promise<Usuario> {
    const response = await apiClient.get(`usuarios/${id}`);
    return response.json();
  }

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const response = await apiClient.post('usuarios', { json: data });
    return response.json();
  }

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    const response = await apiClient.put(`usuarios/${id}`, { json: data });
    return response.json();
  }

  async deactivate(id: number): Promise<void> {
    await apiClient.delete(`usuarios/${id}`);
  }

  async activate(id: number): Promise<Usuario> {
    const response = await apiClient.patch(`usuarios/${id}/activate`);
    return response.json();
  }

  async getRoles(): Promise<Rol[]> {
    const response = await apiClient.get('roles');
    return response.json();
  }

  async getRolPermisos(rolId: number): Promise<PermisoMatrixState> {
    const response = await apiClient.get(`roles/${rolId}/permisos`);
    return response.json();
  }

  async updateRolPermisos(
    payload: BatchSavePermisosPayload,
  ): Promise<PermisoMatrixState> {
    const response = await apiClient.put(
      `roles/${payload.rolId}/permisos`,
      { json: payload },
    );
    return response.json();
  }
}
