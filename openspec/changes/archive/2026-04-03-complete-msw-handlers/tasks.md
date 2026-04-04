# Tasks: Complete MSW Handlers

## Phase 1: Copy handler files to src/tests/mocks/handlers/ (URL adaptation)

Copy each file from `tests/mocks/handlers/` to `src/tests/mocks/handlers/`, replacing all occurrences of `'*/api/v1/` with `` `${BASE_URL}/api/v1/` `` where `BASE_URL = 'http://localhost:3000'`. Follow the pattern in `src/tests/mocks/handlers/predios.handlers.ts` (const BASE_URL at top, template literals in URLs).

- [ ] 1.1 Create `src/tests/mocks/handlers/animales.handlers.ts` — copy from `tests/mocks/handlers/animales.handlers.ts`, adapt 8 URL patterns (`*/api/v1/` → `${BASE_URL}/api/v1/`), add `const BASE_URL = 'http://localhost:3000'`
- [ ] 1.2 Create `src/tests/mocks/handlers/servicios.handlers.ts` — copy from `tests/mocks/handlers/servicios.handlers.ts`, adapt 12 URL patterns, add BASE_URL
- [ ] 1.3 Create `src/tests/mocks/handlers/config.handlers.ts` — copy from `tests/mocks/handlers/config.handlers.ts`, adapt 1 URL pattern, add BASE_URL
- [ ] 1.4 Create `src/tests/mocks/handlers/imagenes.handlers.ts` — copy from `tests/mocks/handlers/imagenes.handlers.ts`, adapt 4 URL patterns, add BASE_URL
- [ ] 1.5 Create `src/tests/mocks/handlers/productos.handlers.ts` — copy from `tests/mocks/handlers/productos.handlers.ts`, adapt 5 URL patterns, add BASE_URL
- [ ] 1.6 Create `src/tests/mocks/handlers/roles.handlers.ts` — copy from `tests/mocks/handlers/roles.handlers.ts`, adapt 3 URL patterns, add BASE_URL
- [ ] 1.7 Create `src/tests/mocks/handlers/usuarios.handlers.ts` — copy from `tests/mocks/handlers/usuarios.handlers.ts`, adapt 6 URL patterns, add BASE_URL
- [ ] 1.8 Create `src/tests/mocks/handlers/maestros.handlers.ts` — copy from `tests/mocks/handlers/maestros.handlers.ts`, adapt 4 URL patterns, add BASE_URL
- [ ] 1.9 Create `src/tests/mocks/handlers/reportes.handlers.ts` — copy from `tests/mocks/handlers/reportes.handlers.ts`, adapt 8 URL patterns, add BASE_URL
- [ ] 1.10 Create `src/tests/mocks/handlers/notificaciones.handlers.ts` — copy from `tests/mocks/handlers/notificaciones.handlers.ts`, adapt 6 URL patterns, add BASE_URL

## Phase 2: Fix auth handlers (add missing endpoints)

- [ ] 2.1 Add `GET ${BASE_URL}/api/v1/auth/me` to `src/tests/mocks/handlers/auth.handlers.ts` — return mock user object with id, email, nombre, rol (same shape as login response user field)
- [ ] 2.2 Add `POST ${BASE_URL}/api/v1/auth/2fa/verify` to `src/tests/mocks/handlers/auth.handlers.ts` — accept `{ tempToken, code }` body, return full AuthResponse (accessToken, user, permissions) when tempToken matches `'temp-token-mock-2fa-xxx'` and code is `'123456'`, return 401 otherwise

## Phase 3: E2E infrastructure (barrel, browser worker, setup)

- [ ] 3.1 Create `tests/mocks/handlers/index.ts` — barrel export re-exporting all 11 handler sets from `tests/mocks/handlers/*.handlers.ts` (animales, servicios, config, imagenes, productos, roles, usuarios, maestros, reportes, notificaciones, predios)
- [ ] 3.2 Create `tests/mocks/browser.ts` — import `setupWorker` from `msw/browser`, import all handlers from `./handlers/index.ts`, export `const worker = setupWorker(...allHandlers)`
- [ ] 3.3 Create `tests/mocks/setup.ts` — export `setupMocks()` function that imports `server` from `src/tests/mocks/server.ts`, calls `server.listen()`, and returns cleanup function calling `server.close()` + `server.resetHandlers()` for use in Vitest `beforeEach`/`afterEach`
