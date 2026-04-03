// apps/web/src/modules/configuracion/services/catalogo.mock.ts
/**
 * Mock Catalogo Service — simulates catalogo API for development.
 *
 * Provides realistic Colombian livestock catalog data with 5-8 items per entity.
 * In-memory arrays support full CRUD operations.
 *
 * Simulated delays: 300ms for all operations.
 */

import { ApiError } from '@/shared/lib/errors';
import type { CatalogoBase, CatalogoTipo, CreateCatalogoDto } from '../types/catalogo.types';
import type { CatalogoService } from './catalogo.service';

// ============================================================================
// Seed Data — Colombian Livestock Catalogs
// ============================================================================

const SEED_RAZAS: CatalogoBase[] = [
  { id: 1, nombre: 'Brahman', codigo: 'BRH', descripcion: 'Raza cebuina de alta eficiencia tropical, adaptada a climas cálidos', activo: true },
  { id: 2, nombre: 'Holstein', codigo: 'HOL', descripcion: 'Raza lechera de mayor producción mundial', activo: true },
  { id: 3, nombre: 'Romosinuano', codigo: 'ROM', descripcion: 'Raza colombiana criolla de doble propósito', activo: true },
  { id: 4, nombre: 'Nelore', codigo: 'NEL', descripcion: 'Raza cebuina brasileña de alta rusticidad', activo: true },
  { id: 5, nombre: 'Simmental', codigo: 'SIM', descripcion: 'Raza suiza de doble propósito con alta ganancia de peso', activo: true },
  { id: 6, nombre: 'Gyr', codigo: 'GYR', descripcion: 'Raza lechera india adaptada a zonas tropicales', activo: true },
  { id: 7, nombre: 'Criollo', codigo: 'CRI', descripcion: 'Raza criolla colombiana de gran adaptación local', activo: false },
];

const SEED_CONDICIONES: CatalogoBase[] = [
  { id: 1, nombre: 'Muy Delgado', codigo: '1', descripcion: 'Costillas, espinazo y huesos pélvicos muy prominentes', activo: true },
  { id: 2, nombre: 'Delgado', codigo: '2', descripcion: 'Costillas visibles pero con algo de cobertura muscular', activo: true },
  { id: 3, nombre: 'Regular', codigo: '3', descripcion: 'Costillas no visibles a distancia, cobertura muscular moderada', activo: true },
  { id: 4, nombre: 'Bueno', codigo: '4', descripcion: 'Buen cobertura muscular, lomo ligeramente redondeado', activo: true },
  { id: 5, nombre: 'Muy Bueno', codigo: '5', descripcion: 'Excelente cobertura, lomo redondeado, suaves depósitos de grasa', activo: true },
  { id: 6, nombre: 'Gordo', codigo: '6', descripcion: 'Exceso de grasa, pliegues y depósitos notables', activo: true },
];

const SEED_TIPOS: CatalogoBase[] = [
  { id: 1, nombre: 'Ceba', codigo: 'CEB', descripcion: 'Engorde de bovinos para producción de carne', activo: true },
  { id: 2, nombre: 'Leche', codigo: 'LEC', descripcion: 'Explotación dirigida a la producción de leche', activo: true },
  { id: 3, nombre: 'Doble Propósito', codigo: 'DPR', descripcion: 'Explotación combinada de carne y leche', activo: true },
  { id: 4, nombre: 'Cría', codigo: 'CRA', descripcion: 'Producción de terneros como actividad principal', activo: true },
  { id: 5, nombre: 'Corte', codigo: 'COR', descripcion: 'Engorde intensivo para sacrificio temprano', activo: true },
];

const SEED_CALIDAD: CatalogoBase[] = [
  { id: 1, nombre: 'Baja', codigo: 'B', descripcion: 'Animales de menor conformación y rendimiento', activo: true },
  { id: 2, nombre: 'Media', codigo: 'M', descripcion: 'Animales de conformación y rendimiento promedio', activo: true },
  { id: 3, nombre: 'Alta', codigo: 'A', descripcion: 'Animales de buena conformación y alto rendimiento', activo: true },
  { id: 4, nombre: 'Premium', codigo: 'P', descripcion: 'Animales de excelente conformación, genética superior', activo: true },
];

const SEED_COLORES: CatalogoBase[] = [
  { id: 1, nombre: 'Negro', codigo: 'NEG', descripcion: 'Pelaje completamente negro', activo: true },
  { id: 2, nombre: 'Rojo', codigo: 'ROJ', descripcion: 'Pelaje color rojo/café', activo: true },
  { id: 3, nombre: 'Blanco', codigo: 'BLC', descripcion: 'Pelaje completamente blanco', activo: true },
  { id: 4, nombre: 'Bayo', codigo: 'BAY', descripcion: 'Pelaje color crema/amarillo claro', activo: true },
  { id: 5, nombre: 'Overo', codigo: 'OVR', descripcion: 'Manchas irregulares sobre base blanca', activo: true },
  { id: 6, nombre: 'Pinto', codigo: 'PIN', descripcion: 'Manchas grandes blancas sobre base oscura', activo: true },
  { id: 7, nombre: 'Cebú Negro', codigo: 'CN', descripcion: 'Pelaje negro característico de razas cebuinas', activo: true },
];

// ============================================================================
// In-Memory State
// ============================================================================

type DataStore = Record<CatalogoTipo, CatalogoBase[]>;

let store: DataStore = {
  razas: [...SEED_RAZAS],
  'condiciones-corporales': [...SEED_CONDICIONES],
  'tipos-explotacion': [...SEED_TIPOS],
  'calidad-animal': [...SEED_CALIDAD],
  colores: [...SEED_COLORES],
};

const idCounters: Record<CatalogoTipo, number> = {
  razas: Math.max(...SEED_RAZAS.map(v => v.id)) + 1,
  'condiciones-corporales': Math.max(...SEED_CONDICIONES.map(v => v.id)) + 1,
  'tipos-explotacion': Math.max(...SEED_TIPOS.map(v => v.id)) + 1,
  'calidad-animal': Math.max(...SEED_CALIDAD.map(v => v.id)) + 1,
  colores: Math.max(...SEED_COLORES.map(v => v.id)) + 1,
};

// ============================================================================
// Delay helper
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// MockCatalogoService
// ============================================================================

export class MockCatalogoService implements CatalogoService {
  async getAll(tipo: CatalogoTipo): Promise<CatalogoBase[]> {
    await delay(300);
    return [...store[tipo]];
  }

  async create(tipo: CatalogoTipo, data: CreateCatalogoDto): Promise<CatalogoBase> {
    await delay(300);
    const newItem: CatalogoBase = {
      id: idCounters[tipo]++,
      activo: true,
      ...data,
    };
    store[tipo].push(newItem);
    return { ...newItem };
  }

  async update(tipo: CatalogoTipo, id: number, data: Partial<CreateCatalogoDto>): Promise<CatalogoBase> {
    await delay(300);
    const items = store[tipo];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Registro con ID ${id} no encontrado`);
    }
    items[index] = { ...items[index], ...data };
    return { ...items[index] };
  }

  async remove(tipo: CatalogoTipo, id: number): Promise<void> {
    await delay(300);
    const items = store[tipo];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Registro con ID ${id} no encontrado`);
    }
    items.splice(index, 1);
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetCatalogoMock(): void {
  store = {
    razas: [...SEED_RAZAS],
    'condiciones-corporales': [...SEED_CONDICIONES],
    'tipos-explotacion': [...SEED_TIPOS],
    'calidad-animal': [...SEED_CALIDAD],
    colores: [...SEED_COLORES],
  };
  idCounters.razas = Math.max(...SEED_RAZAS.map(v => v.id)) + 1;
  idCounters['condiciones-corporales'] = Math.max(...SEED_CONDICIONES.map(v => v.id)) + 1;
  idCounters['tipos-explotacion'] = Math.max(...SEED_TIPOS.map(v => v.id)) + 1;
  idCounters['calidad-animal'] = Math.max(...SEED_CALIDAD.map(v => v.id)) + 1;
  idCounters.colores = Math.max(...SEED_COLORES.map(v => v.id)) + 1;
}
