// apps/web/tests/mocks/handlers/auth.handlers.ts
/**
 * MSW Handlers for Auth API (E2E).
 * Covers: login, logout, refresh, me, 2fa/verify
 */
import { http, HttpResponse } from 'msw';

const VALID_EMAIL = 'admin@ganatrack.com';
const VALID_PASSWORD = 'password123';
const TWO_FA_EMAIL = '2fa@ganatrack.com';
const TWO_FA_USER = {
  id: '66666666-6666-6666-6666-666666666666',
  email: '2fa@ganatrack.com',
  nombre: 'Veterinario 2FA',
  rol: 'operario',
};

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
  // POST /api/v1/auth/login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.password !== VALID_PASSWORD) {
      return HttpResponse.json(
        { message: 'Credenciales inválidas', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      );
    }

    if (body.email === TWO_FA_EMAIL) {
      // Set pending 2FA user so subsequent verify handler can use it
      mockPending2FAUser = TWO_FA_USER;
      return HttpResponse.json({
        requires2FA: true,
        tempToken: 'temp-token-mock-2fa-xxx',
      });
    }

    if (body.email === VALID_EMAIL) {
      const user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: VALID_EMAIL,
        nombre: 'Admin Ganatrack',
        rol: 'admin',
      };
      mockLoggedInUser = user;
      return HttpResponse.json({
        accessToken: 'mock-access-token-xyz',
        user,
        permissions: ['*'],
      });
    }

    return HttpResponse.json(
      { message: 'Usuario no encontrado', code: 'INVALID_CREDENTIALS' },
      { status: 401 },
    );
  }),

  // POST /api/v1/auth/logout
  http.post('*/api/v1/auth/logout', () => {
    mockLoggedInUser = null;
    mockPending2FAUser = null;
    return HttpResponse.json({ message: 'Sesión cerrada exitosamente' });
  }),

  // POST /api/v1/auth/refresh
  http.post('*/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token-refreshed-xyz',
    });
  }),

  // GET /api/v1/auth/me
  http.get('*/api/v1/auth/me', () => {
    if (mockLoggedInUser) {
      return HttpResponse.json(mockLoggedInUser, { status: 200 });
    }
    return HttpResponse.json(
      { error: 'No autenticado' },
      { status: 401 },
    );
  }),

  // POST /api/v1/auth/2fa/verify
  http.post('*/api/v1/auth/2fa/verify', async ({ request }) => {
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
