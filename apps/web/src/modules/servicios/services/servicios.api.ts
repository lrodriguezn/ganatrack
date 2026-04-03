// apps/web/src/modules/servicios/services/servicios.api.ts
/**
 * Real Servicios Service — production API calls.
 *
 * All endpoints are relative to /api/v1/servicios
 * Uses apiClient from @/shared/lib/api-client
 */

import { apiClient } from '@/shared/lib/api-client';
import type {
  PalpacionEvento,
  CreatePalpacionEventoDto,
  InseminacionEvento,
  CreateInseminacionEventoDto,
  Parto,
  CreatePartoDto,
  PaginationParams,
  PaginatedEventos,
} from '../types/servicios.types';
import type { ServiciosService } from './servicios.service';

export class RealServiciosService implements ServiciosService {
  // Palpaciones
  async getPalpaciones(params: PaginationParams): Promise<PaginatedEventos<PalpacionEvento>> {
    const searchParams = new URLSearchParams();
    searchParams.set('predioId', String(params.predioId));
    searchParams.set('page', String(params.page));
    searchParams.set('limit', String(params.limit));
    const response = await apiClient.get(`servicios/palpaciones?${searchParams.toString()}`);
    return response.json();
  }

  async getPalpacionById(id: number): Promise<PalpacionEvento> {
    const response = await apiClient.get(`servicios/palpaciones/${id}`);
    return response.json();
  }

  async createPalpacion(data: CreatePalpacionEventoDto): Promise<PalpacionEvento> {
    const response = await apiClient.post('servicios/palpaciones', { json: data });
    return response.json();
  }

  // Inseminaciones
  async getInseminaciones(params: PaginationParams): Promise<PaginatedEventos<InseminacionEvento>> {
    const searchParams = new URLSearchParams();
    searchParams.set('predioId', String(params.predioId));
    searchParams.set('page', String(params.page));
    searchParams.set('limit', String(params.limit));
    const response = await apiClient.get(`servicios/inseminaciones?${searchParams.toString()}`);
    return response.json();
  }

  async getInseminacionById(id: number): Promise<InseminacionEvento> {
    const response = await apiClient.get(`servicios/inseminaciones/${id}`);
    return response.json();
  }

  async createInseminacion(data: CreateInseminacionEventoDto): Promise<InseminacionEvento> {
    const response = await apiClient.post('servicios/inseminaciones', { json: data });
    return response.json();
  }

  // Partos
  async getPartos(params: PaginationParams): Promise<PaginatedEventos<Parto>> {
    const searchParams = new URLSearchParams();
    searchParams.set('predioId', String(params.predioId));
    searchParams.set('page', String(params.page));
    searchParams.set('limit', String(params.limit));
    const response = await apiClient.get(`servicios/partos?${searchParams.toString()}`);
    return response.json();
  }

  async getPartoById(id: number): Promise<Parto> {
    const response = await apiClient.get(`servicios/partos/${id}`);
    return response.json();
  }

  async createParto(data: CreatePartoDto): Promise<Parto> {
    const response = await apiClient.post('servicios/partos', { json: data });
    return response.json();
  }
}
