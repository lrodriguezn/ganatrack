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

### Task 1.1: Unit test — ListConfigCondicionesCorporalesUseCase
- **File**: `apps/api/src/modules/configuracion/application/use-cases/__tests__/list-config-condiciones-corporales.use-case.spec.ts`
- **Action**: Create new test file
- **Mock**: `IConfigCondicionCorporalRepository`
- **Assert**: `execute()` returns `{ data, page, limit, total }` with 5 mapped items
- **Expected result**: RED — use case exists but route not registered (test targets the use case layer directly, not the route)
- **Pattern**: Follow existing `get-config-key-value.use-case.spec.ts` as reference (mock interface, vi.fn(), assertions)

### Task 1.2: Integration test — GET /config/condiciones-corporales
- **File**: `apps/api/src/__tests__/integration/configuracion.integration.spec.ts`
- **Action**: Create new integration test file (or add to existing if found)
- **Setup**: In-memory SQLite, seed `configCondicionesCorporales` (5 records)
- **Assert**:
  - `GET /config/condiciones-corporales` returns HTTP 200
  - Response shape: `{ success: true, data: [...], page: 1, limit: 20, total: 5 }`
  - `data` array has 5 items with fields: `id`, `nombre`, `valorMin`, `valorMax`, `descripcion`, `activo`
- **Expected result**: RED — route not registered yet

### Task 1.3: Integration test — GET /config/condiciones-corporales/:id
- **File**: `apps/api/src/__tests__/integration/configuracion.integration.spec.ts` (same file as 1.2)
- **Assert**:
  - `GET /config/condiciones-corporales/3` returns HTTP 200
  - Response shape: `{ success: true, data: { id: 3, nombre: "Ideal", ... } }`
  - ID matches requested ID
- **Expected result**: RED — route not registered yet

### Task 1.4: Integration test — Seed verification for diagnosticos
- **File**: `apps/api/src/__tests__/integration/configuracion.integration.spec.ts` (same file as 1.2/1.3)
- **Assert**: After running seed against in-memory DB, `diagnosticos_veterinarios` table has 6 records with expected names:
  - id=1: Positiva, categoria=Gestación
  - id=2: Negativa, categoria=Gestación
  - id=3: Desparasitación, categoria=Tratamiento
  - id=4: Vacunación, categoria=Preventivo
  - id=5: Vitaminas, categoria=Suplementación
  - id=6: Tratamiento, categoria=Médico
- **Expected result**: RED — no seed data exists yet

---

## Phase 2: Implementation (GREEN)

### Task 2.1: Register /condiciones-corporales routes
- **File**: `apps/api/src/modules/configuracion/infrastructure/http/routes/configuracion.routes.ts`
- **Changes**:
  1. Destructure `condicionCorpRepo` from `repos` (line 32 — currently unused)
  2. Import `ListConfigCondicionesCorporalesUseCase` and `GetConfigCondicionCorporalUseCase`
  3. Instantiate both use cases with `condicionCorpRepo`
  4. Register `GET /condiciones-corporales` route (list) — follow pattern of `/razas` route (lines 40-47)
  5. Register `GET /condiciones-corporales/:id` route (get by id) — follow pattern of `/razas/:id` route (lines 49-55)
- **Run tests**: All Phase 1 tests → GREEN
- **Note**: Use cases use `@inject` decorator (tsyringe) but existing `configuracion.routes.ts` instantiates with `new UseCase(repo)` directly — follow existing pattern in this file

### Task 2.2: Add diagnosticos seed data
- **File**: `packages/database/seed.ts`
- **Changes**:
  1. Add `diagnosticosVeterinarios` INSERT block after the `hierros` section (after line 324, before `console.log`)
  2. Insert 6 records: Positiva, Negativa, Desparasitación, Vacunación, Vitaminas, Tratamiento
  3. Use IDs 1-6 with explicit `activo: 1` and `.onConflictDoNothing()` for idempotency
- **Run tests**: Seed verification test (Task 1.4) → GREEN

---

## Phase 3: Regression

### Task 3.1: Run full test suite
- **Commands**:
  ```bash
  cd /home/lgrodriguezn/dev/ia/ganatrack-palpaciones-fix && pnpm --filter @ganatrack/api test
  pnpm --filter @ganatrack/web test
  ```
- **Assert**: All tests pass with exit code 0
- **Optional**: Run `pnpm build` to verify TypeScript compilation

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