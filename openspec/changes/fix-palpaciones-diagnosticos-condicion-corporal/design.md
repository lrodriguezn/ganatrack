# Design: Fix Palpaciones — Diagnósticos y Condición Corporal

## Technical Approach

Two infrastructure fixes with zero new business logic:
1. **Seed data**: Insert 6 `diagnosticos_veterinarios` records into `packages/database/seed.ts` so the palpaciones wizard and servicios veterinarios have reference data.
2. **Route registration**: Wire existing `condicionCorpRepo`, use cases, and mapper into `configuracion.routes.ts` to expose `GET /condiciones-corporales` and `GET /condiciones-corporales/:id`.

Strict TDD is enforced: write RED tests first, then make them pass.

## Architecture Decisions

### Decision: Seed Data Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Insert raw SQL | Bypasses Drizzle types, harder to maintain | Reject |
| `db.insert(...).values([...]).onConflictDoNothing()` | Type-safe, idempotent, matches existing pattern | **Adopt** |
| Separate seed file | Adds complexity for 6 rows | Reject |

Rationale: The codebase already uses Drizzle `.onConflictDoNothing()` for every seed block. Following the same pattern keeps seed re-runnable and type-safe.

### Decision: Route Registration Pattern

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Manual DI in routes file | Simple, no container setup, matches current razas/tipos-explotacion pattern | **Adopt** |
| tsyringe injection in routes | Overkill for a GET-only registration; existing routes use manual instantiation | Reject |
| Add controller layer | Existing simple routes skip controllers; adding one breaks consistency | Reject |

Rationale: `configuracion.routes.ts` already instantiates use cases manually (lines 34-37). Copying the `/razas` pattern exactly minimizes surprise and keeps the file consistent.

### Decision: Test Order (Strict TDD)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Write tests first | Slower initial step, guarantees coverage, required by `strict_tdd: true` | **Adopt** |
| Write implementation first | Faster locally, violates project convention | Reject |

Rationale: `openspec/config.yaml` enables `strict_tdd_mode`. All tests must be RED before implementation turns them GREEN.

### Decision: Diagnosticos ID Assignment

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Positiva=1, Negativa=2, then Desparasitación, Vacunación, Vitaminas, Tratamiento (3-6) | Matches palpaciones mock expectations; creates minor mismatch with servicios.mock.ts IDs 1-4 | **Adopt** |
| Keep servicios.mock.ts IDs (Vitaminas=1, Desparasitación=2, Tratamiento=3, Vacunación=4) | Breaks palpaciones mock (Positiva must be 1) | Reject |
| Use auto-increment IDs | Unpredictable, breaks all mock expectations | Reject |

Rationale: The palpaciones form explicitly expects `Positiva=1` and `Negativa=2`. The 6 records unify both domains into one master table; frontend mocks that reference different IDs for the same numeric keys will need alignment in a follow-up change.

## Data Flow

```
HTTP GET /api/v1/config/condiciones-corporales
  → Fastify route handler
    → authMiddleware (JWT validation)
      → ListConfigCondicionesCorporalesUseCase
        → DrizzleConfigCondicionCorporalRepository.findAll()
          → SQLite
        → ConfigCondicionCorporalMapper.toResponse()
    → JSON response { success: true, data, page, limit, total }
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/database/seed.ts` | Modify | Add `diagnosticosVeterinarios` INSERT block (6 records) after hierros section, before admin user section |
| `apps/api/src/modules/configuracion/infrastructure/http/routes/configuracion.routes.ts` | Modify | Import use cases, destructure `condicionCorpRepo`, instantiate use cases, register two GET routes |
| `apps/api/src/__tests__/integration/configuracion.integration.spec.ts` | Create | Integration tests: `GET /config/condiciones-corporales` returns 5 items; `GET /config/condiciones-corporales/:id` returns specific item; seed verification asserts diagnosticos table has 6 rows |
| `apps/api/src/modules/configuracion/application/use-cases/__tests__/list-config-condiciones-corporales.use-case.spec.ts` | Create | Unit test: mock repo, verify execute returns mapped data with correct pagination shape |

## Interfaces / Contracts

No new interfaces or contracts. Reuse existing:
- `IConfigCondicionCorporalRepository` (already wired in `ConfigRepos`)
- `ListConfigCondicionesCorporalesUseCase` / `GetConfigCondicionCorporalUseCase` (already implemented)
- `ConfigCondicionCorporalResponseDto` (already defined)

API response shape follows existing convention:
```json
{
  "success": true,
  "data": [{ "id": 1, "nombre": "Muy delgado", "valorMin": 1, "valorMax": 1, "descripcion": "...", "activo": 1 }],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `ListConfigCondicionesCorporalesUseCase.execute` | Vitest, mock `IConfigCondicionCorporalRepository`, assert mapped output and pagination fields |
| Integration | `GET /api/v1/config/condiciones-corporales` and `/:id` | Spin up in-memory SQLite, seed, hit route via Fastify inject or fetch; assert 200 and data shape |
| Integration | Seed verification | Run seed script against `:memory:` DB, query `diagnosticos_veterinarios`, assert 6 rows with expected names |
| E2E | None | Deferred — no UI flow changes in this change |

## Migration / Rollout

No migration required. Seed uses `.onConflictDoNothing()`, so re-running is safe. Rollback: delete records WHERE `id IN (1,2,3,4,5,6)` or revert the two modified files.

## Open Questions

- [ ] **servicios.mock.ts mismatch**: The mock maps `diagnosticosVeterinariosId` differently (1=Vitaminas, 2=Desparasitación) than the new seed (1=Positiva, 2=Negativa). Should the frontend mocks be updated now or in a separate change?
- [ ] **palpacion-form.tsx catch block**: Explicitly out of scope per proposal. Create a follow-up issue for error swallowing fix.
