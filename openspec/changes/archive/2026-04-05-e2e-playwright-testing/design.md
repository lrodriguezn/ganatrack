# Design: E2E Testing con Playwright

## Technical Approach

Implementar infraestructura de testing E2E usando Playwright con fixtures de autenticación basados en `storageState`. Laauth state se inyecta via API login + cookies (refresh token), evitando UI para login en cada test. Se reutiliza la MSW existente(12 handler modules) y se estructura en 10 archivos de test para los flujos críticos del PRD.

## Architecture Decisions

### Decision: Auth Fixture con storageState

**Choice**: Login via API en `globalSetup`, persistir estado en `storageState` JSON.
**Alternatives**: (1) Login via UI en beforeEach (lento), (2) Mock del auth store Zustand (frágil).
**Rationale**: `storageState` es el patrón oficial de Playwright para auth state reuse. Alimenta cookies y localStorage/sessionStorage automáticamente. El refresh token va en cookie httpOnly (prod) o mock (dev), permitiendo rehidratación del estado.

### Decision: Credenciales E2E en MSW Handlers

**Choice**: Usar credenciales definidas en `auth.handlers.ts`: `admin@ganatrack.com`/`password123` (direct), `2fa@ganatrack.com` (2FA).
**Alternatives**: (1) Usar credenciales del mock service (`Admin123!`), (2) Crear credenciales separadas para E2E.
**Rationale**: Los handlers E2E ya están configurados. Evitar discrepancias entre handlers y producción. Mantener simplicidad.

### Decision: Page Objects Selecionados

**Choice**: Crear Page Objects solo para flujos complejos (Animales CRUD, Servicios Wizard). Flujos simples usan inline locators.
**Alternatives**: (1) Page Objects para todo (overkill), (2) Solo inline locators (código duplicado).
**Rationale**: Balance entre mantenibilidad y pragmatismo. Los flujos CRUD y wizard tienen múltiples pasos que se repiten; crear PO reduce duplicación. Login y navegación simple no lo necesitan.

### Decision: Browser Matrix Reducido

**Choice**: Chromium (CI primary), Firefox (CI smoke), WebKit (local only). Mobile como proyectos separados con viewport emulation.
**Alternatives**: (1) Los 3 browsers en CI (lento), (2) Solo Chromium.
**Rationale**: Chromium cubre 90% del tráfico. Firefox para compatibilidad cross-browser. WebKit es costoso en CI y tiene menor adopción en desktop (pero crítico para mobile Safari). Mobile tests se ejecutan en Chromium con viewport emulation.

### Decision: MSW para Datos Mock

**Choice**: Reutilizar MSW handlers existentes. No crear backend de test separado.
**Alternatives**: (1) Mock API con json-server, (2) Swagger/OpenAPI mock server.
**Rationale**: MSW ya está configurado con 12 handlers cubriendo todas las APIs. Permite tests deterministas sin instancia de backend. Los handlers soportan `setMockLoggedInUser` para control de estado.

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Playwright Test                            │
└──────────────────────────────────────────────────────────────────┘
         │ uses                              │ uses
         ▼                                    ▼
┌─────────────────┐                ┌─────────────────┐
│  Auth Fixture   │                │   Page Object   │
│  (storageState) │                │  (optional)     │
└─────────────────┘                └─────────────────┘
         │
         │ injects
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Browser Context                               │
│  - Cookies (refresh token)                                        │
│  - sessionStorage (permissions)                                   │
│  - Zustand store hydrated via page.evaluate()                    │
└──────────────────────────────────────────────────────────────────┘
         │ requests
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     MSW Handler Network                            │
│  - authHandlers (login, 2FA, me, refresh)                        │
│  - animalesHandlers, prediosHandlers, etc.                        │
│  - State reset via beforeAll/afterEach                            │
└──────────────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/playwright.config.ts` | Modify | Añadir globalSetup, auth projects, mobile viewports, reporter config |
| `apps/web/tests/e2e/global-setup.ts` | Create |Setup script: login via API, save storageState |
| `apps/web/tests/e2e/fixtures/auth.fixture.ts` | Create | Extends test con authenticated context |
| `apps/web/tests/e2e/fixtures/twofa.fixture.ts` | Create | Fixture para flujo 2FA completo |
| `apps/web/tests/e2e/fixtures/index.ts` | Create | Barrel export de fixtures |
| `apps/web/tests/e2e/helpers/page-objects/login.po.ts` | Create | Page Object para login page |
| `apps/web/tests/e2e/helpers/page-objects/animales.po.ts` | Create | Page Object para Animales CRUD |
| `apps/web/tests/e2e/helpers/page-objects/servicios-wizard.po.ts` | Create | Page Object para wizard de servicios |
| `apps/web/tests/e2e/helpers/test-data.ts` | Create | Seed data deterministico para assertions |
| `apps/web/tests/e2e/auth.spec.ts` | Modify | Implementar login flow completo |
| `apps/web/tests/e2e/auth-2fa.spec.ts` | Create | Flujo 2FA con countdown y resend |
| `apps/web/tests/e2e/animales-crud.spec.ts` | Modify | Extender con create/update/delete states |
| `apps/web/tests/e2e/servicios-palpacion.spec.ts` | Create | Wizard 3-step de palpación |
| `apps/web/tests/e2e/servicios-parto.spec.ts` | Create | Registro de parto + link madre-cría |
| `apps/web/tests/e2e/predios.spec.ts` | Modify | Cambio de predio + cache invalidation |
| `apps/web/tests/e2e/reportes.spec.ts` | Modify | Exportación con polling |
| `apps/web/tests/e2e/batch-operations.spec.ts` | Create | Selección múltiple + acciones en lote |
| `apps/web/tests/e2e/mobile.spec.ts` | Create | Navegación responsive <768px |
| `apps/web/tests/e2e/offline.spec.ts` | Create | Offline banner + sync (PWA) |

## Interfaces / Contracts

```typescript
// apps/web/tests/e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';

export type AuthFixture = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.playwright/auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// apps/web/tests/e2e/helpers/test-data.ts
export const TEST_ANIMAL = {
  id: 1,
  codigo: 'GAN-001',
  nombre: 'Don Toro',
  estado: 'activo',
};

export const TEST_PREDIOS = [
  { id: 1, nombre: 'Finca La Esperanza' },
  { id: 2, nombre: 'Hacienda El Roble' },
];
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Auth store, hooks | Vitest + MSW (existente) |
| Integration | API hooks con react-query | Vitest + MSW |
| E2E | Flujos críticos usuario | Playwright + fixtures |
| Visual | Responsive <768px | Playwright mobile viewport |

## Migration / Rollout

No se requiere migración de datos. Los tests E2E no bloquean CI inicialmente - se configuran como `continue-on-error` hasta estabilizar.

**Fase 1**: Auth fixtures + Flake #1-2 (auth basic)
**Fase 2**: Flujos CRUD (animales, predios)
**Fase 3**: Flujos wizard (servicios)
**Fase 4**: Mobile y offline

## File Structure

```
apps/web/
├── playwright.config.ts          # Update: projects, globalSetup
├── tests/
│   ├── e2e/
│   │   ├── fixtures/
│   │   │   ├── auth.fixture.ts   # Login state reuse
│   │   │   ├── twofa.fixture.ts  # 2FA flow
│   │   │   └── index.ts          # Barrel export│   │   ├── helpers/
│   │   │   ├── page-objects/
│   │   │   │   ├── login.po.ts
│   │   │   │   ├── animales.po.ts
│   │   │   │   └── servicios-wizard.po.ts
│   │   │   └── test-data.ts
│   │   ├── global-setup.ts       # API login + storageState│   │   ├── auth.spec.ts           # Flow #1
│   │   ├── auth-2fa.spec.ts      # Flow #2
│   │   ├── animales-crud.spec.ts # Flow #3
│   │   ├── servicios-palpacion.spec.ts  # Flow #4
│   │   ├── servicios-parto.spec.ts      # Flow #5
│   │   ├── predios.spec.ts       # Flow #6
│   │   ├── reportes.spec.ts       # Flow #7
│   │   ├── batch-operations.spec.ts     # Flow #8
│   │   ├── mobile.spec.ts        # Flow #9
│   │   └── offline.spec.ts       # Flow #10
│   └── mocks/
│       └── handlers/             # Existing MSW handlers
├── .playwright/
│   └── auth/
│       ├── admin.json            # storageState for admin
│       └── operador.json         # storageState for operador
```

## Open Questions

- [x] ¿Webkit en CI o solo local? (Decision: WebKit solo local, no en CI)
- [x] ¿Video on all failures o solo en CI? (Decision: solo on failure)
- [x] ¿Paralelizar projects o secuencial? (Decision: paralelismo por proyecto)