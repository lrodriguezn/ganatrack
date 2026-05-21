# Proposal: Remove Dangerous push-schema.ts and Adopt drizzle-kit Migrations

## Intent

`packages/database/push-schema.ts` is a manual workaround that creates a broken SQLite schema. It deletes the existing database (`unlinkSync`), then creates 31 of 42 tables with wrong or missing columns, causing runtime "no such column" errors (including the `version` columns required for optimistic locking). The correct schema already exists in Drizzle migrations (`0000_organic_peter_quill.sql`, `0001_polite_punisher.sql`). We will eliminate the dangerous script and use `drizzle-kit` as the single source of truth for schema management.

## Scope

### In Scope
- **Delete** `packages/database/push-schema.ts` entirely
- Verify `drizzle-kit` and `drizzle.config.ts` are correctly configured for SQLite
- Confirm existing migrations (`0000`, `0001`) apply cleanly via `drizzle-kit push`
- Update any `package.json` scripts or docs that reference `push-schema.ts`
- Add migration workflow documentation for developers

### Out of Scope
- Modifying Drizzle schema definitions or migration SQL files
- Changes to application code (entities, use cases, routes, frontend)
- New features or capability changes

## Capabilities

### New Capabilities
None — this is a bugfix/infrastructure cleanup.

### Modified Capabilities
None — spec-level behavior does not change.

## Approach

1. **Remove the broken script**
   - Delete `packages/database/push-schema.ts`
   - Remove any documentation, README references, or onboarding steps that mention it

2. **Validate drizzle-kit is the sole schema tool**
   - `packages/database/package.json` already has `db:push`, `db:migrate`, `db:generate`, `db:studio` via `drizzle-kit`
   - `drizzle.config.ts` already points to `./src/schema/index.ts` and `./migrations`
   - Run `drizzle-kit push` against a fresh SQLite file to verify it creates the correct schema (including `version` columns on all 5 tables)

3. **Add developer documentation**
   - Document the standard workflow: `db:generate` → `db:migrate` (or `db:push` for dev)
   - Note that `db:push` is for local dev only; production-like environments must use migrations

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/database/push-schema.ts` | **Removed** | Dangerous manual script — deleted entirely |
| `packages/database/drizzle.config.ts` | Verified | Already correct; no changes needed |
| `packages/database/migrations/` | Verified | Existing `0000` + `0001` are source of truth; no changes needed |
| `packages/database/package.json` | Verified | Scripts use `drizzle-kit` already; no changes needed |
| Developer docs / README | Modified | Replace push-schema instructions with drizzle-kit workflow |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Developer has local `dev.db` created by old `push-schema.ts` | High | Communicate that they must delete `dev.db` and run `db:migrate` or `db:push` once |
| `drizzle-kit push` behaves differently on some Node versions | Low | Test on current Node version; CI will catch regressions |
| Onboarding docs still reference deleted script | Med | Audit all docs as part of this change |

## Rollback Plan

1. Restore `push-schema.ts` from git history if absolutely needed.
2. However, the script is fundamentally broken — the real fix is to use `drizzle-kit`. No rollback to the broken script is recommended.

## Dependencies

None.

## Success Criteria

- [ ] `packages/database/push-schema.ts` no longer exists in the repo.
- [ ] `drizzle-kit push` against a fresh SQLite file creates all 42 tables with correct columns (including `version` on `animales`, `servicios_palpaciones_grupal`, `servicios_inseminacion_grupal`, `servicios_partos_animales`, `servicios_veterinarios_grupal`).
- [ ] `SELECT version FROM animales` succeeds on a fresh database.
- [ ] `SELECT version FROM servicios_palpaciones_grupal` succeeds on a fresh database.
- [ ] No documentation, scripts, or onboarding steps reference `push-schema.ts`.
