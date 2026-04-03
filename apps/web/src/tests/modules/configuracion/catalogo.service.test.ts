// apps/web/src/tests/modules/configuracion/catalogo.service.test.ts
/**
 * Tests for MockCatalogoService.
 *
 * Covers:
 * - getAll returns array for each tipo
 * - create adds item and returns it
 * - update modifies item
 * - remove deletes item
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockCatalogoService, resetCatalogoMock } from '@/modules/configuracion/services/catalogo.mock';
import type { CatalogoTipo } from '@/modules/configuracion/types/catalogo.types';

const ALL_TIPOS: CatalogoTipo[] = [
  'razas',
  'condiciones-corporales',
  'tipos-explotacion',
  'calidad-animal',
  'colores',
];

let service: MockCatalogoService;

beforeEach(() => {
  resetCatalogoMock();
  service = new MockCatalogoService();
});

// ============================================================================
// getAll
// ============================================================================

describe('MockCatalogoService — getAll', () => {
  it.each(ALL_TIPOS)('debería retornar un array para tipo "%s"', async (tipo) => {
    const result = await service.getAll(tipo);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('debería retornar razas con las propiedades correctas', async () => {
    const result = await service.getAll('razas');
    const first = result[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('nombre');
    expect(first).toHaveProperty('activo');
    expect(typeof first.id).toBe('number');
    expect(typeof first.nombre).toBe('string');
    expect(typeof first.activo).toBe('boolean');
  });

  it('debería retornar 7 razas por defecto', async () => {
    const result = await service.getAll('razas');
    expect(result.length).toBe(7);
  });

  it('debería retornar 6 condiciones corporales por defecto', async () => {
    const result = await service.getAll('condiciones-corporales');
    expect(result.length).toBe(6);
  });

  it('debería retornar 5 tipos de explotación por defecto', async () => {
    const result = await service.getAll('tipos-explotacion');
    expect(result.length).toBe(5);
  });

  it('debería retornar 4 calidades por defecto', async () => {
    const result = await service.getAll('calidad-animal');
    expect(result.length).toBe(4);
  });

  it('debería retornar 7 colores por defecto', async () => {
    const result = await service.getAll('colores');
    expect(result.length).toBe(7);
  });
});

// ============================================================================
// create
// ============================================================================

describe('MockCatalogoService — create', () => {
  it('debería agregar una nueva raza y retornarla', async () => {
    const newItem = { nombre: 'Braford', codigo: 'BRD' };
    const result = await service.create('razas', newItem);

    expect(result).toHaveProperty('id');
    expect(result.nombre).toBe('Braford');
    expect(result.codigo).toBe('BRD');
    expect(result.activo).toBe(true);
  });

  it('debería incrementar la lista después de crear', async () => {
    const before = await service.getAll('colores');
    await service.create('colores', { nombre: 'Cenizo' });
    const after = await service.getAll('colores');

    expect(after.length).toBe(before.length + 1);
  });

  it('debería asignar IDs únicos a elementos creados', async () => {
    const item1 = await service.create('razas', { nombre: 'Raza A' });
    const item2 = await service.create('razas', { nombre: 'Raza B' });

    expect(item1.id).not.toBe(item2.id);
  });
});

// ============================================================================
// update
// ============================================================================

describe('MockCatalogoService — update', () => {
  it('debería modificar el nombre de una raza existente', async () => {
    const items = await service.getAll('razas');
    const target = items[0];
    const updated = await service.update('razas', target.id, { nombre: 'Brahman Modificado' });

    expect(updated.id).toBe(target.id);
    expect(updated.nombre).toBe('Brahman Modificado');
  });

  it('debería persistir la actualización en la lista', async () => {
    const items = await service.getAll('colores');
    const target = items[0];
    await service.update('colores', target.id, { nombre: 'Color Modificado' });

    const afterUpdate = await service.getAll('colores');
    const found = afterUpdate.find((i) => i.id === target.id);
    expect(found?.nombre).toBe('Color Modificado');
  });

  it('debería lanzar error si el ID no existe', async () => {
    await expect(
      service.update('razas', 99999, { nombre: 'No existe' }),
    ).rejects.toThrow();
  });
});

// ============================================================================
// remove
// ============================================================================

describe('MockCatalogoService — remove', () => {
  it('debería eliminar un elemento por ID', async () => {
    const items = await service.getAll('razas');
    const target = items[0];
    await service.remove('razas', target.id);

    const after = await service.getAll('razas');
    const found = after.find((i) => i.id === target.id);
    expect(found).toBeUndefined();
  });

  it('debería decrementar la lista después de eliminar', async () => {
    const before = await service.getAll('calidad-animal');
    await service.remove('calidad-animal', before[0].id);
    const after = await service.getAll('calidad-animal');

    expect(after.length).toBe(before.length - 1);
  });

  it('debería lanzar error si el ID no existe', async () => {
    await expect(service.remove('colores', 99999)).rejects.toThrow();
  });
});
