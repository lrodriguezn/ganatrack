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
  const mockModule = './auth.mock';
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockAuthService } = require(mockModule);
  return new MockAuthService();
}

function createRealService(): AuthService {
  const apiModule = './auth.api';
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RealAuthService } = require(apiModule);
  return new RealAuthService();
}

let _authService: AuthService | undefined;

function getService(): AuthService {
  if (!_authService) {
    _authService = USE_MOCKS ? createMockService() : createRealService();
  }
  return _authService;
}

/**
 * Auth service singleton — lazy-initialized to avoid require() during Next.js
 * static prerendering, which can fail with "Cannot find module" in App Router.
 */
export const authService: AuthService = {
  login(credentials) {
    return getService().login(credentials);
  },
  verify2FA(tempToken, code) {
    return getService().verify2FA(tempToken, code);
  },
  refreshToken() {
    return getService().refreshToken();
  },
  logout() {
    return getService().logout();
  },
  getMe() {
    return getService().getMe();
  },
  getPredios() {
    return getService().getPredios();
  },
};
