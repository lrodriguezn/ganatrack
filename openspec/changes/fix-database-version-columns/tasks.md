# Tasks: fix-database-version-columns

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900 (mostly single-file deletion of 797 lines) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | auto-forecast |
| Decision needed before apply | No |
| Chained PRs recommended | No |
| Chain strategy | pending |
| 400-line budget risk | Low |

The high line count is almost entirely the deletion of `push-schema.ts` (797 lines). The active implementation work is minimal: delete 1 file, update 1 archive doc, add 1 doc section.

### Phase 1: Investigation & Planning

- [x] 1.1 Confirm `drizzle.config.ts` schema path and migration folder are correct for SQLite
- [x] 1.2 Verify existing migrations `0000` and `0001` are syntactically valid SQL files
- [x] 1.3 Confirm no other code references `push-schema.ts` beyond the archive report

### Phase 2: Implementation

- [x] 2.1 Delete `packages/database/push-schema.ts` from the repository
- [x] 2.2 Update `openspec/changes/backend-frontend-integration/archive-report.md` to remove push-schema references and note drizzle-kit is now the source of truth
- [x] 2.3 Create `docs/database-migrations.md` documenting the standard workflow: `db:generate` → `db:migrate` (or `db:push` for local dev)

### Phase 3: Verification

- [x] 3.1 Run `pnpm --filter @ganatrack/database db:push` against a fresh SQLite file and verify all tables are created
- [x] 3.2 Run `SELECT version FROM animales` and `SELECT version FROM servicios_palpaciones_grupal` to confirm the 5 version columns exist
- [x] 3.3 Verify no remaining references to `push-schema.ts` in any `package.json` scripts, READMEs, or onboarding docs

### Phase 4: Cleanup

- [x] 4.1 Commit deletion of `push-schema.ts` with conventional commit
- [x] 4.2 Update or remove any developer onboarding notes that mention `push-schema.ts` (none found — only SDD artifacts reference it)