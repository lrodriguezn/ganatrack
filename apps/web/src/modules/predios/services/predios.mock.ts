// apps/web/src/modules/predios/services/predios.mock.ts
/**
 * Mock Predios Service — simulates predios API for development.
 *
 * Provides realistic Colombian cattle farm data with:
 * - 5 predios across different departments
 * - Multiple potreros per predio (rotational grazing)
 * - Lotes for different production stages
 * - Grupos for custom animal groupings
 * - Sectores for administrative divisions
 *
 * Simulated delays: 300-500ms for all operations.
 */

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
import { ApiError } from '@/shared/lib/errors';
import type { PrediosService } from './predios.service';

// ============================================================================
// Seed Data — Colombian Cattle Farms
// ============================================================================

interface MockPredio extends Omit<Predio, 'id'> {
  id: number;
}

const MOCK_PREDIOS: MockPredio[] = [
  {
    id: 1,
    codigo: 'FLE', nombre: 'Finca La Esperanza',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    vereda: 'El Carmen',
    areaHectareas: 150.5,
  },
  {
    id: 2,
    codigo: 'HER', nombre: 'Hacienda El Roble',
    departamento: 'Cundinamarca',
    municipio: 'Bogotá',
    vereda: 'La Calera',
    areaHectareas: 320.0,
  },
  {
    id: 3,
    codigo: 'FSJ', nombre: 'Finca San José',
    departamento: 'Caldas',
    municipio: 'Manizales',
    vereda: 'La Reina',
    areaHectareas: 85.3,
  },
  {
    id: 4,
    codigo: 'HSM', nombre: 'Hacienda Santa María',
    departamento: 'Tolima',
    municipio: 'Ibagué',
    vereda: 'Coello',
    areaHectareas: 450.0,
  },
  {
    id: 5,
    codigo: 'FEP', nombre: 'Finca El Porvenir',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    vereda: 'Rio Negro',
    areaHectareas: 200.75,
  },
];

interface MockPotrero extends Omit<Potrero, 'id' | 'predioId'> {
  id: number;
  predioId: number;
}

const MOCK_POTREROS: MockPotrero[] = [
  // Predio 1 - Finca La Esperanza (150.5 has)

  // Predio 2 - Hacienda El Roble (320 has)

  // Predio 3 - Finca San José (85.3 has)

  // Predio 4 - Hacienda Santa María (450 has)

  // Predio 5 - Finca El Porvenir (200.75 has) - Inactivo
];

interface MockLote extends Omit<Lote, 'id' | 'predioId'> {
  id: number;
  predioId: number;
}

const MOCK_LOTES: MockLote[] = [
  // Predio 1

  // Predio 2

  // Predio 3

  // Predio 4

  // Predio 5
];

interface MockGrupo extends Omit<Grupo, 'id' | 'predioId'> {
  id: number;
  predioId: number;
}

const MOCK_GRUPOS: MockGrupo[] = [
  // Predio 1
  { id: 1,  predioId: 1, nombre: 'Vacas VIP', descripcion: 'Mejores productoras del hato', animalCount: 15 },
  { id: 2,  predioId: 1, nombre: 'Primerizas', descripcion: 'Vacas de primer parto', animalCount: 8 },
  { id: 3,  predioId: 1, nombre: 'Problema', descripcion: 'Animales con problemas de salud', animalCount: 3 },

  // Predio 2
  { id: 4,  predioId: 2, nombre: 'Exportación', descripcion: 'Lote para sacrificio con certificación', animalCount: 45 },
  { id: 5,  predioId: 2, nombre: 'Reproducción', descripcion: 'Vacas y toros para reproducción', animalCount: 25 },

  // Predio 3
  { id: 6,  predioId: 3, nombre: 'Terneros Machos', descripcion: 'Machos destinados for engorde', animalCount: 12 },
  { id: 7,  predioId: 3, nombre: 'Terneras Hembras', descripcion: 'Hembras para reemplazo', animalCount: 10 },

  // Predio 4
  { id: 8,  predioId: 4, nombre: 'Suplementación Especial', descripcion: 'Animales con dieta especial', animalCount: 30 },
  { id: 9,  predioId: 4, nombre: 'Listos para Sacrificio', descripcion: 'Animales en peso óptimo', animalCount: 50 },

  // Predio 5
  { id: 10,predioId: 5, nombre: 'General', descripcion: 'Grupo principal', animalCount: 20 },
];

interface MockSector extends Omit<Sector, 'id' | 'predioId'> {
  id: number;
  predioId: number;
}

const MOCK_SECTORES: MockSector[] = [
  // Predio 1 - Finca La Esperanza

  // Predio 2 - Hacienda El Roble

  // Predio 3 - Finca San José

  // Predio 4 - Hacienda Santa María

  // Predio 5 - Finca El Porvenir (Inactivo)
];

// ============================================================================
// In-Memory State (mutable for CRUD operations)
// ============================================================================

// Clone seed data to avoid mutations affecting the original
const predios: MockPredio[] = [...MOCK_PREDIOS];
let potreros: MockPotrero[] = [...MOCK_POTREROS];
let lotes: MockLote[] = [...MOCK_LOTES];
let grupos: MockGrupo[] = [...MOCK_GRUPOS];
let sectores: MockSector[] = [...MOCK_SECTORES];

// ID counters for new entities
let nextPredioId = Math.max(...MOCK_PREDIOS.map(p => p.id)) + 1;
let nextPotreroId = Math.max(...MOCK_POTREROS.map(p => p.id)) + 1;
let nextLoteId = Math.max(...MOCK_LOTES.map(l => l.id)) + 1;
let nextGrupoId = Math.max(...MOCK_GRUPOS.map(g => g.id)) + 1;
let nextSectorId = Math.max(...MOCK_SECTORES.map(s => s.id)) + 1;

// ============================================================================
// Delays
// ============================================================================

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = () => delay(300 + Math.random() * 200); // 300-500ms

// ============================================================================
// MockPrediosService
// ============================================================================

export class MockPrediosService implements PrediosService {
  // ==========================================================================
  // Predios CRUD
  // ==========================================================================

  async getPredios(): Promise<Predio[]> {
    await randomDelay();
    return [...predios];
  }

  async getPredio(id: number): Promise<Predio> {
    await randomDelay();
    const fundo = predios.find(p => p.id === id);
    if (!fundo) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${id} no encontrado`);
    }
    return { ...fundo };
  }

  async createPredio(data: CreatePredioDto): Promise<Predio> {
    await randomDelay();
    const newPredio: MockPredio = {
      id: nextPredioId++,
      ...data,
    } as MockPredio;
    predios.push(newPredio);
    return { ...newPredio };
  }

  async updatePredio(id: number, data: UpdatePredioDto): Promise<Predio> {
    await randomDelay();
    const index = predios.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${id} no encontrado`);
    }
    predios[index] = { ...predios[index], ...data } as MockPredio;
    return { ...predios[index] };
  }

  async deletePredio(id: number): Promise<void> {
    await randomDelay();
    const index = predios.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${id} no encontrado`);
    }
    predios.splice(index, 1);
    // Also delete related sub-recursos
    potreros = potreros.filter(p => p.predioId !== id);
    lotes = lotes.filter(l => l.predioId !== id);
    grupos = grupos.filter(g => g.predioId !== id);
    sectores = sectores.filter(s => s.predioId !== id);
  }

  // ==========================================================================
  // Potreros CRUD
  // ==========================================================================

  async getPotreros(predioId: number): Promise<Potrero[]> {
    await randomDelay();
    return potreros.filter(p => p.predioId === predioId).map(p => ({ ...p }));
  }

  async getPotrero(predioId: number, id: number): Promise<Potrero> {
    await randomDelay();
    const potrero = potreros.find(p => p.predioId === predioId && p.id === id);
    if (!potrero) {
      throw new ApiError(404, 'NOT_FOUND', `Potrero con ID ${id} no encontrado`);
    }
    return { ...potrero };
  }

  async createPotrero(predioId: number, data: CreatePotreroDto): Promise<Potrero> {
    await randomDelay();
    // Verify fundo exists
    if (!predios.some(p => p.id === predioId)) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${predioId} no encontrado`);
    }
    const newPotrero: MockPotrero = {
      id: nextPotreroId++,
      predioId,
      ...data,
    } as MockPotrero;
    potreros.push(newPotrero);
    return { ...newPotrero };
  }

  async updatePotrero(predioId: number, id: number, data: UpdatePotreroDto): Promise<Potrero> {
    await randomDelay();
    const index = potreros.findIndex(p => p.predioId === predioId && p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Potrero con ID ${id} no encontrado`);
    }
    potreros[index] = { ...potreros[index], ...data } as MockPotrero;
    return { ...potreros[index] };
  }

  async deletePotrero(predioId: number, id: number): Promise<void> {
    await randomDelay();
    const index = potreros.findIndex(p => p.predioId === predioId && p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Potrero con ID ${id} no encontrado`);
    }
    potreros.splice(index, 1);
  }

  // ==========================================================================
  // Lotes CRUD
  // ==========================================================================

  async getLotes(predioId: number): Promise<Lote[]> {
    await randomDelay();
    return lotes.filter(l => l.predioId === predioId).map(l => ({ ...l }));
  }

  async getLote(predioId: number, id: number): Promise<Lote> {
    await randomDelay();
    const lote = lotes.find(l => l.predioId === predioId && l.id === id);
    if (!lote) {
      throw new ApiError(404, 'NOT_FOUND', `Lote con ID ${id} no encontrado`);
    }
    return { ...lote };
  }

  async createLote(predioId: number, data: CreateLoteDto): Promise<Lote> {
    await randomDelay();
    if (!predios.some(p => p.id === predioId)) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${predioId} no encontrado`);
    }
    const newLote: MockLote = {
      id: nextLoteId++,
      predioId,
      ...data,
    };
    lotes.push(newLote);
    return { ...newLote };
  }

  async updateLote(predioId: number, id: number, data: UpdateLoteDto): Promise<Lote> {
    await randomDelay();
    const index = lotes.findIndex(l => l.predioId === predioId && l.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Lote con ID ${id} no encontrado`);
    }
    lotes[index] = { ...lotes[index], ...data } as MockLote;
    return { ...lotes[index] };
  }

  async deleteLote(predioId: number, id: number): Promise<void> {
    await randomDelay();
    const index = lotes.findIndex(l => l.predioId === predioId && l.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Lote con ID ${id} no encontrado`);
    }
    lotes.splice(index, 1);
  }

  // ==========================================================================
  // Grupos CRUD
  // ==========================================================================

  async getGrupos(predioId: number): Promise<Grupo[]> {
    await randomDelay();
    return grupos.filter(g => g.predioId === predioId).map(g => ({ ...g }));
  }

  async getGrupo(predioId: number, id: number): Promise<Grupo> {
    await randomDelay();
    const grupo = grupos.find(g => g.predioId === predioId && g.id === id);
    if (!grupo) {
      throw new ApiError(404, 'NOT_FOUND', `Grupo con ID ${id} no encontrado`);
    }
    return { ...grupo };
  }

  async createGrupo(predioId: number, data: CreateGrupoDto): Promise<Grupo> {
    await randomDelay();
    if (!predios.some(p => p.id === predioId)) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${predioId} no encontrado`);
    }
    const newGrupo: MockGrupo = {
      id: nextGrupoId++,
      predioId,
      ...data,
      animalCount: 0,
    };
    grupos.push(newGrupo);
    return { ...newGrupo };
  }

  async updateGrupo(predioId: number, id: number, data: UpdateGrupoDto): Promise<Grupo> {
    await randomDelay();
    const index = grupos.findIndex(g => g.predioId === predioId && g.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Grupo con ID ${id} no encontrado`);
    }
    grupos[index] = { ...grupos[index], ...data } as MockGrupo;
    return { ...grupos[index] };
  }

  async deleteGrupo(predioId: number, id: number): Promise<void> {
    await randomDelay();
    const index = grupos.findIndex(g => g.predioId === predioId && g.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Grupo con ID ${id} no encontrado`);
    }
    grupos.splice(index, 1);
  }

  // ==========================================================================
  // Sectores CRUD
  // ==========================================================================

  async getSectores(predioId: number): Promise<Sector[]> {
    await randomDelay();
    return sectores.filter(s => s.predioId === predioId).map(s => ({ ...s }));
  }

  async getSector(predioId: number, id: number): Promise<Sector> {
    await randomDelay();
    const sector = sectores.find(s => s.predioId === predioId && s.id === id);
    if (!sector) {
      throw new ApiError(404, 'NOT_FOUND', `Sector con ID ${id} no encontrado`);
    }
    return { ...sector };
  }

  async createSector(predioId: number, data: CreateSectorDto): Promise<Sector> {
    await randomDelay();
    if (!predios.some(p => p.id === predioId)) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${predioId} no encontrado`);
    }
    const newSector: MockSector = {
      id: nextSectorId++,
      predioId,
      ...data,
    };
    sectores.push(newSector);
    return { ...newSector };
  }

  async updateSector(predioId: number, id: number, data: UpdateSectorDto): Promise<Sector> {
    await randomDelay();
    const index = sectores.findIndex(s => s.predioId === predioId && s.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Sector con ID ${id} no encontrado`);
    }
    sectores[index] = { ...sectores[index], ...data } as MockSector;
    return { ...sectores[index] };
  }

  async deleteSector(predioId: number, id: number): Promise<void> {
    await randomDelay();
    const index = sectores.findIndex(s => s.predioId === predioId && s.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Sector con ID ${id} no encontrado`);
    }
    sectores.splice(index, 1);
  }
}
