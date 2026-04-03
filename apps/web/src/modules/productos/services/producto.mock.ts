// apps/web/src/modules/productos/services/producto.mock.ts
/**
 * Mock Producto Service — simulates API for development.
 *
 * Provides realistic veterinary product data with full CRUD + pagination.
 * In-memory store supports all operations.
 * Simulated delay: 300ms.
 */

import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  PaginatedProductos,
  ProductoFilters,
} from '../types/producto.types';
import type { ProductoService } from './producto.service';
import { ApiError } from '@/shared/lib/errors';

// ============================================================================
// Seed Data — realistic veterinary products
// ============================================================================

const now = new Date().toISOString();

const SEED_PRODUCTOS: Producto[] = [
  {
    id: 1, predioId: 1, nombre: 'Ivermectina 1%', descripcion: 'Antiparasitario de amplio espectro',
    tipoKey: 1, unidadMedida: 'ml', precioUnitario: 45000, stockActual: 25, stockMinimo: 10,
    estadoKey: 1, fechaVencimiento: '2027-06-15', proveedorId: 1,
    createdAt: now, updatedAt: now, tipoNombre: 'Medicamento', proveedorNombre: 'VetColombia',
  },
  {
    id: 2, predioId: 1, nombre: 'Mineral Premix B', descripcion: 'Suplemento mineral para ganado bovino',
    tipoKey: 2, unidadMedida: 'kg', precioUnitario: 85000, stockActual: 8, stockMinimo: 10,
    estadoKey: 1, fechaVencimiento: '2026-12-01', proveedorId: 2,
    createdAt: now, updatedAt: now, tipoNombre: 'Suplemento', proveedorNombre: 'NutriGan SAS',
  },
  {
    id: 3, predioId: 1, nombre: 'Guantes de Nitrilo', descripcion: 'Guantes para palpación rectal, caja x100',
    tipoKey: 3, unidadMedida: 'unidad', precioUnitario: 32000, stockActual: 15, stockMinimo: 5,
    estadoKey: 1, createdAt: now, updatedAt: now, tipoNombre: 'Insumo', proveedorNombre: 'VetColombia',
  },
  {
    id: 4, predioId: 1, nombre: 'Oxitocina', descripcion: 'Hormona para inducción del parto',
    tipoKey: 1, unidadMedida: 'ml', precioUnitario: 28000, stockActual: 12, stockMinimo: 5,
    estadoKey: 1, fechaVencimiento: '2027-03-20', proveedorId: 1,
    createdAt: now, updatedAt: now, tipoNombre: 'Medicamento', proveedorNombre: 'VetColombia',
  },
  {
    id: 5, predioId: 1, nombre: 'Electrolitos Orales', descripcion: 'Solución rehidratante para becerros',
    tipoKey: 2, unidadMedida: 'kg', precioUnitario: 55000, stockActual: 3, stockMinimo: 5,
    estadoKey: 1, fechaVencimiento: '2027-01-10', proveedorId: 2,
    createdAt: now, updatedAt: now, tipoNombre: 'Suplemento', proveedorNombre: 'NutriGan SAS',
  },
  {
    id: 6, predioId: 1, nombre: 'Jeringa 20ml', descripcion: 'Jeringas desechables con aguja 18G',
    tipoKey: 3, unidadMedida: 'unidad', precioUnitario: 3500, stockActual: 50, stockMinimo: 20,
    estadoKey: 1, createdAt: now, updatedAt: now, tipoNombre: 'Insumo', proveedorNombre: 'MediVet',
  },
  {
    id: 7, predioId: 1, nombre: 'Penicilina G Procaínica', descripcion: 'Antibiótico de amplio espectro',
    tipoKey: 1, unidadMedida: 'ml', precioUnitario: 62000, stockActual: 0, stockMinimo: 5,
    estadoKey: 2, fechaVencimiento: '2026-08-30', proveedorId: 1,
    createdAt: now, updatedAt: now, tipoNombre: 'Medicamento', proveedorNombre: 'VetColombia',
  },
  {
    id: 8, predioId: 1, nombre: 'Sal Mineralizada', descripcion: 'Sal con minerales para libre consumo',
    tipoKey: 2, unidadMedida: 'kg', precioUnitario: 22000, stockActual: 100, stockMinimo: 30,
    estadoKey: 1, proveedorId: 2,
    createdAt: now, updatedAt: now, tipoNombre: 'Suplemento', proveedorNombre: 'NutriGan SAS',
  },
];

let idCounter = SEED_PRODUCTOS.length + 1;

// ============================================================================
// Helpers
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function applyFilters(productos: Producto[], filters: ProductoFilters): Producto[] {
  let result = productos.filter(p => p.predioId === filters.predioId);

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(p =>
      p.nombre.toLowerCase().includes(search) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(search))
    );
  }

  if (filters.tipoKey !== undefined) {
    result = result.filter(p => p.tipoKey === filters.tipoKey);
  }

  if (filters.estadoKey !== undefined) {
    result = result.filter(p => p.estadoKey === filters.estadoKey);
  }

  return result;
}

// ============================================================================
// MockProductoService
// ============================================================================

export class MockProductoService implements ProductoService {
  async getAll(filters: ProductoFilters): Promise<PaginatedProductos> {
    await delay(300);

    const filtered = applyFilters(seedData, filters);
    const total = filtered.length;
    const totalPages = Math.ceil(total / filters.limit);
    const start = (filters.page - 1) * filters.limit;
    const data = filtered.slice(start, start + filters.limit);

    return { data, page: filters.page, limit: filters.limit, total, totalPages };
  }

  async getById(id: number): Promise<Producto> {
    await delay(300);
    const producto = seedData.find(p => p.id === id);
    if (!producto) {
      throw new ApiError(404, 'NOT_FOUND', `Producto con ID ${id} no encontrado`);
    }
    return { ...producto };
  }

  async create(data: CreateProductoDto): Promise<Producto> {
    await delay(300);
    const newProducto: Producto = {
      id: idCounter++,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    seedData.push(newProducto);
    return { ...newProducto };
  }

  async update(id: number, data: UpdateProductoDto): Promise<Producto> {
    await delay(300);
    const index = seedData.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Producto con ID ${id} no encontrado`);
    }
    seedData[index] = { ...seedData[index], ...data, updatedAt: new Date().toISOString() };
    return { ...seedData[index] };
  }

  async delete(id: number): Promise<void> {
    await delay(300);
    const index = seedData.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, 'NOT_FOUND', `Producto con ID ${id} no encontrado`);
    }
    // Soft delete — set estado to inactivo
    seedData[index].estadoKey = 2;
  }
}

// In-memory store
const seedData = SEED_PRODUCTOS.map(p => ({ ...p }));

// ============================================================================
// Reset helper — for testing
// ============================================================================

export function resetProductoMock(): void {
  seedData.length = 0;
  seedData.push(...SEED_PRODUCTOS.map(p => ({ ...p })));
  idCounter = SEED_PRODUCTOS.length + 1;
}
