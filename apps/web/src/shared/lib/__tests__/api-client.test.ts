// apps/web/src/shared/lib/__tests__/api-client.test.ts
/**
 * Tests for api-client.ts — ky interceptors for optimistic locking.
 *
 * Coverage targets:
 * - versionCache stores X-Resource-Version from GET responses
 * - versionCache retrieves version for a given URL
 * - buildIfMatchHeaders returns If-Match header when version exists
 * - buildIfMatchHeaders returns empty headers when no version
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('api-client/versionCache', () => {
  beforeEach(async () => {
    const { versionCache } = await import('../api-client');
    versionCache.clear();
  });

  describe('setVersion', () => {
    it('debería almacenar la versión para una URL', async () => {
      const { versionCache } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 5);
      expect(versionCache.getVersion('/api/v1/animales/1')).toBe(5);
    });

    it('debería sobrescribir la versión existente', async () => {
      const { versionCache } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 3);
      versionCache.setVersion('/api/v1/animales/1', 7);
      expect(versionCache.getVersion('/api/v1/animales/1')).toBe(7);
    });

    it('debería almacenar versiones para URLs diferentes', async () => {
      const { versionCache } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 3);
      versionCache.setVersion('/api/v1/animales/2', 5);
      expect(versionCache.getVersion('/api/v1/animales/1')).toBe(3);
      expect(versionCache.getVersion('/api/v1/animales/2')).toBe(5);
    });
  });

  describe('getVersion', () => {
    it('debería retornar undefined si no hay versión almacenada', async () => {
      const { versionCache } = await import('../api-client');

      expect(versionCache.getVersion('/api/v1/animales/999')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('debería eliminar todas las versiones almacenadas', async () => {
      const { versionCache } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 3);
      versionCache.setVersion('/api/v1/animales/2', 5);
      versionCache.clear();
      expect(versionCache.getVersion('/api/v1/animales/1')).toBeUndefined();
      expect(versionCache.getVersion('/api/v1/animales/2')).toBeUndefined();
    });
  });

  describe('buildIfMatchHeaders', () => {
    it('debería retornar header If-Match cuando existe versión', async () => {
      const { versionCache, buildIfMatchHeaders } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 5);
      const headers = buildIfMatchHeaders('/api/v1/animales/1', 'PUT');

      expect(headers).toEqual({ 'If-Match': '5' });
    });

    it('debería retornar objeto vacío cuando no hay versión', async () => {
      const { buildIfMatchHeaders } = await import('../api-client');

      const headers = buildIfMatchHeaders('/api/v1/animales/999', 'PUT');
      expect(headers).toEqual({});
    });

    it('debería retornar objeto vacío para requests que no son PUT', async () => {
      const { versionCache, buildIfMatchHeaders } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 5);
      const headers = buildIfMatchHeaders('/api/v1/animales/1', 'GET');

      expect(headers).toEqual({});
    });

    it('debería retornar objeto vacío para requests POST', async () => {
      const { versionCache, buildIfMatchHeaders } = await import('../api-client');

      versionCache.setVersion('/api/v1/animales/1', 5);
      const headers = buildIfMatchHeaders('/api/v1/animales/1', 'POST');

      expect(headers).toEqual({});
    });
  });
});
