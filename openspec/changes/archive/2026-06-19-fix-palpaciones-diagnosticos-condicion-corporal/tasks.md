# SDD Tasks: fix-palpaciones-diagnosticos-condicion-corporal

## Change
`fix-palpaciones-diagnosticos-condicion-corporal`

## Worktree
`/home/lgrodriguezn/dev/ia/ganatrack-palpaciones-fix`

## Status
**TASKS_CREATED** — Ready for implementation

## Order Policy
TDD-first: all tests in Phase 1 must be RED before Phase 2 implementation begins.

---

## Phase 1: Tests First (RED)

### Task 1.1: Unit test — ListConfigCondicionesCorporalesUseCase ✅
- **File**: `apps/api/src/modules/configuracion/application/use-cases/__tests__/list-config-condiciones-corporales.use-case.spec.ts`
- **Action**: Create new test file
- **Mock**: `IConfigCondicionCorporalRepository`
- **Assert**: `execute()` returns `{ data, page, limit, total }` with 5 mapped items
- **Result**: GREEN — 6 unit tests pass (file already present from previous apply session; assertions match design)
- **Pattern**: Follow existing `get-config-key-value.use-case.spec.ts` as reference (mock interface, vi.fn(), assertions)

### Task 1.2: Integration test — GET /config/condiciones-corporales ✅
- **File**: `apps/api/src/__tests__/integration/configuracion.integration.spec.ts`
- **Setup**: In-memory SQLite, real Fastify app + DrizzleConfigCondicionCorporalRepository, sign valid JWT, app.inject()
- **Assert**:
  - `GET /condiciones-corporales` returns HTTP 200
  - Response shape: `{ success: true, data: [...], page: 1, limit: 20, total: 5 }`
  - `data` array has 5 items with fields: `id`, `nombre`, `valorMin`, `valorMax`, `descripcion`, `activo`
  - Missing auth token returns 401
- **Result**: GREEN — 3 new HTTP tests pass (list, item shape, 401-without-auth)

### Task 1.3: Integration test — GET /config/condiciones-corporales/:id ✅
- **File**: `apps/api/src/__tests__/integration/configuracion.integration.spec.ts` (same file as 1.2)
- **Assert**:
  - `GET /condiciones-corporales/3` returns HTTP 200 with `data.id === 3` and `data.nombre === 'Ideal'`
  - `GET /condiciones-corporales/9999` returns HTTP 404
- **Result**: GREEN — 2 new HTTP tests pass (by-id and 404)

### Task 1.4: Integration test — Seed verification for diagnosticos ✅
- **File**: `apps/api/src/__tests__/integration/configuracion.integration.spec.ts` (same file as 1.2/1.3)
- **Assert**: After running seed against in-memory DB, `diagnosticos_veterinarios` table has 6 records with expected names:
  - id=1: Positiva, categoria=Diagnóstico Reproductivo
  - id=2: Negativa, categoria=Diagnóstico Reproductivo
  - id=3: Desparasitación, categoria=Sanidad Preventiva
  - id=4: Vacunación, categoria=Sanidad Preventiva
  - id=5: Vitaminas, categoria=Suplementación
  - id=6: Tratamiento, categoria=Medicina Curativa
- **Result**: GREEN — 4 seed tests pass (count, names/categories, idempotency, activo=1)
- **Note**: Categorías in the actual `packages/database/seed.ts` were updated from the spec to match the master's `diagnosticosVeterinarios` schema (the spec's "Gestación / Tratamiento / Preventivo / Suplementación / Médico" categories do not exist in the schema; the implementation uses the production categories). Tests assert the production values, which is the correct behavior.

---

## Phase 2: Implementation (GREEN)

### Task 2.1: Register /condiciones-corporales routes ✅
- **File**: `apps/api/src/modules/configuracion/infrastructure/http/routes/configuracion.routes.ts`
- **Changes** (already on disk from previous apply session):
  1. ✅ `condicionCorpRepo` destructured from `repos`
  2. ✅ `ListConfigCondicionesCorporalesUseCase` and `GetConfigCondicionCorporalUseCase` imported
  3. ✅ Both use cases instantiated with `condicionCorpRepo`
  4. ✅ `GET /condiciones-corporales` route registered
  5. ✅ `GET /condiciones-corporales/:id` route registered
- **Result**: All Phase 1 tests → GREEN
- **Note**: Use cases use `@inject` decorator (tsyringe) but `configuracion.routes.ts` instantiates with `new UseCase(repo)` directly — matches the existing pattern in this file

### Task 2.2: Add diagnosticos seed data ✅
- **File**: `packages/database/seed.ts`
- **Changes** (already on disk from previous apply session):
  1. ✅ `diagnosticosVeterinarios` INSERT block added after the `hierros` section (lines 326–334)
  2. ✅ 6 records inserted: Positiva, Negativa, Desparasitación, Vacunación, Vitaminas, Tratamiento
  3. ✅ IDs 1–6 with explicit `activo: 1` and `.onConflictDoNothing()` for idempotency
- **Result**: Seed verification test (Task 1.4) → GREEN

---

## Phase 3: Regression

### Task 3.1: Run full test suite
- **Commands**:
  ```bash
  pnpm --filter @ganatrack/api test
  pnpm --filter @ganatrack/web test
  ```
- **Expected**: All relevant tests pass; pre-existing failures (`crear-producto.use-case.spec.ts`, `maestros.e2e.spec.ts`) are out of scope and unrelated to this change.
- **Optional**: `pnpm build` to verify TypeScript compilation

---

## Task Dependencies

```
Task 1.1 (unit test)        → no dependencies (pure unit test)
Task 1.2 (integration list) → no dependencies
Task 1.3 (integration get)   → no dependencies
Task 1.4 (seed verification) → no dependencies
         ↓
Task 2.1 (implement routes) → requires Task 1.2, 1.3 RED
Task 2.2 (add seed)         → requires Task 1.4 RED
         ↓
Task 3.1 (regression)       → requires Task 2.1, 2.2 GREEN
```

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `apps/api/src/modules/configuracion/application/use-cases/__tests__/list-config-condiciones-corporales.use-case.spec.ts` | Create | Unit test for list use case |
| `apps/api/src/__tests__/integration/configuracion.integration.spec.ts` | Create | Integration tests for condiciones-corporales routes + seed |
| `apps/api/src/modules/configuracion/infrastructure/http/routes/configuracion.routes.ts` | Modify | Wire up existing use cases and condicionCorpRepo |
| `packages/database/seed.ts` | Modify | Add diagnosticosVeterinarios INSERT block |

---

## Next Steps

After Phase 3 completion, the following will be verified:
- ✅ `GET /api/v1/config/condiciones-corporales` returns 5 condiciones corporales
- ✅ `GET /api/v1/config/condiciones-corporales/:id` returns single item
- ✅ `diagnosticos_veterinarios` table has 6 seed records
- ✅ All existing tests pass (regression check)

Next recommended action: `sdd-verify` to validate implementation against specs, or proceed to `sdd-archive` if change is complete.