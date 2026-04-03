// apps/web/src/tests/modules/animales/animal.service.test.ts
/**
 * Animal Service Tests
 *
 * Tests:
 * - paginated getAll
 * - getById
 * - create
 * - genealogia
 * - estadisticas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockAnimalService, resetAnimalMock } from '@/modules/animales/services/animal.mock';
import type { AnimalFilters } from '@/modules/animales/types/animal.types';

describe('AnimalService', () => {
  let service: MockAnimalService;

  beforeEach(() => {
    resetAnimalMock();
    service = new MockAnimalService();
  });

  describe('getAll', () => {
    it('should return paginated animals for a predio', async () => {
      const filters: AnimalFilters = {
        predioId: 1,
        page: 1,
        limit: 10,
      };

      const result = await service.getAll(filters);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by sexoKey', async () => {
      const filters: AnimalFilters = {
        predioId: 1,
        page: 1,
        limit: 10,
        sexoKey: 0, // Masculino
      };

      const result = await service.getAll(filters);

      expect(result.data.every(a => a.sexoKey === 0)).toBe(true);
    });

    it('should filter by estadoAnimalKey', async () => {
      const filters: AnimalFilters = {
        predioId: 1,
        page: 1,
        limit: 10,
        estadoAnimalKey: 0, // Activo
      };

      const result = await service.getAll(filters);

      expect(result.data.every(a => a.estadoAnimalKey === 0)).toBe(true);
    });

    it('should filter by search term', async () => {
      const filters: AnimalFilters = {
        predioId: 1,
        page: 1,
        limit: 10,
        search: 'Don',
      };

      const result = await service.getAll(filters);

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every(a =>
        a.codigo.toLowerCase().includes('don') ||
        (a.nombre && a.nombre.toLowerCase().includes('don'))
      )).toBe(true);
    });

    it('should calculate totalPages correctly', async () => {
      const filters: AnimalFilters = {
        predioId: 1,
        page: 1,
        limit: 5,
      };

      const result = await service.getAll(filters);

      expect(result.totalPages).toBe(Math.ceil(result.total / 5));
    });
  });

  describe('getById', () => {
    it('should return an animal by id', async () => {
      const animal = await service.getById(1);

      expect(animal).toBeDefined();
      expect(animal.id).toBe(1);
      expect(animal.codigo).toBe('GAN-001');
    });

    it('should throw error for non-existent id', async () => {
      await expect(service.getById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new animal', async () => {
      const newAnimal = {
        codigo: 'GAN-TEST',
        nombre: 'Animal Test',
        fechaNacimiento: new Date('2023-01-15'),
        sexoKey: 0,
        tipoIngresoId: 0,
        configRazasId: 1,
        estadoAnimalKey: 0,
        saludAnimalKey: 0,
        tipoPadreKey: 0,
      };

      const created = await service.create(newAnimal);

      expect(created).toBeDefined();
      expect(created.codigo).toBe('GAN-TEST');
      expect(created.id).toBeGreaterThan(0);
    });
  });

  describe('getGenealogia', () => {
    it('should return genealogy tree for an animal', async () => {
      // Animal 11 has madreId and padreId set
      const genealogia = await service.getGenealogia(11);

      expect(genealogia).toBeDefined();
      expect(genealogia.id).toBe(11);
      expect(genealogia.madre).toBeDefined();
      expect(genealogia.padre).toBeDefined();
    });

    it('should return simple tree for animal without parents', async () => {
      const genealogia = await service.getGenealogia(1);

      expect(genealogia).toBeDefined();
      expect(genealogia.id).toBe(1);
      // No parents for GAN-001
    });
  });

  describe('getEstadisticas', () => {
    it('should return statistics for a predio', async () => {
      const stats = await service.getEstadisticas(1);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('activos');
      expect(stats).toHaveProperty('vendidos');
      expect(stats).toHaveProperty('muertos');
      expect(stats).toHaveProperty('machos');
      expect(stats).toHaveProperty('hembras');
    });

    it('should have consistent counts', async () => {
      const stats = await service.getEstadisticas(1);

      expect(stats.total).toBe(stats.activos + stats.vendidos + stats.muertos);
      expect(stats.total).toBe(stats.machos + stats.hembras);
    });
  });

  describe('update', () => {
    it('should update an existing animal', async () => {
      const updated = await service.update(1, { nombre: 'Don Toro Actualizado' });

      expect(updated).toBeDefined();
      expect(updated.nombre).toBe('Don Toro Actualizado');
    });

    it('should throw error for non-existent id', async () => {
      await expect(service.update(999, { nombre: 'Test' })).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should soft delete an animal', async () => {
      await service.delete(1);

      const animal = await service.getById(1);
      expect(animal.estadoAnimalKey).toBe(99); // inactivo state
    });
  });

  describe('cambiarEstado', () => {
    it('should change animal estado', async () => {
      const updated = await service.cambiarEstado(1, {
        estadoAnimalKey: 1,
        fecha: new Date().toISOString(),
      });

      expect(updated.estadoAnimalKey).toBe(1);
    });
  });
});