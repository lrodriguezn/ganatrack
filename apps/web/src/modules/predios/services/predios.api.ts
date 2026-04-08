// apps/web/src/modules/predios/services/predios.api.ts
/**
 * Real Predios Service — production implementation using apiClient (ky).
 *
 * Wraps the API endpoints:
 * - GET  /predios           → getPredios()
 * - GET  /predios/:id       → getPredio()
 * - POST /predios           → createPredio()
 * - PUT  /predios/:id       → updatePredio()
 * - DELETE /predios/:id     → deletePredio()
 *
 * Potreros, Lotes, Grupos, Sectores CRUD under each Predio.
 *
 * All responses are parsed through Zod schemas from shared-types
 * to enforce the API contract.
 */

import { apiClient } from '@/shared/lib/api-client';
import { ApiError } from '@/shared/lib/errors';
import type {
  Predio,
  CreatePredioDto,
  UpdatePredioDto,
  Potrero,
  CreatePotreroDto,
  UpdatePotreroDto,
  Lote,
  CreateLoteDto,
  UpdateLoteDto,
  Grupo,
  CreateGrupoDto,
  UpdateGrupoDto,
  Sector,
  CreateSectorDto,
  UpdateSectorDto,
} from '@ganatrack/shared-types';
import type { PrediosService } from './predios.service';

export class RealPrediosService implements PrediosService {
  // ==========================================================================
  // Predios CRUD
  // ==========================================================================

  async getPredios(): Promise<Predio[]> {
    try {
      const wrapped = await apiClient.get('predios').json() as { success: boolean; data: Predio[] };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getPredio(id: number): Promise<Predio> {
    try {
      const wrapped = await apiClient.get(`predios/${id}`).json() as { success: boolean; data: Predio };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async createPredio(data: CreatePredioDto): Promise<Predio> {
    try {
      const wrapped = await apiClient.post('predios', { json: data }).json() as { success: boolean; data: Predio };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async updatePredio(id: number, data: UpdatePredioDto): Promise<Predio> {
    try {
      const wrapped = await apiClient.put(`predios/${id}`, { json: data }).json() as { success: boolean; data: Predio };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async deletePredio(id: number): Promise<void> {
    try {
      await apiClient.delete(`predios/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  // ==========================================================================
  // Potreros CRUD
  // ==========================================================================

  async getPotreros(predioId: number): Promise<Potrero[]> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/potreros`).json() as { success: boolean; data: Potrero[] };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getPotrero(predioId: number, id: number): Promise<Potrero> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/potreros/${id}`).json() as { success: boolean; data: Potrero };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async createPotrero(predioId: number, data: CreatePotreroDto): Promise<Potrero> {
    try {
      const wrapped = await apiClient
        .post(`predios/${predioId}/potreros`, { json: data })
        .json() as { success: boolean; data: Potrero };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async updatePotrero(predioId: number, id: number, data: UpdatePotreroDto): Promise<Potrero> {
    try {
      const wrapped = await apiClient
        .put(`predios/${predioId}/potreros/${id}`, { json: data })
        .json() as { success: boolean; data: Potrero };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async deletePotrero(predioId: number, id: number): Promise<void> {
    try {
      await apiClient.delete(`predios/${predioId}/potreros/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  // ==========================================================================
  // Lotes CRUD
  // ==========================================================================

  async getLotes(predioId: number): Promise<Lote[]> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/lotes`).json() as { success: boolean; data: Lote[] };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getLote(predioId: number, id: number): Promise<Lote> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/lotes/${id}`).json() as { success: boolean; data: Lote };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async createLote(predioId: number, data: CreateLoteDto): Promise<Lote> {
    try {
      const wrapped = await apiClient
        .post(`predios/${predioId}/lotes`, { json: data })
        .json() as { success: boolean; data: Lote };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async updateLote(predioId: number, id: number, data: UpdateLoteDto): Promise<Lote> {
    try {
      const wrapped = await apiClient
        .put(`predios/${predioId}/lotes/${id}`, { json: data })
        .json() as { success: boolean; data: Lote };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async deleteLote(predioId: number, id: number): Promise<void> {
    try {
      await apiClient.delete(`predios/${predioId}/lotes/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  // ==========================================================================
  // Grupos CRUD
  // ==========================================================================

  async getGrupos(predioId: number): Promise<Grupo[]> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/grupos`).json() as { success: boolean; data: Grupo[] };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getGrupo(predioId: number, id: number): Promise<Grupo> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/grupos/${id}`).json() as { success: boolean; data: Grupo };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async createGrupo(predioId: number, data: CreateGrupoDto): Promise<Grupo> {
    try {
      const wrapped = await apiClient
        .post(`predios/${predioId}/grupos`, { json: data })
        .json() as { success: boolean; data: Grupo };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async updateGrupo(predioId: number, id: number, data: UpdateGrupoDto): Promise<Grupo> {
    try {
      const wrapped = await apiClient
        .put(`predios/${predioId}/grupos/${id}`, { json: data })
        .json() as { success: boolean; data: Grupo };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async deleteGrupo(predioId: number, id: number): Promise<void> {
    try {
      await apiClient.delete(`predios/${predioId}/grupos/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  // ==========================================================================
  // Sectores CRUD
  // ==========================================================================

  async getSectores(predioId: number): Promise<Sector[]> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/sectores`).json() as { success: boolean; data: Sector[] };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getSector(predioId: number, id: number): Promise<Sector> {
    try {
      const wrapped = await apiClient.get(`predios/${predioId}/sectores/${id}`).json() as { success: boolean; data: Sector };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async createSector(predioId: number, data: CreateSectorDto): Promise<Sector> {
    try {
      const wrapped = await apiClient
        .post(`predios/${predioId}/sectores`, { json: data })
        .json() as { success: boolean; data: Sector };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async updateSector(predioId: number, id: number, data: UpdateSectorDto): Promise<Sector> {
    try {
      const wrapped = await apiClient
        .put(`predios/${predioId}/sectores/${id}`, { json: data })
        .json() as { success: boolean; data: Sector };
      return wrapped.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async deleteSector(predioId: number, id: number): Promise<void> {
    try {
      await apiClient.delete(`predios/${predioId}/sectores/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }
}
