// apps/web/src/modules/usuarios/hooks/use-create-usuario.test.tsx
/**
 * Tests for useCreateUsuario mutation hook.
 *
 * Tests:
 * - Success mutation
 * - Validation error
 * - Network error
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateUsuario } from './use-create-usuario';
import * as serviceModule from '../services';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create usuario successfully', async () => {
    const mockUsuario = {
      id: 16,
      nombre: 'Nuevo Usuario',
      email: 'nuevo@test.com',
      rolId: 3,
      predioId: 1,
      activo: true,
    };

    vi.spyOn(serviceModule.usuariosService, 'create').mockResolvedValue(mockUsuario);

    const { result } = renderHook(() => useCreateUsuario(), {
      wrapper: createWrapper(),
    });

    const created = await result.current.mutateAsync({
      nombre: 'Nuevo Usuario',
      email: 'nuevo@test.com',
      password: 'Password1',
      rolId: 3,
      predioId: 1,
    });

    expect(created).toEqual(mockUsuario);
  });

  it('should return error on validation failure', async () => {
    vi.spyOn(serviceModule.usuariosService, 'create').mockRejectedValue(
      new Error('Email inválido'),
    );

    const { result } = renderHook(() => useCreateUsuario(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        nombre: 'Test',
        email: 'invalid-email',
        password: 'Password1',
        rolId: 3,
        predioId: 1,
      }),
    ).rejects.toThrow('Email inválido');
  });

  it('should return error on network failure', async () => {
    vi.spyOn(serviceModule.usuariosService, 'create').mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useCreateUsuario(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        nombre: 'Test',
        email: 'test@test.com',
        password: 'Password1',
        rolId: 3,
        predioId: 1,
      }),
    ).rejects.toThrow('Network error');
  });
});
