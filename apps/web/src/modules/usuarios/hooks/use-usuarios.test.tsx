// apps/web/src/modules/usuarios/hooks/use-usuarios.test.tsx
/**
 * Component tests for useUsuarios hook.
 *
 * Tests:
 * - Loading state
 * - Data state
 * - Error state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsuarios } from './use-usuarios';
import * as serviceModule from '../services';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.spyOn(serviceModule.usuariosService, 'getAll').mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { result } = renderHook(
      () =>
        useUsuarios({
          predioId: 1,
          page: 1,
          limit: 10,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('should return data when query succeeds', async () => {
    const mockData = {
      data: [
        { id: 1, nombre: 'Carlos', email: 'carlos@test.com', rolId: 1, predioId: 1, activo: true },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    };

    vi.spyOn(serviceModule.usuariosService, 'getAll').mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useUsuarios({
          predioId: 1,
          page: 1,
          limit: 10,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should return error when query fails', async () => {
    vi.spyOn(serviceModule.usuariosService, 'getAll').mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(
      () =>
        useUsuarios({
          predioId: 1,
          page: 1,
          limit: 10,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error?.message).toBe('Network error');
  });
});
