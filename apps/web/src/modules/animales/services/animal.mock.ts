// apps/web/src/modules/animales/services/animal.mock.ts
/**
 * Mock Animal Service — simulates API for development.
 *
 * Provides 25 realistic Colombian cattle animals with full CRUD + pagination.
 * In-memory store supports all operations.
 * Simulated delay: 300ms.
 */

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
import { ApiError } from '@/shared/lib/errors';

// ============================================================================
// Seed Data — 25 realistic Colombian cattle
// ============================================================================

const SEED_ANIMALS: Animal[] = [
  // Machos (15)
  {
    id: 1, predioId: 1, codigo: 'GAN-001', nombre: 'Don Toro', fechaNacimiento: '2020-03-15',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: 1,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Norte',
  },
  {
    id: 2, predioId: 1, codigo: 'GAN-002', nombre: 'El Bravo', fechaNacimiento: '2020-05-20',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 4, potreroId: 1,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Nelore', potreroNombre: 'Potrero Norte',
  },
  {
    id: 3, predioId: 1, codigo: 'GAN-003', nombre: 'Matambo', fechaNacimiento: '2019-08-10',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 3, potreroId: 2,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Romosinuano', potreroNombre: 'Potrero Sur',
  },
  {
    id: 4, predioId: 1, codigo: 'GAN-004', nombre: 'Cupido', fechaNacimiento: '2021-02-28',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: 2,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Sur',
  },
  {
    id: 5, predioId: 1, codigo: 'GAN-005', nombre: 'El Herrero', fechaNacimiento: '2020-11-05',
    sexoKey: 0, tipoIngresoId: 1, configRazasId: 5, potreroId: 3,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    precioCompra: 2500000, pesoCompra: 180, codigoArete: 'ARE-005',
    razaNombre: 'Simmental', potreroNombre: 'Potrero Este',
  },
  {
    id: 6, predioId: 1, codigo: 'GAN-006', nombre: 'Tornado', fechaNacimiento: '2021-06-12',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 2, potreroId: 3,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Holstein', potreroNombre: 'Potrero Este',
  },
  {
    id: 7, predioId: 1, codigo: 'GAN-007', nombre: 'Cimarrón', fechaNacimiento: '2018-04-30',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 7, potreroId: 1,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Criollo', potreroNombre: 'Potrero Norte',
  },
  {
    id: 8, predioId: 1, codigo: 'GAN-008', nombre: 'Palomo', fechaNacimiento: '2020-09-18',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: 2,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Sur',
  },
  {
    id: 9, predioId: 1, codigo: 'GAN-009', nombre: 'El Zorro', fechaNacimiento: '2022-01-08',
    sexoKey: 0, tipoIngresoId: 1, configRazasId: 6, potreroId: 4,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    precioCompra: 1800000, pesoCompra: 150, codigoRfid: 'RFID-009',
    razaNombre: 'Gyr', potreroNombre: 'Potrero Oeste',
  },
  {
    id: 10, predioId: 1, codigo: 'GAN-010', nombre: 'Pescador', fechaNacimiento: '2019-12-25',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 3, potreroId: 3,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Romosinuano', potreroNombre: 'Potrero Este',
  },
  {
    id: 11,predioId: 1, codigo: 'GAN-011', nombre: 'Becerro', fechaNacimiento: '2022-05-14',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: 1,
    madreId: 14, padreId: 1, codigoMadre: 'GAN-014', codigoPadre: 'GAN-001',
    tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Norte',
  },
  {
    id: 12,predioId: 1, codigo: 'GAN-012', nombre: 'Alazán', fechaNacimiento: '2020-07-22',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 5, potreroId: 2,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Simmental', potreroNombre: 'Potrero Sur',
  },
  {
    id: 13,predioId: 1, codigo: 'GAN-013', nombre: 'Navarro', fechaNacimiento: '2021-03-03',
    sexoKey: 0, tipoIngresoId: 1, configRazasId: 4, potreroId: 3,
    precioCompra: 2200000, pesoCompra: 200, codigoArete: 'ARE-013',
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Nelore', potreroNombre: 'Potrero Este',
  },
  {
    id: 31,predioId: 1, codigo: 'GAN-031', nombre: 'Roble', fechaNacimiento: '2023-02-10',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: 2,
    madreId: 20, padreId: 2, codigoMadre: 'GAN-020', codigoPadre: 'GAN-002',
    tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Sur',
  },
  {
    id: 32,predioId: 1, codigo: 'GAN-032', nombre: 'Centella', fechaNacimiento: '2023-04-18',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 3, potreroId: 1,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Romosinuano', potreroNombre: 'Potrero Norte',
  },
  // Hembras (10)
  {
    id: 14,predioId: 1, codigo: 'GAN-014', nombre: 'La Negra', fechaNacimiento: '2019-06-15',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 1, potreroId: 2,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Sur',
  },
  {
    id: 15,predioId: 1, codigo: 'GAN-015', nombre: 'Bella', fechaNacimiento: '2020-02-10',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 6, potreroId: 3,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Gyr', potreroNombre: 'Potrero Este',
  },
  {
    id: 16,predioId: 1, codigo: 'GAN-016', nombre: 'Luna', fechaNacimiento: '2021-04-25',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 2, potreroId: 4,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Holstein', potreroNombre: 'Potrero Oeste',
  },
  {
    id: 17,predioId: 1, codigo: 'GAN-017', nombre: 'Estrella', fechaNacimiento: '2020-08-30',
    sexoKey: 1, tipoIngresoId: 1, configRazasId: 1, potreroId: 2,
    precioCompra: 2800000, pesoCompra: 200, codigoArete: 'ARE-017',
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Sur',
  },
  {
    id: 18,predioId: 1, codigo: 'GAN-018', nombre: 'Margarita', fechaNacimiento: '2018-11-12',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 3, potreroId: 1,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Romosinuano', potreroNombre: 'Potrero Norte',
  },
  {
    id: 19,predioId: 1, codigo: 'GAN-019', nombre: 'Blanca', fechaNacimiento: '2022-03-05',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 5, potreroId: 3,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Simmental', potreroNombre: 'Potrero Este',
  },
  {
    id: 20,predioId: 1, codigo: 'GAN-020', nombre: 'Paloma', fechaNacimiento: '2019-09-20',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 1, potreroId: 2,
    madreId: 14, padreId: 1, codigoMadre: 'GAN-014', codigoPadre: 'GAN-001',
    tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Brahman', potreroNombre: 'Potrero Sur',
  },
  {
    id: 21,predioId: 1, codigo: 'GAN-021', nombre: 'Cereza', fechaNacimiento: '2021-07-14',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 6, potreroId: 4,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Gyr', potreroNombre: 'Potrero Oeste',
  },
  {
    id: 22,predioId: 1, codigo: 'GAN-022', nombre: 'Azucena', fechaNacimiento: '2020-12-01',
    sexoKey: 1, tipoIngresoId: 1, configRazasId: 4, potreroId: 3,
    precioCompra: 2600000, pesoCompra: 190, codigoRfid: 'RFID-022',
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Nelore', potreroNombre: 'Potrero Este',
  },
  {
    id: 23,predioId: 1, codigo: 'GAN-023', nombre: 'Nube', fechaNacimiento: '2022-06-28',
    sexoKey: 1, tipoIngresoId: 0, configRazasId: 2, potreroId: 4,
    madreId: 16, padreId: 6, codigoMadre: 'GAN-016', codigoPadre: 'GAN-006',
    tipoPadreKey: 0, estadoAnimalKey: 0, saludAnimalKey: 0,
    razaNombre: 'Holstein', potreroNombre: 'Potrero Oeste',
  },
  // Vendidos (2)
  {
    id: 24,predioId: 1, codigo: 'GAN-024', nombre: 'Relámpago', fechaNacimiento: '2019-04-10',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 1, potreroId: undefined,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 1, saludAnimalKey: 0,
    precioVenta: 3500000, lugarVentaId: 1,
    razaNombre: 'Brahman', potreroNombre: undefined,
  },
  // Muertos (1)
  {
    id: 25,predioId: 1, codigo: 'GAN-025', nombre: 'Sombra', fechaNacimiento: '2018-02-20',
    sexoKey: 0, tipoIngresoId: 0, configRazasId: 3, potreroId: undefined,
    madreId: null, padreId: null, tipoPadreKey: 0, estadoAnimalKey: 2, saludAnimalKey: 0,
    causaMuerteId: 1, diagnosticoId: 5,
    razaNombre: 'Romosinuano', potreroNombre: undefined,
  },
];

// Fix: use correct property names for madre/padre tracking
const storeAnimals: Animal[] = SEED_ANIMALS.map(a => ({
  ...a,
  // Ensure optional fields are properly handled
  nombre: a.nombre,
  potreroId: a.potreroId,
  madreId: a.madreId,
  padreId: a.padreId,
  codigoMadre: a.codigoMadre,
  codigoPadre: a.codigoPadre,
  precioCompra: a.precioCompra,
  pesoCompra: a.pesoCompra,
  codigoRfid: a.codigoRfid,
  codigoArete: a.codigoArete,
  precioVenta: (a as { precioVenta?: number }).precioVenta,
  lugarVentaId: (a as { lugarVentaId?: number }).lugarVentaId,
  causaMuerteId: (a as { causaMuerteId?: number }).causaMuerteId,
  diagnosticoId: (a as { diagnosticoId?: number }).diagnosticoId,
}));

let idCounter = 26;

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function applyFilters(animals: Animal[], filters: AnimalFilters): Animal[] {
  let result = animals.filter(a => a.predioId === filters.predioId);

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(a =>
      a.codigo.toLowerCase().includes(search) ||
      (a.nombre && a.nombre.toLowerCase().includes(search))
    );
  }

  if (filters.sexoKey !== undefined) {
    result = result.filter(a => a.sexoKey === filters.sexoKey);
  }

  if (filters.estadoAnimalKey !== undefined) {
    result = result.filter(a => a.estadoAnimalKey === filters.estadoAnimalKey);
  }

  if (filters.potreroId !== undefined) {
    result = result.filter(a => a.potreroId === filters.potreroId);
  }

  return result;
}

// ============================================================================
// MockAnimalService
// ============================================================================

export class MockAnimalService implements AnimalService {
  async getAll(filters: AnimalFilters): Promise<PaginatedAnimales> {
    await delay(300);

    const filtered = applyFilters(storeAnimals, filters);
    const total = filtered.length;
    const totalPages = Math.ceil(total / filters.limit);
    const start = (filters.page - 1) * filters.limit;
    const data = filtered.slice(start, start + filters.limit);

    return { data, page: filters.page, limit: filters.limit, total, totalPages };
  }

  async getById(id: number): Promise<Animal> {
    await delay(300);
    const animal = storeAnimals.find(a => a.id === id);
    if (!animal) {
      throw new ApiError(404, 'NOT_FOUND', `Animal con ID ${id} no encontrado`);
    }
    return { ...animal };
  }

  async create(data: CreateAnimalDto): Promise<Animal> {
    await delay(300);
    const newAnimal: Animal = {
      id: idCounter++,
      ...data,
      fechaNacimiento: typeof data.fechaNacimiento === 'string'
        ? data.fechaNacimiento
        : (data.fechaNacimiento as Date).toISOString(),
      estadoAnimalKey: data.estadoAnimalKey ?? 0,
      saludAnimalKey: data.saludAnimalKey ?? 0,
      tipoIngresoId: data.tipoIngresoId ?? 0,
      tipoPadreKey: data.tipoPadreKey ?? 0,
    };
    storeAnimals.push(newAnimal);
    return { ...newAnimal };
  }

  async update(id: number, data: UpdateAnimalDto): Promise<Animal> {
    await delay(300);
    const index = storeAnimals.findIndex(a => a.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Animal con ID ${id} no encontrado`);
    }
    storeAnimals[index] = { ...storeAnimals[index], ...data };
    return { ...storeAnimals[index] };
  }

  async delete(id: number): Promise<void> {
    await delay(300);
    const index = storeAnimals.findIndex(a => a.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Animal con ID ${id} no encontrado`);
    }
    // Soft delete — set estado to inactivo
    storeAnimals[index].estadoAnimalKey = 99; // custom inactive state
  }

  async cambiarEstado(id: number, data: CambioEstadoDto): Promise<Animal> {
    await delay(300);
    const index = storeAnimals.findIndex(a => a.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Animal con ID ${id} no encontrado`);
    }
    storeAnimals[index].estadoAnimalKey = data.estadoAnimalKey;
    return { ...storeAnimals[index] };
  }

  async getGenealogia(id: number): Promise<Genealogia> {
    await delay(300);
    const animal = storeAnimals.find(a => a.id === id);
    if (!animal) {
      throw new ApiError(404, 'NOT_FOUND', `Animal con ID ${id} no encontrado`);
    }

    const toGenealogia = (a: Animal): Genealogia => ({
      id: a.id,
      codigo: a.codigo,
      nombre: a.nombre,
      sexoKey: a.sexoKey,
      razaNombre: a.razaNombre,
      madre: a.madreId
        ? (() => {
            const madre = storeAnimals.find(ma => ma.id === a.madreId);
            return madre ? toGenealogia(madre) : undefined;
          })()
        : undefined,
      padre: a.padreId
        ? (() => {
            const padre = storeAnimals.find(pa => pa.id === a.padreId);
            return padre ? toGenealogia(padre) : undefined;
          })()
        : undefined,
    });

    return toGenealogia(animal);
  }

  async getHistorial(id: number, _tipo: string): Promise<HistorialEvento[]> {
    await delay(300);
    const animal = storeAnimals.find(a => a.id === id);
    if (!animal) {
      throw new ApiError(404, 'NOT_FOUND', `Animal con ID ${id} no encontrado`);
    }

    // Return mock historial events
    return [
      { id: 1, tipo: 'servicio', fecha: '2023-06-15', descripcion: 'Palpación positiva - preñada 3 meses' },
      { id: 2, tipo: 'vacuna', fecha: '2023-05-10', descripcion: 'Vacuna aftosa aplicada' },
      { id: 3, tipo: 'peso', fecha: '2023-04-20', descripcion: 'Peso registrado: 320 kg' },
    ];
  }

  async getEstadisticas(predioId: number): Promise<AnimalEstadisticas> {
    await delay(300);
    const animals = storeAnimals.filter(a => a.predioId === predioId && a.estadoAnimalKey !== 99);

    return {
      total: animals.length,
      activos: animals.filter(a => a.estadoAnimalKey === 0).length,
      vendidos: animals.filter(a => a.estadoAnimalKey === 1).length,
      muertos: animals.filter(a => a.estadoAnimalKey === 2).length,
      machos: animals.filter(a => a.sexoKey === 0).length,
      hembras: animals.filter(a => a.sexoKey === 1).length,
    };
  }
}

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetAnimalMock(): void {
  storeAnimals.length = 0;
  storeAnimals.push(...SEED_ANIMALS.map(a => ({ ...a })));
  idCounter = 26;
}