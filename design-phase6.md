# Design: Calidad + Producción — Fase 6

## Technical Approach

Implementar el módulo de usuarios siguiendo la arquitectura existente de Screaming Architecture, y establecer infraestructura de calidad (Vitest, Playwright, Lighthouse CI, A11y, Dark Mode polish) para llevar GanaTrack a producción.

La estrategia es modular y componible: cada componente de calidad es independiente pero todos comparten configuraciones base existentes (Tailwind v4, Vitest, Playwright).

---

## Architecture Decisions

### Decision 1: Permission Matrix UI — Grid (Modules × Permissions)

**Choice**: Data Grid con filas = módulos, columnas = acciones (ver, crear, editar, eliminar)

**Alternatives considered**:
- Tree view jerárquico (módulos → acciones → sub-permisos)
- Lista de checkboxes agrupada por módulo
- Configuración JSON/code-based sin UI

**Rationale**: Grid permite visión de golpe de todos los permisos de un rol. Tree view es overkill para 11 módulos × 4 acciones = 44 celdas. Lista pierde relación cruzada. La matriz es el estándar UX para RBAC.

```
                    Ver    Crear   Editar   Eliminar
Animales           [✓]     [✓]     [✓]      [ ]
Servicios          [✓]     [✓]     [✓]      [ ]
Predios            [✓]     [✓]     [ ]      [ ]
Usuarios           [✓]     [ ]     [ ]      [ ]
```

### Decision 2: Testing Strategy — Pyramid con gates incrementales

**Choice**: Unit (hooks/services) → Component (forms/tables) → E2E (critical flows). Coverage gates incrementales: 60% initial → 80% milestone.

**Alternatives considered**:
- Coverage target 80% desde día 1
- Solo unit tests sin component/E2E
- Testing después de toda la implementación

**Rationale**: 80% inicial es impráctico para código existente sin tests. Pyramid incremental permite shipping progresivo. Los 3 niveles cubren diferentes tipos de bugs: unit = lógica, component = integración UI, E2E = flujos completos.

### Decision 3: Lighthouse CI — GitHub Action con retry

**Choice**: `lhci autorun` en GitHub Action, target `/animales` (página más compleja), thresholds PWA≥90, Perf≥80, A11y≥90.

**Alternatives considered**:
- Lighthouse manual en cada PR
- Target en página simple (`/login`)
- Thresholds más altos (>95)

**Rationale**: `/animales` es la página más compleja (tabla, filtros, paginación, imágenes). Si pasa Lighthouse ahí, las demás pasan. CI automation evita regressiones. Thresholds realistas para contenido dinámico autenticado.

### Decision 4: A11y Implementation — Systematic audit + component-level fixes

**Choice**: axe-core audit → fix critical violations → keyboard nav → aria-live announcements. Prioridad: operable > perceivable > understandable.

**Alternatives considered**:
- Solo aria-labels sin keyboard navigation
- Auditoría manual sin herramientas
- A11y completa WCAG AAA

**Rationale**: axe-core detecta ~90% de violaciones comunes. Keyboard navigation es esencial para usuarios de screen reader. WCAG 2.1 AA es el estándar legal aceptado. AAA es impráctico para MVP.

### Decision 5: Dark Mode — Pattern audit + Tailwind utilities consistency

**Choice**: Documentar patrón existente `dark:` utilities en componentes UI shared, auditar módulos uno por uno, fix inconsistencias con `dark:bg-gray-900` pattern.

**Alternatives considered**:
- Theme provider con CSS variables dinámicas
- Fix solo componentes visibles
- Reescribir dark mode desde cero

**Rationale**: El sistema ya existe (`@custom-variant dark`) y funciona. Solo necesita consistencia. CSS variables serían breaking change. Systematic audit es más eficiente que rewrite.

---

## Data Flow

### Módulo Usuarios — Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│usuario-table │───>│ useUsuarios  │───>│usuarios.svc  │───>│ ky client│
│ (React)      │    │ (useQuery)   │    │ (module)     │    │          │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────┘
       ▲                  │                                   │
       │                  ▼                                   ▼
       │             ┌──────────┐                       ┌──────────┐
       │             │ Query    │                       │ REST API │
       │             │ Cache    │                       │ /usuarios│
       │             └──────────┘                       └──────────┘
       │                  │
       │                  ▼
       └────── Render con datos cacheados

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│permisos-grid │───>│useUpdateRole │───>│PUT /roles/:id│
│ (Mutation)   │    │ (optimistic) │    │   /permisos  │
└──────────────┘    └──────────────┘    └──────────────┘
       │                    │
       │    ┌───────────────┘
       │    ▼
       │ ┌──────────┐
       │ │ Invalidate│
       │ │ roles.all │
       │ └──────────┘
       │
       ▼
  Grid se actualiza (optimistic → confirmado)
```

### Testing Infrastructure — Pipeline Flow

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  vitest    │───>│  coverage  │───>│  gates     │───>│  report    │
│  run       │    │  v8        │    │  check     │    │  html      │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
       │
       ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│  playwright│───>│  chromium  │───>│  report    │
│  run       │    │  firefox   │    │  html      │
└────────────┘    └────────────┘    └────────────┘
                         │
                         ▼
┌────────────┐    ┌────────────┐    ┌────────────┐
│  lighthouse│───>│  ci        │───>│  dashboard │
│  audit     │    │  action    │    │  scores    │
└────────────┘    └────────────┘    └────────────┘
```

---

## File Changes

### Módulo Usuarios (Nuevos)

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/modules/usuarios/types/usuarios.types.ts` | Create | Types: Usuario, Rol, Permiso, PermissionMatrix |
| `apps/web/src/modules/usuarios/services/usuarios.service.ts` | Create | API calls: CRUD usuarios, roles, permisos |
| `apps/web/src/modules/usuarios/services/usuarios.api.ts` | Create | Real API implementation (ky) |
| `apps/web/src/modules/usuarios/services/usuarios.mock.ts` | Create | MSW mock data |
| `apps/web/src/modules/usuarios/hooks/use-usuarios.ts` | Create | useQuery wrapper for list |
| `apps/web/src/modules/usuarios/hooks/use-usuario.ts` | Create | useQuery wrapper for detail |
| `apps/web/src/modules/usuarios/hooks/use-create-usuario.ts` | Create | useMutation for create |
| `apps/web/src/modules/usuarios/hooks/use-update-usuario.ts` | Create | useMutation for update |
| `apps/web/src/modules/usuarios/hooks/use-roles-permisos.ts` | Create | useQuery/mutation for roles and permissions |
| `apps/web/src/modules/usuarios/components/usuario-table.tsx` | Create | TanStack Table with search, pagination |
| `apps/web/src/modules/usuarios/components/usuario-form.tsx` | Create | React Hook Form + Zod for create/edit |
| `apps/web/src/modules/usuarios/components/usuario-detail.tsx` | Create | Detail view with tabs |
| `apps/web/src/modules/usuarios/components/roles-selector.tsx` | Create | Multi-select roles assignment |
| `apps/web/src/modules/usuarios/components/permisos-matrix.tsx` | Create | Interactive permissions grid |
| `apps/web/src/app/(dashboard)/usuarios/page.tsx` | Create | List page |
| `apps/web/src/app/(dashboard)/usuarios/nuevo/page.tsx` | Create | Create page |
| `apps/web/src/app/(dashboard)/usuarios/[id]/page.tsx` | Create | Detail page |
| `apps/web/src/app/(dashboard)/usuarios/[id]/editar/page.tsx` | Create | Edit page |

### Testing Infrastructure (Nuevos/Modificados)

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/tests/mocks/handlers/usuarios.handlers.ts` | Create | MSW handlers for usuarios, roles, permisos |
| `apps/web/src/tests/mocks/handlers/animales.handlers.ts` | Create | MSW handlers for animales |
| `apps/web/src/tests/mocks/handlers/servicios.handlers.ts` | Create | MSW handlers for servicios |
| `apps/web/src/tests/mocks/handlers/predios.handlers.ts` | Create | MSW handlers for predios (extend existing) |
| `apps/web/src/tests/mocks/handlers/maestros.handlers.ts` | Create | MSW handlers for maestros |
| `apps/web/src/tests/mocks/handlers/configuracion.handlers.ts` | Create | MSW handlers for configuracion |
| `apps/web/src/tests/mocks/handlers/productos.handlers.ts` | Create | MSW handlers for productos |
| `apps/web/src/tests/mocks/handlers/notificaciones.handlers.ts` | Create | MSW handlers for notificaciones |
| `apps/web/src/tests/mocks/handlers/reportes.handlers.ts` | Create | MSW handlers for reportes |
| `apps/web/src/tests/mocks/handlers/imagenes.handlers.ts` | Create | MSW handlers for imagenes |
| `apps/web/src/tests/mocks/handlers/index.ts` | Modify | Barrel export for all handlers |
| `apps/web/vitest.config.ts` | Modify | Add coverage thresholds |
| `apps/web/playwright.config.ts` | Modify | Add Firefox/WebKit projects |
| `apps/web/tests/e2e/usuarios.spec.ts` | Create | E2E: usuarios CRUD flow |
| `apps/web/tests/e2e/permisos.spec.ts` | Create | E2E: permissions assignment flow |
| `apps/web/tests/e2e/animales.spec.ts` | Create | E2E: animals CRUD flow |
| `apps/web/tests/e2e/servicios.spec.ts` | Create | E2E: servicios flow |
| `apps/web/tests/e2e/maestros.spec.ts` | Create | E2E: maestros CRUD flow |
| `apps/web/tests/e2e/a11y.spec.ts` | Create | E2E: accessibility audit |

### Quality Infrastructure (Nuevos)

| File | Action | Description |
|------|--------|-------------|
| `apps/web/.lighthouserc.json` | Create | Lighthouse CI configuration |
| `.github/workflows/quality.yml` | Create | CI: typecheck + lint + test + e2e + lighthouse |
| `.github/workflows/lighthouse.yml` | Create | Dedicated Lighthouse CI workflow |

### A11y & Dark Mode (Modificaciones)

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/ui/*` | Modify | Add aria-labels, focus rings, keyboard support |
| `apps/web/src/shared/components/layout/admin-sidebar.tsx` | Modify | Skip link, keyboard nav, aria-expanded |
| `apps/web/src/shared/components/ui/data-table.tsx` | Modify | Sort announcements, keyboard sort |
| `apps/web/src/shared/components/ui/modal.tsx` | Modify | Focus trap, aria-modal, aria-labelledby |
| `apps/web/src/shared/components/ui/form-field.tsx` | Modify | aria-describedby for errors, aria-invalid |
| `apps/web/src/shared/components/ui/button.tsx` | Modify | aria-disabled pattern, focus ring consistency |
| `apps/web/src/app/globals.css` | Modify | Dark mode utility classes for new components |

### Query Keys (Modificación)

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/shared/lib/query-keys.ts` | Modify | Add usuarios, roles, permisos key factories |

---

## Interfaces / Contracts

### Types — Módulo Usuarios

```typescript
// modules/usuarios/types/usuarios.types.ts

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  activo: boolean;
  ultimoAcceso: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[]; // ["animales:ver", "animales:crear", ...]
}

export interface Permiso {
  id: string;
  modulo: string;    // "animales", "servicios", etc.
  accion: string;    // "ver", "crear", "editar", "eliminar"
  descripcion: string;
}

export interface PermissionMatrix {
  [modulo: string]: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
}

// DTOs
export interface CreateUsuarioDto {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
  rolId: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  apellido?: string;
  rolId?: string;
  activo?: boolean;
}

export interface UpdatePermisosDto {
  rolId: string;
  permisos: string[];
}
```

### Service Interface

```typescript
// modules/usuarios/services/usuarios.service.ts

export interface IUsuariosService {
  list(params: PaginationParams): Promise<PaginatedResponse<Usuario>>;
  getById(id: string): Promise<ApiResponse<Usuario>>;
  create(data: CreateUsuarioDto): Promise<ApiResponse<Usuario>>;
  update(id: string, data: UpdateUsuarioDto): Promise<ApiResponse<Usuario>>;
  deactivate(id: string): Promise<ApiResponse<void>>;
  activate(id: string): Promise<ApiResponse<void>>;
  
  // Roles
  getRoles(): Promise<ApiResponse<Rol[]>>;
  getRolPermisos(rolId: string): Promise<ApiResponse<string[]>>;
  updateRolPermisos(rolId: string, permisos: string[]): Promise<ApiResponse<void>>;
}
```

### Component Props

```typescript
// Component interfaces

interface UsuarioTableProps {
  data: Usuario[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

interface UsuarioFormProps {
  defaultValues?: Partial<CreateUsuarioDto>;
  onSubmit: (data: CreateUsuarioDto) => Promise<void>;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

interface PermisosMatrixProps {
  roles: Rol[];
  permisos: Permiso[];
  selectedRole: string;
  matrix: PermissionMatrix;
  onChange: (modulo: string, accion: string, checked: boolean) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

interface RolesSelectorProps {
  roles: Rol[];
  selectedRoleId: string;
  onChange: (roleId: string) => void;
  disabled?: boolean;
}
```

---

## Testing Strategy

### Testing Matrix

| Layer | What to Test | Approach | Coverage Target |
|-------|-------------|----------|-----------------|
| **Unit** | Service functions | Mock ky via MSW, test API calls | 80% hooks, 80% services |
| **Unit** | Custom hooks | `renderHook` + MSW, test state | 80% hooks |
| **Unit** | Zustand stores | Direct store calls, assert state | 90% stores |
| **Unit** | Zod schemas | Valid/invalid data, edge cases | 100% schemas |
| **Component** | Forms (submit, validation) | RTL + userEvent, MSW responses | 70% components |
| **Component** | Tables (render, sort, filter) | RTL, mock data, test interactions | 70% components |
| **Component** | Permission Matrix (click, save) | RTL, test optimistic updates | 70% components |
| **E2E** | Auth flows (login, 2FA, logout) | Playwright, real browser | 100% critical paths |
| **E2E** | CRUD flows (each module) | Playwright, test data setup | 100% CRUD paths |
| **E2E** | Permission assignment | Playwright, admin user context | 100% perm flows |
| **E2E** | A11y audit (axe-core) | Playwright + @axe-core/playwright | Critical violations 0 |

### MSW Handlers Coverage (11/11 módulos)

| Módulo | Handler File | Endpoints Covered |
|--------|-------------|-------------------|
| auth | `auth.handlers.ts` ✅ | login, logout, refresh |
| predios | `predios.handlers.ts` ✅ | CRUD, potreros, lotes, grupos |
| usuarios | `usuarios.handlers.ts` 🔲 | CRUD, roles, permisos |
| animales | `animales.handlers.ts` 🔲 | CRUD, genealogía, cambio estado |
| servicios | `servicios.handlers.ts` 🔲 | palpaciones, inseminaciones, partos |
| maestros | `maestros.handlers.ts` 🔲 | CRUD por tipo |
| configuracion | `configuracion.handlers.ts` 🔲 | CRUD catálogos |
| productos | `productos.handlers.ts` 🔲 | CRUD productos |
| reportes | `reportes.handlers.ts` 🔲 | KPIs, reportes, exports |
| notificaciones | `notificaciones.handlers.ts` 🔲 | List, resumen, preferencias |
| imagenes | `imagenes.handlers.ts` 🔲 | Upload, list, delete |

### Playwright E2E Flows (10 total)

| Flow | Existing | Files |
|------|----------|-------|
| Login → Dashboard | ✅ | `auth.spec.ts` |
| CRUD Predios | ✅ | `predios.spec.ts` |
| CRUD Animales | 🔲 | `animales.spec.ts` |
| CRUD Usuarios | 🔲 | `usuarios.spec.ts` |
| Asignar Permisos | 🔲 | `permisos.spec.ts` |
| Palpación Grupal | 🔲 | `servicios.spec.ts` |
| CRUD Maestros | 🔲 | `maestros.spec.ts` |
| CRUD Productos | 🔲 | `productos.spec.ts` |
| Exportar Reportes | 🔲 | `reportes.spec.ts` |
| A11y Audit | 🔲 | `a11y.spec.ts` |

### Vitest Config Enhancement

```typescript
// vitest.config.ts — adiciones
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'src/tests/**',
    'src/app/**',
  ],
  // Coverage gates — incremental
  thresholds: {
    lines: 60,        // Initial: 60%
    functions: 60,
    branches: 50,
    statements: 60,
    // Per-file thresholds for critical paths
    'src/modules/*/services/**': {
      lines: 80,
      functions: 80,
    },
    'src/store/**': {
      lines: 90,
      functions: 90,
    },
  },
},
```

---

## Lighthouse CI

### Configuration

```json
// apps/web/.lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/login",
        "http://localhost:3000/animales"
      ],
      "startServerCommand": "pnpm dev",
      "startServerReadyPattern": "Ready in",
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance", "pwa", "accessibility"],
        "chromeFlags": "--disable-gpu --no-sandbox"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.80 }],
        "categories:pwa": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Optimization Strategies for Dynamic Content

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| Image optimization | `next/image` with `sizes`, `priority` for above-fold | +15 Perf |
| Code splitting | Dynamic imports for heavy components (charts, modals) | +10 Perf |
| Lazy loading | `next/dynamic` for report charts, date pickers | +8 Perf |
| Font optimization | `next/font` with `display: swap` | +5 Perf |
| Preconnect | `<link rel="preconnect">` to API domain | +3 Perf |
| Service Worker cache | Serwist precache for shell, runtime for API | +10 PWA |
| Skeleton screens | TailAdmin skeleton pattern for loading states | Perceived perf |

### Authenticated Pages Strategy

Lighthouse CI NO puede autenticarse nativamente. Estrategia:

1. **Public page** (`/login`): Test directo, scores limpios
2. **Dashboard page** (`/animales`): Usar cookie injection via Chrome flags:
   ```bash
   --disable-web-security --user-data-dir=/tmp/lighthouse
   ```
3. **Alternative**: Mock API server con datos precargados para `/animales`

**Recommended**: Test `/login` para scores reales. Usar `/animales` solo como smoke test con mock data.

---

## A11y Implementation (WCAG 2.1 AA)

### Skip Links

```typescript
// shared/components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 
                 focus:z-99999 focus:px-4 focus:py-2 focus:bg-brand-500 
                 focus:text-white focus:rounded-lg"
    >
      Saltar al contenido principal
    </a>
  );
}
```

### Focus Management

| Pattern | Where | Implementation |
|---------|-------|----------------|
| Focus trap | Modals | Radix Dialog handles natively |
| Focus restore | Modal close | Radix Dialog handles natively |
| Focus first error | Form submit | `form.setFocus(firstErrorField)` |
| Skip to main | Header | Skip link → `#main-content` |
| Roving tabindex | Table rows | `tabIndex={isSelected ? 0 : -1}` |

### Screen Reader Announcements

```typescript
// shared/hooks/use-announce.ts
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const el = document.getElementById('sr-announcer');
    if (el) {
      el.setAttribute('aria-live', priority);
      el.textContent = message;
      // Clear after announcement
      setTimeout(() => { el.textContent = ''; }, 1000);
    }
  }, []);
  return announce;
}
```

```tsx
// In layout:
<div id="sr-announcer" className="sr-only" aria-live="polite" aria-atomic="true" />
```

### A11y Checklist

| Category | Requirement | Implementation |
|----------|-------------|----------------|
| **Perceivable** | Images have alt text | `alt=""` for decorative, descriptive for content |
| **Perceivable** | Color contrast ≥ 4.5:1 | Audit all `text-gray-*` on dark backgrounds |
| **Perceivable** | Form labels | `htmlFor` on labels, `aria-label` for icon buttons |
| **Operable** | Keyboard navigation | All interactive elements focusable via Tab |
| **Operable** | Skip links | Header → Main content skip |
| **Operable** | Focus visible | Ring focus visible on all interactive elements |
| **Operable** | No keyboard traps | Modals trap focus, but can close with Esc |
| **Understandable** | Error messages | `aria-describedby` linking error to input |
| **Understandable** | Language attribute | `<html lang="es">` |
| **Understandable** | Consistent navigation | Sidebar always same structure |
| **Robust** | Valid ARIA | Audit with axe-core, fix violations |
| **Robust** | Role attributes | Semantic HTML first, ARIA as supplement |

### Component-Level A11y Fixes

| Component | Issue | Fix |
|-----------|-------|-----|
| `button.tsx` | Icon-only buttons missing label | Add `aria-label` prop required when no children |
| `data-table.tsx` | Sort buttons missing state | Add `aria-sort="ascending\|descending"` on `<th>` |
| `modal.tsx` | Missing aria attributes | Verify `aria-modal="true"`, `aria-labelledby` |
| `form-field.tsx` | Errors not linked | Add `aria-invalid`, `aria-describedby={errorId}` |
| `pagination.tsx` | Missing nav semantics | Add `<nav aria-label="Paginación">` |
| `admin-sidebar.tsx` | No keyboard nav | Add `aria-expanded`, `aria-current="page"` |
| `dropdown-menu.tsx` | Missing menu role | Verify Radix adds `role="menu"`, `role="menuitem"` |

---

## Dark Mode Polish

### Current State

El proyecto ya tiene dark mode configurado via Tailwind v4 con `@custom-variant dark (&:is(.dark *))`. Los componentes UI shared ya usan `dark:` utilities. La tarea es AUDITAR consistencia across 11 módulos.

### Systematic Approach

**Phase 1: Audit** (por módulo)
```
For each module:
1. Render component in dark mode
2. Check backgrounds, borders, text colors
3. Check contrast ratios
4. Document issues
```

**Phase 2: Fix Pattern**
```css
/* Common dark mode patterns */
dark:bg-gray-900          /* Main backgrounds */
dark:bg-gray-800          /* Card/modal backgrounds */
dark:border-gray-700      /* Borders */
dark:text-gray-300        /* Body text */
dark:text-gray-400        /* Secondary text */
dark:hover:bg-white/5     /* Hover states */
dark:placeholder-gray-500 /* Input placeholders */
```

**Phase 3: Verification**
- Visual regression test (screenshot comparison)
- axe-core dark mode audit
- Manual review all 11 modules

### Modules to Audit

| Module | Dark Mode Status | Priority |
|--------|-----------------|----------|
| auth | Assumed OK (login page) | Low |
| animales | Needs audit (complex tables) | High |
| servicios | Needs audit (forms, wizard) | High |
| predios | Needs audit (nested tables) | High |
| usuarios | Implement with dark mode from start | Critical |
| maestros | Needs audit | Medium |
| configuracion | Needs audit | Medium |
| productos | Needs audit | Medium |
| reportes | Needs audit (charts) | High |
| notificaciones | Needs audit | Medium |
| imagenes | Needs audit | Low |

---

## CI Pipeline

### GitHub Actions — Quality Workflow

```yaml
# .github/workflows/quality.yml
name: Quality Gates

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test --coverage
      - run: pnpm test:e2e
      - run: pnpm lighthouse

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            apps/web/coverage/
            apps/web/playwright-report/
            apps/web/.lighthouseci/
```

### Pre-commit Hook (Husky)

```bash
#!/bin/sh
# .husky/pre-commit
pnpm typecheck
pnpm lint
pnpm test --changed
```

---

## Migration / Rollout

### Feature Flags

```typescript
// next.config.mjs
const featureFlags = {
  usuariosModule: process.env.FEATURE_USUARIOS === 'true',
  lighthouseCI: process.env.CI === 'true',
};

// Usage in layout/sidebar:
if (featureFlags.usuariosModule) {
  // Show usuarios link in sidebar
}
```

### Rollout Plan

1. **Week 1**: Módulo usuarios (CRUD básico + tipos + services)
2. **Week 2**: Permisos matrix + MSW handlers para todos los módulos
3. **Week 3**: Playwright E2E + Lighthouse CI config
4. **Week 4**: A11y audit + fixes + dark mode polish
5. **Week 5**: Integration testing + CI pipeline + final polish

### Rollback

- Feature flag `FEATURE_USUARIOS=false` desactiva módulo
- Scripts `test:skip` para CI sin coverage enforcement
- Lighthouse workflow con `workflow_dispatch` en vez de automatic

---

## Open Questions

- [ ] Backend endpoints usuarios/roles/permisos ¿están disponibles? Dependency para implementación
- [ ] ¿Permission matrix es por rol o por usuario individual? Impacta diseño de API
- [ ] ¿Coverage gates son required checks en PR o soft gates? Impacta CI pipeline
- [ ] ¿Lighthouse corre en PR o solo en main? Tradeoff: speed vs safety
