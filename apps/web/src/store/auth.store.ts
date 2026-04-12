// apps/web/src/store/auth.store.ts
/**
 * Auth store — memory-only Zustand store.
 *
 * IMPORTANT: accessToken MUST NEVER touch localStorage/sessionStorage/cookies.
 * The refreshToken is handled by the backend via httpOnly cookie.
 * This store holds the in-memory accessToken only.
 *
 * State shape:
 * - accessToken: string | null (memory-only)
 * - user: User | null
 * - permissions: string[] (array of "module:action" strings)
 * - isLoading: boolean (for async operations)
 * - isAuthenticated: boolean (derived: !!accessToken && !!user)
 */

import { create } from 'zustand';
import type { User, Permissions } from '@ganatrack/shared-types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  permissions: Permissions;
  isLoading: boolean;
}

interface AuthActions {
  setAuth(data: { accessToken: string; user: User; permissions: Permissions }): void;
  clearAuth(): void;
  setLoading(loading: boolean): void;
}

type AuthStore = AuthState & AuthActions;

// Initial state — all auth fields are null/empty
const initialState: AuthState = {
  accessToken: null,
  user: null,
  permissions: [],
  isLoading: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setAuth: ({ accessToken, user, permissions }) => {
    // Persist permissions and user to sessionStorage for rehydration on page refresh
    if (permissions.length > 0) {
      sessionStorage.setItem('ganatrack-auth-permissions', JSON.stringify(permissions));
    }
    if (user) {
      sessionStorage.setItem('ganatrack-auth-user', JSON.stringify(user));
    }
    set({
      accessToken,
      user,
      permissions,
      isLoading: false,
    });
  },

  clearAuth: () => {
    sessionStorage.removeItem('ganatrack-auth-permissions');
    sessionStorage.removeItem('ganatrack-auth-user');
    set(initialState);
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));

// ============================================================================
// Derived selectors (manual — Zustand v5 pattern)
// ============================================================================

/**
 * Check if user is authenticated.
 * Derives from accessToken and user presence.
 */
export const selectIsAuthenticated = (state: AuthStore): boolean =>
  !!state.accessToken && !!state.user;

/**
 * Get the current access token.
 */
export const selectAccessToken = (state: AuthStore): string | null =>
  state.accessToken;

/**
 * Get the current user.
 */
export const selectUser = (state: AuthStore): User | null =>
  state.user;

/**
 * Get user permissions array.
 */
export const selectPermissions = (state: AuthStore): Permissions =>
  state.permissions;

/**
 * Check if user has a specific permission.
 * Returns true for admin wildcard "*" or exact match.
 */
export const selectHasPermission = (permission: string) => (state: AuthStore): boolean => {
  // Admin wildcard grants all permissions
  if (state.permissions.includes('*') || state.permissions.includes('*:*')) return true;
  return state.permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions.
 */
export const selectHasAnyPermission = (permissions: string[]) => (state: AuthStore): boolean => {
  if (state.permissions.includes('*') || state.permissions.includes('*:*')) return true;
  return permissions.some((p) => state.permissions.includes(p));
};
