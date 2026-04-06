// apps/web/tests/mocks/handlers/sync.handlers.ts
/**
 * MSW Handlers for Sync/Offline API (Integration Tests).
 *
 * These handlers mock the sync-related API endpoints for testing:
 * - Token refresh (success and expired)
 * - Mutation replay responses (success, conflict, not found, validation, server error)
 */
import { http, HttpResponse } from 'msw';

export const syncHandlers = [
  // Successful token refresh
  http.post('*/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: { accessToken: 'new-test-token' },
    });
  }),

  // Failed token refresh (expired refresh token)
  http.post('*/api/v1/auth/refresh-expired', () => {
    return HttpResponse.json(
      { success: false, error: { code: 'REFRESH_EXPIRED', message: 'Refresh token expired' } },
      { status: 401 },
    );
  }),

  // Successful mutation replay
  http.post('*/api/v1/animales', () => {
    return HttpResponse.json({
      success: true,
      data: { id: 1, codigo: 'A001' },
    });
  }),

  // 409 Conflict response
  http.put('*/api/v1/animales/:id', ({ params }) => {
    if (params.id === '999') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'El registro fue modificado por otro usuario',
            details: { serverVersion: { nombre: 'Vaca B' } },
          },
        },
        { status: 409 },
      );
    }
    return HttpResponse.json({ success: true, data: { id: params.id } });
  }),

  // 404 Not found (entity deleted)
  http.put('*/api/v1/animales/deleted', () => {
    return HttpResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Animal no encontrado' } },
      { status: 404 },
    );
  }),

  // 400 Validation error
  http.post('*/api/v1/animales/invalid', () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El código ya existe',
          details: [{ field: 'codigo', message: 'Código duplicado' }],
        },
      },
      { status: 400 },
    );
  }),

  // 500 Server error
  http.post('*/api/v1/animales/server-error', () => {
    return HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } },
      { status: 500 },
    );
  }),
];
