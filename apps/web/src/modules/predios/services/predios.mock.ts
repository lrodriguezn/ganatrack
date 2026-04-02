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
    nombre: 'Finca La Esperanza',
    departamento: 'Antioquia',
    municipio: 'Medellín',
    vereda: 'El Carmen',
    hectares: 150.5,
    tipo: 'doble propósito',
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Hacienda El Roble',
    departamento: 'Cundinamarca',
    municipio: 'Bogotá',
    vereda: 'La Calera',
    hectares: 320.0,
    tipo: 'lechería',
    estado: 'activo',
  },
  {
    id: 3,
    nombre: 'Finca San José',
    departamento: 'Caldas',
    municipio: 'Manizales',
    vereda: 'La Reina',
    hectares: 85.3,
    tipo: 'cría',
    estado: 'activo',
  },
  {
    id: 4,
    nombre: 'Hacienda Santa María',
    departamento: 'Tolima',
    municipio: 'Ibagué',
    vereda: 'Coello',
    hectares: 450.0,
    tipo: 'engorde',
    estado: 'activo',
  },
  {
    id: 5,
    nombre: 'Finca El Porvenir',
    departamento: 'Santander',
    municipio: 'Bucaramanga',
    vereda: 'Rio Negro',
    hectares: 200.75,
    tipo: 'doble propósito',
    estado: 'inactivo',
  },
];

interface MockPotrero extends Omit<Potrero, 'id' | 'predioId'> {
  id: number;
  predioId: number;
}

const MOCK_POTREROS: MockPotrero[] = [
  // Predio 1 - Finca La Esperanza (150.5 has)
  { id: 1, predioId: 1, codigo: 'PE-01', nombre: 'Potrero Norte', hectares: 25.0, tipoPasto: 'Brachiaria Decumbens', capacidadMaxima: 50, estado: 'activo' },
  { id: 2, predioId: 1, codigo: 'PE-02', nombre: 'Potrero Sur', hectares: 20.5, tipoPasto: 'Guinea Panic', capacidadMaxima: 40, estado: 'activo' },
  { id: 3, predioId: 1, codigo: 'PE-03', nombre: 'Potrero Este', hectares: 18.0, tipoPasto: 'Brachiaria Decumbens', capacidadMaxima: 35, estado: 'en_descanso' },
  { id: 4, predioId: 1, codigo: 'PE-04', nombre: 'Potrero Oeste', hectares: 22.0, tipoPasto: 'Angleton', capacidadMaxima: 45, estado: 'activo' },
  { id: 5, predioId: 1, codigo: 'PE-05', nombre: 'Potrero Central', hectares: 30.0, tipoPasto: 'Brachiaria Hybrid', capacidadMaxima: 60, estado: 'activo' },
  { id: 6, predioId: 1, codigo: 'PE-06', nombre: 'Potrero Loma', hectares: 35.0, tipoPasto: 'Jaragua', capacidadMaxima: 70, estado: 'activo' },

  // Predio 2 - Hacienda El Roble (320 has)
  { id: 7, predioId: 2, codigo: 'HER-01', nombre: 'Sector A - Alta', hectares: 40.0, tipoPasto: 'Kikuyu', capacidadMaxima: 80, estado: 'activo' },
  { id: 8, predioId: 2, codigo: 'HER-02', nombre: 'Sector A - Baja', hectares: 45.0, tipoPasto: 'Kikuyu', capacidadMaxima: 90, estado: 'activo' },
  { id: 9, predioId: 2, codigo: 'HER-03', nombre: 'Sector B', hectares: 50.0, tipoPasto: 'Ryegrass', capacidadMaxima: 100, estado: 'en_descanso' },
  { id: 10,predioId: 2, codigo: 'HER-04', nombre: 'Sector C', hectares: 55.0, tipoPasto: 'Festuca', capacidadMaxima: 110, estado: 'activo' },
  { id: 11,predioId: 2, codigo: 'HER-05', nombre: 'Sector D', hectares: 60.0, tipoPasto: 'Bluegrass', capacidadMaxima: 120, estado: 'activo' },
  { id: 12,predioId: 2, codigo: 'HER-06', nombre: 'Potrero Loma', hectares: 70.0, tipoPasto: 'Kikuyu', capacidadMaxima: 140, estado: 'activo' },

  // Predio 3 - Finca San José (85.3 has)
  { id: 13,predioId: 3, codigo: 'FSJ-01', nombre: 'Alto', hectares: 20.0, tipoPasto: 'Brachiaria', capacidadMaxima: 40, estado: 'activo' },
  { id: 14,predioId: 3, codigo: 'FSJ-02', nombre: 'Medio', hectares: 25.0, tipoPasto: 'Guinea', capacidadMaxima: 50, estado: 'activo' },
  { id: 15,predioId: 3, codigo: 'FSJ-03', nombre: 'Bajo', hectares: 40.3, tipoPasto: 'Brachiaria', capacidadMaxima: 80, estado: 'en_descanso' },

  // Predio 4 - Hacienda Santa María (450 has)
  { id: 16,predioId: 4, codigo: 'HSM-01', nombre: 'Norte Grande', hectares: 75.0, tipoPasto: 'Angleton', capacidadMaxima: 150, estado: 'activo' },
  { id: 17,predioId: 4, codigo: 'HSM-02', nombre: 'Sur Grande', hectares: 80.0, tipoPasto: 'Brachiaria', capacidadMaxima: 160, estado: 'activo' },
  { id: 18,predioId: 4, codigo: 'HSM-03', nombre: 'Este', hectares: 70.0, tipoPasto: 'Guinea', capacidadMaxima: 140, estado: 'activo' },
  { id: 19,predioId: 4, codigo: 'HSM-04', nombre: 'Oeste', hectares: 65.0, tipoPasto: 'Brachiaria', capacidadMaxima: 130, estado: 'en_descanso' },
  { id: 20,predioId: 4, codigo: 'HSM-05', nombre: 'Central', hectares: 80.0, tipoPasto: 'Angleton', capacidadMaxima: 160, estado: 'activo' },
  { id: 21,predioId: 4, codigo: 'HSM-06', nombre: 'Loma', hectares: 80.0, tipoPasto: 'Jaragua', capacidadMaxima: 160, estado: 'activo' },

  // Predio 5 - Finca El Porvenir (200.75 has) - Inactivo
  { id: 22,predioId: 5, codigo: 'FEP-01', nombre: 'Principal', hectares: 100.0, tipoPasto: 'Brachiaria', capacidadMaxima: 200, estado: 'activo' },
  { id: 23,predioId: 5, codigo: 'FEP-02', nombre: 'Secundario', hectares: 100.75, tipoPasto: 'Guinea', capacidadMaxima: 200, estado: 'activo' },
];

interface MockLote extends Omit<Lote, 'id' | 'predioId'> {
  id: number;
  predioId: number;
}

const MOCK_LOTES: MockLote[] = [
  // Predio 1
  { id: 1, predioId: 1, nombre: 'Vacas en Producción', descripcion: 'Grupo de vacas actuales en ordeño', tipo: 'producción' },
  { id: 2, predioId: 1, nombre: 'Vacas Secas', descripcion: 'Vacas en período seco', tipo: 'cría' },
  { id: 3, predioId: 1, nombre: 'Levante', descripcion: 'Novillas de 12-18 meses', tipo: 'levante' },
  { id: 4, predioId: 1, nombre: 'Engorde', descripcion: 'Animales en finalización', tipo: 'engorde' },

  // Predio 2
  { id: 5, predioId: 2, nombre: 'Producción Alta', descripcion: 'Vacas con producción mayor a 20L/día', tipo: 'producción' },
  { id: 6, predioId: 2, nombre: 'Producción Media', descripcion: 'Vacas con producción 10-20L/día', tipo: 'producción' },
  { id: 7, predioId: 2, nombre: 'Producción Baja', descripcion: 'Vacas con producción menor a 10L/día', tipo: 'producción' },
  { id: 8, predioId: 2, nombre: 'Gestantes', descripcion: 'Vacas preñadas', tipo: 'cría' },

  // Predio 3
  { id: 9,  predioId: 3, nombre: 'Madres con Cría', descripcion: 'Vacas con terneros al pie', tipo: 'cría' },
  { id: 10,predioId: 3, nombre: 'Destete Reciente', descripcion: 'Terneros recién destetados', tipo: 'levante' },

  // Predio 4
  { id: 11,predioId: 4, nombre: 'Engorde 1', descripcion: 'Lote de engorde fase 1', tipo: 'engorde' },
  { id: 12,predioId: 4, nombre: 'Engorde 2', descripcion: 'Lote de engorde fase 2', tipo: 'engorde' },
  { id: 13,predioId: 4, nombre: 'Engorde 3', descripcion: 'Lote de engorde fase 3 - Finalización', tipo: 'engorde' },

  // Predio 5
  { id: 14,predioId: 5, nombre: 'Producción', descripcion: 'Vacas en producción', tipo: 'producción' },
  { id: 15,predioId: 5, nombre: 'Levante', descripcion: 'Novillas en crecimiento', tipo: 'levante' },
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
  { id: 1,  predioId: 1, codigo: 'SEC-PE-01', nombre: 'Zona Norte', hectares: 50.0, tipoPasto: 'Brachiaria Decumbens', capacidadMaxima: 100, estado: 'activo' },
  { id: 2,  predioId: 1, codigo: 'SEC-PE-02', nombre: 'Zona Sur', hectares: 45.5, tipoPasto: 'Guinea Panic', capacidadMaxima: 90, estado: 'activo' },
  { id: 3,  predioId: 1, codigo: 'SEC-PE-03', nombre: 'Zona Centro', hectares: 55.0, tipoPasto: 'Brachiaria Hybrid', capacidadMaxima: 110, estado: 'en_descanso' },

  // Predio 2 - Hacienda El Roble
  { id: 4,  predioId: 2, codigo: 'SEC-HER-01', nombre: 'Sector Alta Montana', hectares: 120.0, tipoPasto: 'Kikuyu', capacidadMaxima: 240, estado: 'activo' },
  { id: 5,  predioId: 2, codigo: 'SEC-HER-02', nombre: 'Sector Baja Montana', hectares: 100.0, tipoPasto: 'Ryegrass', capacidadMaxima: 200, estado: 'activo' },
  { id: 6,  predioId: 2, codigo: 'SEC-HER-03', nombre: 'Sector Valle', hectares: 100.0, tipoPasto: 'Bluegrass', capacidadMaxima: 200, estado: 'activo' },

  // Predio 3 - Finca San José
  { id: 7,  predioId: 3, codigo: 'SEC-FSJ-01', nombre: 'Altiplano', hectares: 40.0, tipoPasto: 'Brachiaria', capacidadMaxima: 80, estado: 'activo' },
  { id: 8,  predioId: 3, codigo: 'SEC-FSJ-02', nombre: ' Bajio', hectares: 45.3, tipoPasto: 'Guinea', capacidadMaxima: 90, estado: 'en_descanso' },

  // Predio 4 - Hacienda Santa María
  { id: 9,  predioId: 4, codigo: 'SEC-HSM-01', nombre: 'Norte Extensive', hectares: 150.0, tipoPasto: 'Angleton', capacidadMaxima: 300, estado: 'activo' },
  { id: 10, predioId: 4, codigo: 'SEC-HSM-02', nombre: 'Sur Extensive', hectares: 150.0, tipoPasto: 'Brachiaria', capacidadMaxima: 300, estado: 'activo' },
  { id: 11,predioId: 4, codigo: 'SEC-HSM-03', nombre: 'Centro Intensivo', hectares: 150.0, tipoPasto: 'Guinea', capacidadMaxima: 300, estado: 'activo' },

  // Predio 5 - Finca El Porvenir (Inactivo)
  { id: 12,predioId: 5, codigo: 'SEC-FEP-01', nombre: 'Principal Norte', hectares: 100.0, tipoPasto: 'Brachiaria', capacidadMaxima: 200, estado: 'activo' },
  { id: 13,predioId: 5, codigo: 'SEC-FEP-02', nombre: 'Principal Sur', hectares: 100.75, tipoPasto: 'Guinea', capacidadMaxima: 200, estado: 'activo' },
];

// ============================================================================
// In-Memory State (mutable for CRUD operations)
// ============================================================================

// Clone seed data to avoid mutations affecting the original
let predios: MockPredio[] = [...MOCK_PREDIOS];
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
      estado: 'activo',
    };
    predios.push(newPredio);
    return { ...newPredio };
  }

  async updatePredio(id: number, data: UpdatePredioDto): Promise<Predio> {
    await randomDelay();
    const index = predios.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Predio con ID ${id} no encontrado`);
    }
    predios[index] = { ...predios[index], ...data };
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
      estado: data.estado ?? 'activo',
    };
    potreros.push(newPotrero);
    return { ...newPotrero };
  }

  async updatePotrero(predioId: number, id: number, data: UpdatePotreroDto): Promise<Potrero> {
    await randomDelay();
    const index = potreros.findIndex(p => p.predioId === predioId && p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Potrero con ID ${id} no encontrado`);
    }
    potreros[index] = { ...potreros[index], ...data };
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
    lotes[index] = { ...lotes[index], ...data };
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
    grupos[index] = { ...grupos[index], ...data };
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
      estado: data.estado ?? 'activo',
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
    sectores[index] = { ...sectores[index], ...data };
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
