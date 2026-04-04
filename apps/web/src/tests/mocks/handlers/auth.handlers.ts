// apps/web/src/tests/mocks/handlers/auth.handlers.ts
/**
 * MSW v2 handlers for auth endpoints.
 * Covers: login (success, 2FA, error), logout, refresh, me, 2fa/verify
 */
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

// Credenciales de prueba
const VALID_EMAIL = 'admin@ganatrack.com';
const VALID_PASSWORD = 'password123';
const TWO_FA_EMAIL = '2fa@ganatrack.com';

// Estado de sesión para handlers de me y 2fa/verify
let mockLoggedInUser: {
  id: string;
  email: string;
  nombre: string;
  rol: string;
} | null = null;

let mockPending2FAUser: {
  id: string;
  email: string;
  nombre: string;
  rol: string;
} | null = null;

// Helpers para tests externos
export function setMockLoggedInUser(
  user: { id: string; email: string; nombre: string; rol: string } | null,
) {
  mockLoggedInUser = user;
}

export function setMockPending2FAUser(
  user: { id: string; email: string; nombre: string; rol: string } | null,
) {
  mockPending2FAUser = user;
}

export const authHandlers = [
  /**
   * POST /api/v1/auth/login
   * Handles three cases:
   * 1. Valid credentials → AuthResponse
   * 2. 2FA required → TwoFactorResponse
   * 3. Invalid credentials → 401
   */
  http.post(`${BASE_URL}/api/v1/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Caso 1: Credenciales inválidas
    if (body.password !== VALID_PASSWORD) {
      return HttpResponse.json(
        {
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 },
      );
    }

    // Caso 2: Usuario con 2FA habilitado
    if (body.email === TWO_FA_EMAIL) {
      return HttpResponse.json({
        requires2FA: true,
        tempToken: 'temp-token-mock-2fa-xxx',
      });
    }

    // Caso 3: Login exitoso (predeterminado)
    if (body.email === VALID_EMAIL) {
      return HttpResponse.json({
        accessToken: 'mock-access-token-xyz',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: VALID_EMAIL,
          nombre: 'Admin Ganatrack',
          rol: 'admin',
        },
        permissions: ['*'],
      });
    }

    return HttpResponse.json(
      {
        message: 'Usuario no encontrado',
        code: 'INVALID_CREDENTIALS',
      },
      { status: 401 },
    );
  }),

  /**
   * POST /api/v1/auth/logout
   * Always succeeds (cookie cleared by backend).
   */
  http.post(`${BASE_URL}/api/v1/auth/logout`, () => {
    return HttpResponse.json({ message: 'Sesión cerrada exitosamente' });
  }),

  /**
   * POST /api/v1/auth/refresh
   * Returns new access token.
   */
  http.post(`${BASE_URL}/api/v1/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token-refreshed-xyz',
    });
  }),

  /**
   * GET /api/v1/auth/me
   * Returns the currently logged-in user or 401 if not authenticated.
   */
  http.get(`${BASE_URL}/api/v1/auth/me`, () => {
    if (mockLoggedInUser) {
      return HttpResponse.json(mockLoggedInUser, { status: 200 });
    }
    return HttpResponse.json(
      { error: 'No autenticado' },
      { status: 401 },
    );
  }),

  /**
   * POST /api/v1/auth/2fa/verify
   * Verifies a 2FA code for a pending 2FA session.
   */
  http.post(`${BASE_URL}/api/v1/auth/2fa/verify`, async ({ request }) => {
    const body = await request.json() as { tempToken: string; code: string };

    if (!mockPending2FAUser) {
      return HttpResponse.json(
        { error: 'No hay sesión 2FA pendiente' },
        { status: 400 },
      );
    }

    if (body.code === '123456') {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        user: mockPending2FAUser,
        permissions: ['*:*'],
      }, { status: 200 });
    }

    return HttpResponse.json(
      { error: 'Código inválido' },
      { status: 401 },
    );
  }),
];
