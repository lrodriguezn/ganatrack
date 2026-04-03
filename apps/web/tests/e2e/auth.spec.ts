// apps/web/tests/e2e/auth.spec.ts
/**
 * E2E tests for authentication flows.
 * TODO: Implement full login and 2FA flows.
 */
import { test } from '@playwright/test';

test.describe('Flujo de Autenticación', () => {
  // TODO: Flujo de login exitoso
  test.todo('debería iniciar sesión con credenciales válidas');

  // TODO: Flujo de login con error
  test.todo('debería mostrar error con credenciales inválidas');

  // TODO: Flujo de 2FA
  test.todo('debería redirigir a verificación 2FA cuando está habilitado');

  // TODO: Flujo de 2FA exitoso
  test.todo('debería completar autenticación con código 2FA válido');

  // TODO: Flujo de 2FA con error
  test.todo('debería mostrar error con código 2FA inválido');
});
