// apps/web/src/tests/mocks/handlers/auth.handlers.ts
/**
 * MSW v2 handlers for auth endpoints.
 * Covers: login (success, 2FA, error), logout, refresh
 */
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

// Credenciales de prueba
const VALID_EMAIL = 'admin@ganatrack.com';
const VALID_PASSWORD = 'password123';
const TWO_FA_EMAIL = '2fa@ganatrack.com';

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
];
