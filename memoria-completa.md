# Memoria GanaTrack - Exportado desde Engram

> Exportado: 2026-04-14
> Proyecto: ganatrack
> Total observaciones: 412

---

## 1. Resumen del Proyecto

**GanaTrack** es una aplicación de gestión ganadera (cattle management) multi-tenant construida como un monorepo Turborepo + pnpm.

### Estado Actual (Abril 2026)

| Componente | Estado | Detalles |
|------------|--------|----------|
| Backend | COMPLETO ✅ | 11 módulos implementados, 52 tests, Judgment Day passed |
| Frontend | PARCIAL ⚠️ | 11 módulos con estructura, 59 tests, faltan PWA offline y E2E |
| Openspec | ACTIVO | Múltiples cambios archivados |

### Módulos Implementados (Backend)

1. Auth (JWT, 2FA, refresh tokens)
2. Usuarios
3. Predios
4. Animales
5. Servicios
6. Configuración
7. Maestros (8 entidades: Veterinarios, Propietarios, Hierros, Diagnósticos, etc.)
8. Imágenes
9. Productos
10. Reportes
11. Notificaciones

---

## 2. Stack Tecnológico

### Backend (apps/api)

- **Framework**: Fastify v5
- **Runtime**: Node.js con tsx watch (ESM)
- **ORM**: Drizzle ORM v0.45.2
- **Databases**: SQLite (better-sqlite3) dev, PostgreSQL prod
- **Auth**: JWT (@fastify/jwt), bcrypt, speakeasy (2FA)
- **DI**: tsyringe con reflect-metadata
- **Validation**: Zod + zod-to-json-schema

### Frontend (apps/web)

- **Framework**: Next.js 15.1.6 (App Router)
- **UI**: React 18.3.1, Tailwind CSS v4, Radix UI
- **State**: Zustand (global), React Query v5 (server)
- **Forms**: React Hook Form + Zod resolver
- **HTTP Client**: ky
- **PWA**: Serwist

### Paquetes Compartidos

- `@ganatrack/database`: Drizzle schema, migrations, seed
- `@ganatrack/shared-types`: TypeScript types + Zod schemas
- `@ganatrack/tsconfig`: Shared TypeScript config

---

## 3. Convenciones del Proyecto

### Nombrado

- camelCase: DTOs, variables, funciones
- kebab-case: nombres de archivo (features)
- PascalCase: componentes React
- snake_case: base de datos
- I-prefix: interfaces

### Respuestas HTTP

Formato estándar con paginación:
```json
{ "success": true, "data": [...], "meta": { "page": 1, "total": 100 } }
```

### Git

- Conventional commits
- No "Co-Authored-By" attribution

---

## 4. Decisiones de Arquitectura

### Arquitectura Hexagonal (Backend)

```
apps/api/src/modules/{feature}/
├── domain/          # Entidades, servicios de dominio
├── application/    # Casos de uso (use cases)
└── infrastructure/  # Mappers, persistencia, rutas HTTP
```

### Validación de Predio (Two-Layer Defense)

Implementada validación en dos capas para evitar que usuarios accedan a páginas sin tener un predio seleccionado:

1. **Layer 1**: Flag `requiresPredio` en `NavItem` → estado visual deshabilitado en sidebar
2. **Layer 2**: Hook `usePredioRequerido()` → redirect a `/dashboard/predios` si no hay predio activo

### Patrones Frontend

- Feature modules bajo `apps/web/src/modules/{feature}/`
- Compartidos bajo `apps/web/src/shared/`
- TanStack Query con claves centralizadas

---

## 5. Session Summaries (Trabajos Realizados)

### S1: Validación de Predio Seleccionado (Completado ✅)

**Goal**: Implementar validación de selección de predio en dos capas

**Trabajo realizado**:
- Flag `requiresPredio` en navigation.config.ts
- Sidebar disabled state
- Route guard hook `usePredioRequerido()`
- 34 páginas con el hook
- Tests para hook y store

**Resultado**:
- Commit: 3487e52
- PR #5 mergeado
- Rama local eliminada

---

### S2: Fix Maestros CRUD (Completado ✅)

**Goal**: Arreglar bugs de integración en módulo Maestros - desalineación de campos, paginación desconectada, código muerto, tests incompletos

**Trabajo realizado**:
- SDD completo: explore → spec → design → tasks → apply → verify → archive
- 5 entity pages corregidas: alineación de campos
- Pagination conectada full-stack
- Código muerto removido (310 líneas)
- E2E tests añadidos (401 líneas)
- TypeScript fixes: activo, success wrapper
- Mock soft delete implementado

**Resultado**:
- PR creado y mergeado a master
- Worktree eliminado

---

### S3: Fix Predios Module Integration (Completado ✅)

**Goal**: Arreglar integración Backend-Frontend para el módulo Predios

**Problemas encontrados**:
- Backend retornaba `{success, data}` pero frontend esperaba array directo
- Backend usaba `areaHectareas` pero frontend usaba `hectares`
- Rutas eran planas (`/predios/potreros`) en lugar de RESTful (`/predios/:predioId/potreros`)

**Fixes aplicados**:
- predios.api.ts: unwrap de respuestas API
- predios.routes.ts: rutas RESTful con :predioId
- predios.mapper.ts: mapping areaHectareas → hectares

---

### S4: Fix Animales Integration (Completado ✅)

**Goal**: Verificar integración backend + frontend para API de animales

**Problemas encontrados**:
- Backend usa `predioIds` del JWT (array), no `predioId` único
- Query params del frontend en snake_case pero backend espera camelCase
- Endpoints de genealogía, historial, estadísticas NO implementados en backend

**Fixes aplicados**:
- CRUD completo verificado y funcionando
- Query params corregidos de snake_case a camelCase
- Uso de `activoPredioId` desde JWT en lugar de hardcoded 0

**Credenciales**: admin@ganatrack.com / Admin123!

---

### S5: Diagnóstico Maestros CRUD (Incompleto ⚠️)

**Goal**: Diagnosticar por qué el frontend no guardaba nuevos registros de maestros

**Hallazgos**:
- Error 500: FOREIGN KEY constraint failed - X-Predio-Id header no se enviaba
- Typo en api-client.ts: `preddioStore` variable no definida
- Endpoints usaban `/veterinarios` pero backend espera `/maestros/veterinarios`

**Estado**: Worktree eliminado sin aplicar cambios - necesita approach más cuidadoso

---

## 6. Bugs Resueltos

### Bug 1: SW StaleWhileRevalidate bloqueaba actualización de tabla maestros

**Problema**: La tabla de Veterinarios (y todos los maestros) no se actualizaba después de POST/PUT/DELETE porque el Service Worker interceptaba el GET de revalidación y devolvía la respuesta cacheada (stale).

**Solución**: Revisar estrategia de cache del SW en `sw.ts` - regla #5 usaba `StaleWhileRevalidate`.

---

### Bug 2: tenantContextMiddleware faltante en rutas Hierros y Propietarios

**Problema**: Sin `tenantContextMiddleware`, `getPredioId(request)` devuelve 0 (fallback hardcodeado). Al hacer POST/PUT, el use case parchaba con ID=0.

**Solución**: Agregado `tenantContextMiddleware` a todos los métodos (GET, GET/:id, POST, PUT, DELETE) de Hierros y Propietarios en `maestros.routes.ts`.

---

## 7. PRs y Commits Relevantes

| Fecha | Descripción | Link |
|-------|-------------|------|
| 2026-04-12 | validacion-predio-seleccionado PR mergeado | PR #5 |
| 2026-04-12 | Fix revision-de-maestros mergeado | - |
| 2026-04-07 | Fix predios integration | - |
| 2026-04-07 | Fix animales integration | - |

---

## 8. Pendientes (Faltantes según PRD)

### Frontend

- ✅ PWA/Serwist completo (service worker, background sync) - Parcial
- ❌ Testing E2E Playwright (10 flujos críticos) - Necesario
- ❌ i18n (next-intl) - Necesario
- ❌ Coverage push a targets - Necesario
- ❌ Dark mode polish - Necesario
- ❌ Lighthouse audit - Necesario

### Openspec

- fase5-notificaciones-backend: solo tiene proposal (no implementada)
- backend-foundation: no archivado

---

## 9. Notas Técnicas Importantes

### Problemas Conocidos

1. **Typo en api-client.ts**: Usa `preddioStore` variable que no está definida
2. **Endpoints incorrectos**: Frontend usa `/veterinarios` pero backend espera `/maestros/veterinarios`
3. **X-Predio-Id header**: No se envía desde el frontend
4. **Backend espera array**: `predioIds` del JWT (no `predioId` único)

### Testing

- Strict TDD Mode: ACTIVADO
- Test runner: `pnpm test` (vitest)
- Patterns: `*.spec.ts` (api), `*.test.tsx` (web)

---

## 10. Configuración de Desarrollo

### Variables de Entorno

```
# Backend (apps/api)
DATABASE_URL=./dev.db
JWT_SECRET=...
NODE_ENV=development

# Frontend (apps/web)
NEXT_PUBLIC_API_URL=http://localhost:3001
USE_MOCKS=false
```

### Puertos

- API: 3001
- Web: 3000

### Credenciales

- Email: admin@ganatrack.com
- Password: Admin123!

---

*Documento generado automáticamente desde Engram - 2026-04-14*