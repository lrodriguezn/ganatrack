# Proposal: Fix Palpaciones — Diagnósticos y Condición Corporal

## Intent

Fix two infrastructure gaps blocking palpación form functionality:
1. `diagnosticosVeterinarios` table has no seed data (empty table, backend works)
2. `/condiciones-corporales` route not registered in configuracion routes

## Scope

### In Scope
- Add seed data for `diagnosticosVeterinarios` table (6 records)
- Register `/condiciones-corporales` GET route in `configuracion.routes.ts`
- Verify both fixes with TDD (strict mode enabled)

### Out of Scope
- Error swallowing fix in `palpacion-form.tsx` (noted as separate issue)

## Capabilities

### New Capabilities
None — infrastructure fixes only.

### Modified Capabilities
- `maestros-crud-fix/diagnosticos-veterinarios`: Add seed data (was empty)
- `maestros-crud-fix/configuracion`: Register condiciones-corporales route (was missing)

## Approach

**RC1 — Diagnósticos Seed:**
- Add `diagnosticosVeterinarios` INSERT to `packages/database/seed.ts`
- Use IDs 1–6 matching mock data (Positiva, Negativa, Desparasitación, Vacunación, Vitaminas, Tratamiento)
- Follow existing pattern: `db.insert(diagnosticosVeterinarios).values([...]).run()`

**RC2 — Condiciones Corporales Route:**
- Add `maestrosRoutes.get('/condiciones-corporales', ...)` to `apps/api/src/routes/configuracion.routes.ts`
- Reuse existing `listConfigCondicionesCorporalesUseCase`
- Follow same pattern as existing `/razas` and `/tipos-explotacion` routes

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/database/seed.ts` | Modified | Add diagnosticosVeterinarios INSERT |
| `apps/api/src/routes/configuracion.routes.ts` | Modified | Register `/condiciones-corporales` GET route |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Seed ID mismatch with mock | Low | Use IDs 1–6 matching mock analysis |
| Duplicate seed on re-run | Low | Use `ON CONFLICT DO NOTHING` or check existence |

## Rollback Plan

- **Seed rollback**: Delete records from `diagnosticosVeterinarios` WHERE id IN (1–6)
- **Route rollback**: Revert `configuracion.routes.ts` to remove the route registration

## Dependencies

- `listConfigCondicionesCorporalesUseCase` already exists and is imported
- `diagnosticosVeterinarios` schema already exists in `packages/database/src/schema.ts`

## Success Criteria

- [ ] `packages/database/seed.ts` inserts 6 diagnosticosVeterinarios records
- [ ] `GET /condiciones-corporales` route is registered and returns data
- [ ] All tests pass (`pnpm --filter @ganatrack/web test`)
- [ ] TDD cycle completed: RED → GREEN → REFACTOR