// apps/web/src/modules/configuracion/services/catalogo.api.ts
/**
 * Real Catalogo Service — production implementation using API client.
 *
 * Routes: /config/{tipo} (matches backend endpoints)
 */

import { apiClient } from '@/shared/lib/api-client';
import type { CatalogoBase, CatalogoTipo, CreateCatalogoDto } from '../types/catalogo.types';
import type { CatalogoService } from './catalogo.service';

export class RealCatalogoService implements CatalogoService {
  async getAll(tipo: CatalogoTipo): Promise<CatalogoBase[]> {
    return apiClient.get(`config/${tipo}`).json<CatalogoBase[]>();
  }

  async create(tipo: CatalogoTipo, data: CreateCatalogoDto): Promise<CatalogoBase> {
    return apiClient.post(`config/${tipo}`, { json: data }).json<CatalogoBase>();
  }

  async update(tipo: CatalogoTipo, id: number, data: Partial<CreateCatalogoDto>): Promise<CatalogoBase> {
    return apiClient.put(`config/${tipo}/${id}`, { json: data }).json<CatalogoBase>();
  }

  async remove(tipo: CatalogoTipo, id: number): Promise<void> {
    await apiClient.delete(`config/${tipo}/${id}`);
  }
}
