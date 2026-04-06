// apps/web/src/shared/lib/__tests__/query-client.test.ts
/**
 * Tests for query-client.ts configuration.
 *
 * Coverage targets:
 * - gcTime is 24 hours (86400000ms) for offline persistence
 * - staleTime is 30 seconds for list queries
 * - retry configuration for queries and mutations
 */

import { describe, it, expect } from 'vitest';
import { queryClient, StaleTimes } from '../query-client';

describe('queryClient — configuration', () => {
  describe('gcTime (garbage collection time)', () => {
    it('debería tener gcTime de 24 horas para persistencia offline', () => {
      // 24 hours in milliseconds = 24 * 60 * 60 * 1000 = 86400000
      const expectedGcTime = 24 * 60 * 60 * 1000;
      
      // Access the default options for queries
      const gcTime = queryClient.getDefaultOptions().queries?.gcTime;
      expect(gcTime).toBe(expectedGcTime);
    });

    it('no debería tener gcTime menor a 24 horas', () => {
      const gcTime = queryClient.getDefaultOptions().queries?.gcTime ?? 0;
      expect(gcTime).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000);
    });
  });

  describe('staleTime', () => {
    it('debería tener staleTime de 30 segundos para listas', () => {
      const staleTime = queryClient.getDefaultOptions().queries?.staleTime;
      expect(staleTime).toBe(30_000);
    });

    it('debería tener StaleTimes.LIST = 30 segundos', () => {
      expect(StaleTimes.LIST).toBe(30_000);
    });

    it('debería tener StaleTimes.DETAIL = 5 minutos', () => {
      expect(StaleTimes.DETAIL).toBe(5 * 60_000);
    });

    it('debería tener StaleTimes.CATALOG = Infinity', () => {
      expect(StaleTimes.CATALOG).toBe(Infinity);
    });
  });

  describe('retry configuration', () => {
    it('debería tener retry: 3 para queries', () => {
      const retry = queryClient.getDefaultOptions().queries?.retry;
      expect(retry).toBe(3);
    });

    it('debería tener retry: 0 para mutations (fail fast)', () => {
      const retry = queryClient.getDefaultOptions().mutations?.retry;
      expect(retry).toBe(0);
    });
  });

  describe('refetchOnWindowFocus', () => {
    it('debería tener refetchOnWindowFocus habilitado', () => {
      const refetchOnWindowFocus = queryClient.getDefaultOptions().queries?.refetchOnWindowFocus;
      expect(refetchOnWindowFocus).toBe(true);
    });
  });
});
