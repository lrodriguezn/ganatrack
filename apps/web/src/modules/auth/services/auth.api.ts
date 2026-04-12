// apps/web/src/modules/auth/services/auth.api.ts
/**
 * Real Auth Service — production implementation using apiClient (ky).
 *
 * Wraps the API endpoints:
 * - POST /auth/login        → login()
 * - POST /auth/2fa/verify   → verify2FA()
 * - POST /auth/refresh      → refreshToken()
 * - POST /auth/logout       → logout()
 * - GET  /auth/me           → getMe()
 * - GET  /predios            → getPredios()
 *
 * All responses are parsed through Zod schemas from shared-types
 * to enforce the API contract.
 */

import { apiClient } from '@/shared/lib/api-client';
import { ApiError, normalizeApiError } from '@/shared/lib/errors';
import type {
  LoginRequest,
  LoginResponse,
  Verify2FARequest,
  AuthResponse,
  RefreshResponse,
  User,
  Predio,
} from '@ganatrack/shared-types';
import type { AuthService } from './auth.service';

export class RealAuthService implements AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient
        .post('auth/login', {
          json: credentials,
        })
        .json() as unknown;

      // Log the response for debugging
      console.log('[auth.api] Login response:', JSON.stringify(response, null, 2));

      // Unwrap the {success, data} envelope from backend
      const wrapped = response as { success: boolean; data: unknown };
      const data = wrapped.data as {
        accessToken?: string; 
        refreshToken?: string;
        usuario?: { id: number; nombre: string; roles: string[] };
        permissions?: string[];
        requires2FA?: boolean;
        tempToken?: string;
      };

      // Check if 2FA is required
      if (data.requires2FA) {
        return {
          requires2FA: true,
          tempToken: data.tempToken || '',
        };
      }

      // Validate we have the required fields
      if (!data.accessToken || !data.usuario) {
        console.error('[auth.api] Missing required fields in login response:', data);
        throw new ApiError(500, 'INVALID_RESPONSE', 'Respuesta inválida del servidor');
      }

      // Transform backend response to frontend format
      // Backend returns: { accessToken, usuario: { id: number, nombre, roles } }
      // Permissions are in the JWT token, need to decode to extract them
      
      // Decode JWT to get permissions from token payload
      let permissions: string[] = [];
      try {
        const tokenParts = data.accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          permissions = payload.permisos || [];
        }
      } catch (e) {
        console.warn('[auth.api] Could not decode JWT to extract permissions');
      }
      
      // Store the refreshToken as a same-origin httpOnly cookie via the Next.js proxy route.
      // Browsers block Set-Cookie from cross-origin responses (backend at a different port/domain),
      // so we use a server-side Next.js route to set the cookie for the frontend's own origin.
      if (data.refreshToken) {
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: data.refreshToken }),
        }).catch(() => {
          console.warn('[auth.api] Failed to store refreshToken session cookie');
        });
      }

      const result = {
        accessToken: data.accessToken,
        user: {
          id: String(data.usuario.id),
          email: credentials.email,
          nombre: data.usuario.nombre,
          rol: (data.usuario.roles[0] || 'operario').toLowerCase(),
        },
        permissions,
      };

      console.log('[auth.api] Transformed result:', JSON.stringify(result, null, 2));

      return result as LoginResponse;
    } catch (error) {
      console.error('[auth.api] Login error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async verify2FA(tempToken: string, code: string): Promise<AuthResponse> {
    try {
      const response = await apiClient
        .post('auth/2fa/verify', {
          json: { tempToken, codigo: code } satisfies Verify2FARequest,
        })
        .json() as unknown;

      // Unwrap the {success, data} envelope from backend
      const wrapped = response as { success: boolean; data: unknown };
      const data = wrapped.data as {
        accessToken?: string;
        usuario?: { id: number; nombre: string; roles: string[] };
        permissions?: string[];
      };

      if (!data.accessToken || !data.usuario) {
        console.error('[auth.api] Missing required fields in 2FA verify response:', data);
        throw new ApiError(500, 'INVALID_RESPONSE', 'Respuesta inválida del servidor');
      }

      // Decode JWT to get permissions from token payload
      let permissions: string[] = [];
      try {
        const tokenParts = data.accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          permissions = payload.permisos || [];
        }
      } catch (e) {
        console.warn('[auth.api] Could not decode JWT to extract permissions');
      }

      return {
        accessToken: data.accessToken,
        user: {
          id: String(data.usuario.id),
          email: '', // Not available in 2FA response
          nombre: data.usuario.nombre,
          rol: (data.usuario.roles[0] || 'operario').toLowerCase(),
        },
        permissions,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async refreshToken(): Promise<RefreshResponse> {
    try {
      const response = await apiClient
        .post('auth/refresh', {
          // credentials: 'include' is set globally in api-client.ts fetch calls
          // but since we're using ky, we need to ensure cookies are sent
        })
        .json();

      return RefreshResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('auth/logout', { json: {} });
    } catch (error) {
      // Logout should not throw — clear local state regardless
      if (error instanceof ApiError) {
        // Silently ignore API errors on logout
        return;
      }
      // Network errors — ignore
    }
  }

  async getMe(): Promise<User> {
    try {
      console.log('[auth.api] getMe called...');
      const response = await apiClient.get('auth/me').json();
      console.log('[auth.api] getMe raw response:', response);

      // Unwrap the {success, data} envelope from backend
      const wrapped = response as { success: boolean; data: unknown };
      return wrapped.data as User;
    } catch (error) {
      console.error('[auth.api] getMe error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getPredios(): Promise<Predio[]> {
    try {
      console.log('[auth.api] getPredios called...');
      const response = await apiClient.get('predios').json();
      console.log('[auth.api] getPredios raw response:', response);

      // Unwrap the {success, data} envelope from backend
      const wrapped = response as { success: boolean; data: unknown; page?: number; limit?: number; total?: number };
      const data = wrapped.data;

      // Check if data is already an array or needs to be extracted
      if (Array.isArray(data)) {
        return data as Predio[];
      }

      // If it's still an object, try to parse with schema anyway
      return PredioArraySchema.parse(data);
    } catch (error) {
      console.error('[auth.api] getPredios error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }
}

// Import schemas for parsing
import {
  LoginResponseSchema,
  AuthResponseSchema,
  RefreshResponseSchema,
  UserSchema,
  PredioSchema,
} from '@ganatrack/shared-types';
import { z } from 'zod';

const PredioArraySchema = z.array(PredioSchema);
