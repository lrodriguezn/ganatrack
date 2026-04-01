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
        .json();

      return LoginResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // This should not happen with ky — ApiError is thrown for non-2xx
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async verify2FA(tempToken: string, code: string): Promise<AuthResponse> {
    try {
      const response = await apiClient
        .post('auth/2fa/verify', {
          json: { tempToken, code } satisfies Verify2FARequest,
        })
        .json();

      return AuthResponseSchema.parse(response);
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
      const response = await apiClient.get('auth/me').json();
      return UserSchema.parse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'SERVER_ERROR', 'Error del servidor');
    }
  }

  async getPredios(): Promise<Predio[]> {
    try {
      const response = await apiClient.get('predios').json();
      return PredioArraySchema.parse(response);
    } catch (error) {
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
