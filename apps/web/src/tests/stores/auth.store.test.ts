// apps/web/src/tests/stores/auth.store.test.ts
/**
 * Tests for auth.store.ts
 * Coverage targets: setAuth, clearAuth, setLoading, initial state, selectors
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useAuthStore,
  selectIsAuthenticated,
  selectAccessToken,
  selectUser,
  selectPermissions,
  selectHasPermission,
  selectHasAnyPermission,
} from '@/store/auth.store';
import type { User } from '@ganatrack/shared-types';

// ============================================================================
// Fixtures
// ============================================================================

const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@ganatrack.com',
  nombre: 'Admin Ganatrack',
  rol: 'admin',
};

const mockPermissions = ['predios:read', 'predios:write', 'animales:read'];

// ============================================================================
// Reset store before each test
// ============================================================================

beforeEach(() => {
  // Reset store to initial state
  act(() => {
    useAuthStore.getState().clearAuth();
  });
  // Clear sessionStorage mock
  sessionStorage.clear();
});

// ============================================================================
// Tests: Estado inicial
// ============================================================================

describe('auth.store — estado inicial', () => {
  it('debería tener accessToken null en el estado inicial', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
  });

  it('debería tener user null en el estado inicial', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it('debería tener permissions vacío en el estado inicial', () => {
    const state = useAuthStore.getState();
    expect(state.permissions).toEqual([]);
  });

  it('debería tener isLoading false en el estado inicial', () => {
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
  });
});

// ============================================================================
// Tests: setAuth
// ============================================================================

describe('auth.store — setAuth', () => {
  it('debería establecer accessToken al llamar setAuth', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: mockPermissions,
      });
    });

    expect(useAuthStore.getState().accessToken).toBe('token-abc-123');
  });

  it('debería establecer user al llamar setAuth', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: mockPermissions,
      });
    });

    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('debería establecer permissions al llamar setAuth', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: mockPermissions,
      });
    });

    expect(useAuthStore.getState().permissions).toEqual(mockPermissions);
  });

  it('debería establecer isLoading en false al llamar setAuth', () => {
    act(() => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: mockPermissions,
      });
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('debería persistir permissions en sessionStorage cuando no están vacíos', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: mockPermissions,
      });
    });

    const stored = sessionStorage.getItem('ganatrack-auth-permissions');
    expect(stored).toBe(JSON.stringify(mockPermissions));
  });

  it('no debería persistir permissions en sessionStorage cuando están vacíos', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: [],
      });
    });

    expect(sessionStorage.getItem('ganatrack-auth-permissions')).toBeNull();
  });
});

// ============================================================================
// Tests: clearAuth (logout)
// ============================================================================

describe('auth.store — clearAuth (logout)', () => {
  beforeEach(() => {
    // Set up authenticated state first
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: mockPermissions,
      });
    });
  });

  it('debería limpiar accessToken al hacer logout', () => {
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('debería limpiar user al hacer logout', () => {
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('debería limpiar permissions al hacer logout', () => {
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    expect(useAuthStore.getState().permissions).toEqual([]);
  });

  it('debería eliminar permissions de sessionStorage al hacer logout', () => {
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    expect(sessionStorage.getItem('ganatrack-auth-permissions')).toBeNull();
  });

  it('debería restaurar isLoading a false al hacer logout', () => {
    act(() => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().clearAuth();
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

// ============================================================================
// Tests: setLoading
// ============================================================================

describe('auth.store — setLoading', () => {
  it('debería establecer isLoading en true', () => {
    act(() => {
      useAuthStore.getState().setLoading(true);
    });

    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it('debería establecer isLoading en false', () => {
    act(() => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setLoading(false);
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

// ============================================================================
// Tests: Selectores
// ============================================================================

describe('auth.store — selectores', () => {
  it('selectIsAuthenticated debería retornar false cuando no hay token', () => {
    const state = useAuthStore.getState();
    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it('selectIsAuthenticated debería retornar false cuando hay token pero no user', () => {
    act(() => {
      useAuthStore.setState({ accessToken: 'token', user: null });
    });

    const state = useAuthStore.getState();
    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it('selectIsAuthenticated debería retornar true cuando hay token y user', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token-abc-123',
        user: mockUser,
        permissions: [],
      });
    });

    const state = useAuthStore.getState();
    expect(selectIsAuthenticated(state)).toBe(true);
  });

  it('selectAccessToken debería retornar el token actual', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'my-token',
        user: mockUser,
        permissions: [],
      });
    });

    const state = useAuthStore.getState();
    expect(selectAccessToken(state)).toBe('my-token');
  });

  it('selectUser debería retornar el usuario actual', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: [],
      });
    });

    const state = useAuthStore.getState();
    expect(selectUser(state)).toEqual(mockUser);
  });

  it('selectPermissions debería retornar el array de permisos', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: mockPermissions,
      });
    });

    const state = useAuthStore.getState();
    expect(selectPermissions(state)).toEqual(mockPermissions);
  });

  it('selectHasPermission debería retornar true para permiso existente', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: ['predios:read'],
      });
    });

    const state = useAuthStore.getState();
    expect(selectHasPermission('predios:read')(state)).toBe(true);
  });

  it('selectHasPermission debería retornar false para permiso inexistente', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: ['predios:read'],
      });
    });

    const state = useAuthStore.getState();
    expect(selectHasPermission('animales:write')(state)).toBe(false);
  });

  it('selectHasPermission debería retornar true para wildcard "*"', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: ['*'],
      });
    });

    const state = useAuthStore.getState();
    expect(selectHasPermission('cualquier:permiso')(state)).toBe(true);
  });

  it('selectHasAnyPermission debería retornar true si tiene al menos un permiso', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: ['predios:read'],
      });
    });

    const state = useAuthStore.getState();
    expect(selectHasAnyPermission(['animales:read', 'predios:read'])(state)).toBe(true);
  });

  it('selectHasAnyPermission debería retornar false si no tiene ningún permiso', () => {
    act(() => {
      useAuthStore.getState().setAuth({
        accessToken: 'token',
        user: mockUser,
        permissions: ['predios:read'],
      });
    });

    const state = useAuthStore.getState();
    expect(selectHasAnyPermission(['animales:read', 'animales:write'])(state)).toBe(false);
  });
});
