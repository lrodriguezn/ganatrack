// apps/web/src/tests/modules/maestros/maestros.service.test.ts
/**
 * Tests for MockMaestrosService.
 *
 * Covers:
 * - getAll returns array for each tipo
 * - create adds item and returns it
 * - update modifies item
 * - remove deletes item
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockMaestrosService, resetMaestrosMock } from '@/modules/maestros/services/maestros.mock';
import type { MaestroTipo } from '@/modules/maestros/types/maestro.types';

const ALL_TIPOS: MaestroTipo[] = [
  'veterinarios',
  'propietarios',
  'hierros',
  'diagnosticos',
  'motivos-ventas',
  'causas-muerte',
  'lugares-compras',
  'lugares-ventas',
];

let service: MockMaestrosService;

beforeEach(() => {
  resetMaestrosMock();
  service = new MockMaestrosService();
});

// ============================================================================
// getAll — pagination
// ============================================================================

describe('MockMaestrosService — getAll with pagination', () => {
  it('debería retornar { data, meta } sin parámetros', async () => {
    const result = await service.getAll('veterinarios');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toHaveProperty('page');
    expect(result.meta).toHaveProperty('limit');
    expect(result.meta).toHaveProperty('total');
  });
});

// ============================================================================
// getAll
// ============================================================================
// getAll
// ============================================================================

describe('MockMaestrosService — getAll', () => {
  it.each(ALL_TIPOS)('debería retornar { data, meta } para tipo "%s"', async (tipo) => {
    const result = await service.getAll(tipo);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('debería retornar veterinarios con las propiedades correctas', async () => {
    const result = await service.getAll('veterinarios');
    const first = result.data[0];
    expect(first!).toHaveProperty('id');
    expect(first!).toHaveProperty('nombre');
    expect(first!).toHaveProperty('activo');
    expect(typeof first!.id).toBe('number');
    expect(typeof first!.nombre).toBe('string');
    expect(typeof first!.activo).toBe('boolean');
  });

  it('debería retornar 4 veterinarios por defecto', async () => {
    const result = await service.getAll('veterinarios');
    expect(result.data.length).toBe(4);
  });

  it('debería retornar 5 propietarios por defecto', async () => {
    const result = await service.getAll('propietarios');
    expect(result.data.length).toBe(5);
  });

  it('debería retornar 5 causas de muerte por defecto', async () => {
    const result = await service.getAll('causas-muerte');
    expect(result.data.length).toBe(5);
  });
});

// ============================================================================
// create
// ============================================================================

describe('MockMaestrosService — create', () => {
  it('debería agregar un nuevo veterinario y retornarlo', async () => {
    const newItem = { nombre: 'Dr. Nuevo Vet', especialidad: 'Cirugía' };
    const result = await service.create('veterinarios', newItem);

    expect(result).toHaveProperty('id');
    expect(result.nombre).toBe('Dr. Nuevo Vet');
    expect(result.activo).toBe(true);
  });

  it('debería incrementar la lista después de crear', async () => {
    const before = await service.getAll('veterinarios');
    await service.create('veterinarios', { nombre: 'Nuevo Vet' });
    const after = await service.getAll('veterinarios');

    expect(after.data.length).toBe(before.data.length + 1);
  });

  it('debería asignar IDs únicos a elementos creados', async () => {
    const item1 = await service.create('diagnosticos', { nombre: 'Diagnóstico A' });
    const item2 = await service.create('diagnosticos', { nombre: 'Diagnóstico B' });

    expect(item1.id).not.toBe(item2.id);
  });

  it('debería crear un motivo de venta con activo=true por defecto', async () => {
    const result = await service.create('motivos-ventas', { nombre: 'Nuevo Motivo' });
    expect(result.activo).toBe(true);
  });
});

// ============================================================================
// update
// ============================================================================

describe('MockMaestrosService — update', () => {
  it('debería modificar el nombre de un veterinario existente', async () => {
    const { data: items } = await service.getAll('veterinarios');
    const target = items[0]!;
    const updated = await service.update('veterinarios', target.id, { nombre: 'Dr. Actualizado' });

    expect(updated.id).toBe(target.id);
    expect(updated.nombre).toBe('Dr. Actualizado');
  });

  it('debería persistir la actualización en la lista', async () => {
    const { data: items } = await service.getAll('propietarios');
    const target = items[0]!;
    await service.update('propietarios', target.id, { nombre: 'Propietario Modificado' });

    const { data: afterUpdate } = await service.getAll('propietarios');
    const found = afterUpdate.find((i) => i.id === target.id);
    expect(found?.nombre).toBe('Propietario Modificado');
  });

  it('debería lanzar error si el ID no existe', async () => {
    await expect(
      service.update('diagnosticos', 99999, { nombre: 'No existe' }),
    ).rejects.toThrow();
  });
});

// ============================================================================
// remove
// ============================================================================

describe('MockMaestrosService — remove', () => {
  it('debería eliminar un elemento por ID', async () => {
    const { data: items } = await service.getAll('hierros');
    const target = items[0]!;
    await service.remove('hierros', target.id);

    const { data: after } = await service.getAll('hierros');
    const found = after.find((i) => i.id === target.id);
    expect(found).toBeUndefined();
  });

  it('debería decrementar la lista después de eliminar', async () => {
    const { data: before } = await service.getAll('causas-muerte');
    const target = before![0]!;
    await service.remove('causas-muerte', target.id);
    const { data: after } = await service.getAll('causas-muerte');

    expect(after.length).toBe(before.length - 1);
  });

  it('debería lanzar error si el ID no existe', async () => {
    await expect(service.remove('lugares-compras', 99999)).rejects.toThrow();
  });
});
