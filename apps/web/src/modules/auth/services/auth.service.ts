// apps/web/src/modules/auth/services/auth.service.ts
/**
 * Auth Service — interface + factory.
 *
 * Provides a swap between MockAuthService (dev with NEXT_PUBLIC_USE_MOCKS=true)
 * and RealAuthService (production).
 *
 * All auth operations go through this service interface.
 */

import type {
  LoginRequest,
  LoginResponse,
  Verify2FARequest,
  AuthResponse,
  RefreshResponse,
  User,
  Predio,
} from '@ganatrack/shared-types';

// ============================================================================
// AuthService Interface
// ============================================================================

export interface AuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  verify2FA(tempToken: string, code: string): Promise<AuthResponse>;
  refreshToken(): Promise<RefreshResponse>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  getPredios(): Promise<Predio[]>;
}

// ============================================================================
// Factory
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function createMockService(): AuthService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockAuthService } = require('./auth.mock');
  return new MockAuthService();
}

function createRealService(): AuthService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealAuthService } = require('./auth.api');
  return new RealAuthService();
}

/**
 * Auth service singleton — mock or real based on NEXT_PUBLIC_USE_MOCKS.
 * Default to real service when env var is not set (falsy).
 */
export const authService: AuthService = USE_MOCKS
  ? createMockService()
  : createRealService();
