# Proposal: Complete MSW Handlers

## Intent

`server.ts` imports 12 handler sets but only 2 files exist — the build fails. Additionally, 11 handler files in `tests/mocks/handlers/` are dead code (no barrel, no browser setup). This change unifies MSW infrastructure so Vitest unit tests and Playwright E2E tests both work.

## Scope

### In Scope
- Create 10 missing handler files in `src/tests/mocks/handlers/` (copy from `tests/`, adapt `*/api/v1/` → `http://localhost:3000/api/v1/`)
- Add missing auth handlers: `GET /auth/me`, `POST /auth/2fa/verify`
- Create `tests/mocks/handlers/index.ts` barrel export
- Create `tests/mocks/browser.ts` — `setupWorker` for Playwright
- Create `tests/mocks/setup.ts` — convenience `setupMocks()` function

### Out of Scope
- Changes to service mocks (`*.service.ts`, `*.mock.ts`) — separate concern
- Modifying existing handler logic in `tests/mocks/handlers/`
- MSW worker script generation (`public/mockServiceWorker.js`)

## Capabilities

### New Capabilities
- `msw-handlers-coverage`: All 12 handler modules exist in both `src/` and `tests/` paths with correct URL patterns

### Modified Capabilities
- None (no spec-level behavior changes)

## Approach

1. **Copy-paste with URL adaptation**: Each handler in `tests/mocks/handlers/` already works with `*/api/v1/...`. Copy to `src/tests/mocks/handlers/`, replace wildcard with `http://localhost:3000` to match `server.ts` pattern.

2. **Auth gap**: Add `GET /auth/me` (returns user from token) and `POST /auth/2fa/verify` (accepts tempToken + code) to existing `auth.handlers.ts` in `src/`.

3. **Barrel + setup**: `index.ts` re-exports all handlers. `browser.ts` calls `setupWorker(...)`. `setup.ts` exports `setupMocks()` that configures server for Vitest.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/tests/mocks/handlers/animales.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/servicios.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/config.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/imagenes.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/productos.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/roles.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/usuarios.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/maestros.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/reportes.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/notificaciones.handlers.ts` | New | Copy from tests/, adapt URL |
| `src/tests/mocks/handlers/auth.handlers.ts` | Modified | Add GET /me, POST /2fa/verify |
| `tests/mocks/handlers/index.ts` | New | Barrel export |
| `tests/mocks/browser.ts` | New | setupWorker for E2E |
| `tests/mocks/setup.ts` | New | setupMocks convenience |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| URL pattern divergence causes drift between src/ and tests/ handlers | Medium | Document that src/ uses absolute URLs, tests/ uses wildcards. Both are valid MSW patterns. |
| Missing handler types in tests/ (reportes, notificaciones) have no seed data | Low | Both files already exist with full seed data. |
| Auth handler additions break existing login tests | Low | New handlers are additive (GET /me, POST /2fa/verify) — login/logout/refresh unchanged. |

## Rollback Plan

Delete the 10 new handler files in `src/tests/mocks/handlers/`, revert `auth.handlers.ts` additions, delete `tests/mocks/handlers/index.ts`, `browser.ts`, `setup.ts`. `server.ts` already imports these names — rollback means server.ts won't compile (same as current state).

## Dependencies

- None — all required shared types (`@ganatrack/shared-types`) already imported in existing handlers.

## Success Criteria

- [ ] `server.ts` compiles with all 12 handler imports resolved
- [ ] `tests/mocks/handlers/index.ts` exports all 11 handler sets
- [ ] `tests/mocks/browser.ts` creates a valid `setupWorker` instance
- [ ] `tests/mocks/setup.ts` exports a `setupMocks()` function
- [ ] Auth handlers cover: login, logout, refresh, me, 2fa/verify
