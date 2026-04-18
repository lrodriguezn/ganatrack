// apps/web/src/modules/animales/services/animal.api.ts
/**
 * Real Animal Service — production API calls.
 *
 * All endpoints are relative to /api/v1/animales
 * Uses apiClient from @/shared/lib/api-client
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  Animal,
  CreateAnimalDto,
  UpdateAnimalDto,
  AnimalEstadisticas,
  CambioEstadoDto,
  Genealogia,
  HistorialEvento,
  PaginatedAnimales,
  AnimalFilters,
} from '../types/animal.types';
import type { AnimalService } from './animal.service';

export class RealAnimalService implements AnimalService {
  async getAll(filters: AnimalFilters): Promise<PaginatedAnimales> {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.sexoKey !== undefined) params.set('sexoKey', String(filters.sexoKey));
    if (filters.estadoAnimalKey !== undefined) params.set('estado', String(filters.estadoAnimalKey));
    if (filters.potreroId !== undefined) params.set('potreroId', String(filters.potreroId));

    const response = await apiClient.get(`animales?${params.toString()}`);
    return response.json();
  }

  async getById(id: number): Promise<Animal> {
    const response = await apiClient.get(`animales/${id}`);
    const json = await response.json();
    // API returns { data: { animal } } - extract inner object
    return (json as any).data ?? json;
  }

  async create(data: CreateAnimalDto): Promise<Animal> {
    const response = await apiClient.post('animales', { json: data });
    return response.json();
  }

  async update(id: number, data: UpdateAnimalDto): Promise<Animal> {
    const response = await apiClient.put(`animales/${id}`, { json: data });
    return response.json();
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`animales/${id}`);
  }

  async cambiarEstado(id: number, data: CambioEstadoDto): Promise<Animal> {
    const response = await apiClient.patch(`animales/${id}/estado`, { json: data });
    return response.json();
  }

  async getGenealogia(id: number): Promise<Genealogia> {
    const response = await apiClient.get(`animales/${id}/genealogia`);
    return response.json();
  }

  async getHistorial(id: number, tipo: string): Promise<HistorialEvento[]> {
    const response = await apiClient.get(`animales/${id}/historial?tipo=${tipo}`);
    return response.json();
  }

  async getEstadisticas(predioId: number): Promise<AnimalEstadisticas> {
    const response = await apiClient.get(`animales/estadisticas?predioId=${predioId}`);
    return response.json();
  }
}