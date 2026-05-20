# Proposal: Replicate Optimistic Locking to Servicios

## Intent

Replicate animales optimistic locking to 4 servicios so concurrent edits detected, rejected with 409.

## Scope

### In Scope
- Add `version` to 4 root/grupal tables in `servicios` schema
- Update entities, DTOs, mappers to include `version`
- Add `expectedVersion` check to 4 update use cases
- Add PUT routes with `If-Match`/`X-Resource-Version` headers
- Add frontend update API methods, types, conflict detection

### Out of Scope
- Frontend update UI/forms (no update UI exists yet)
- Wiring `ServiciosController` dead code (separate refactor)
- Fixing `predioId = 0` hardcoding (separate issue)

## Capabilities

### New Capabilities
- `servicios-optimistic-locking`: Backend version check and `If-Match` contract for 4 services

### Modified Capabilities
- `servicios-veterinarios`: Update requires `If-Match`; response includes `version`
- `servicios-grupal-wizard`: Update for palpaciones/inseminaciones requires version
- `servicios-offline`: PUT queue items store version metadata

## Approach

Follow the animales pattern: add `version INTEGER NOT NULL DEFAULT 1` to root tables; extend entities and update use cases with `expectedVersion` (throw `VersionConflictError` on mismatch); update mappers, repos, DTOs; add PUT routes reading `If-Match` and returning `X-Resource-Version`; add frontend update API methods and types.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/database/src/schema/servicios.ts` | Modified | Add `version` to 4 root tables |
| `apps/api/src/modules/servicios/*/domain/` | Modified | Add `version` to 4 entities |
| `apps/api/src/modules/servicios/*/application/` | Modified | Add `expectedVersion` to 4 use cases |
| `apps/api/src/modules/servicios/*/infrastructure/` | Modified | Mappers, repos, DTOs, schemas |
| `apps/api/src/.../routes/servicios.routes.ts` | Modified | Add PUT routes with `If-Match` |
| `apps/web/src/modules/servicios/servicios.api.ts` | Modified | Add update methods + version |
| `apps/web/src/modules/servicios/servicios.types.ts` | Modified | Add `version` to event types |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `txManager` in partos/veterinarios complicates version increment | Med | Version bump inside same transaction |
| `ServiciosController` dead code causes confusion | Low | Do NOT wire it; document in tracker |
| No frontend update forms to test end-to-end | Med | API-level unit tests; defer UI testing |

## Rollback Plan

1. Revert Drizzle migration (drop `version` columns).
2. Revert use case, mapper, repository, route changes.
3. Revert frontend API/type changes.
4. Services return to GET/POST-only behavior.

## Dependencies

- Issue #36 (base optimistic locking on animales) — completed.

## Success Criteria

- [ ] All 4 root tables have `version` column with default 1.
- [ ] `GET` responses include `X-Resource-Version` header.
- [ ] `PUT` with mismatched `If-Match` returns 409 with `VERSION_CONFLICT`.
- [ ] `PUT` with matching `If-Match` succeeds and returns incremented `X-Resource-Version`.
- [ ] Frontend update API methods send correct `If-Match`.
- [ ] Frontend types include `version` on all 4 service event types.
