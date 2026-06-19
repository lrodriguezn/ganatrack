# Proposal: Backend-Frontend Integration with SQLite

## Intent

Enable real end-to-end functionality by connecting the completed frontend (Next.js + React) with the completed backend (Fastify + Drizzle + SQLite). This is the first integration step to validate the full system works before PostgreSQL migration and production deployment. Currently, frontend runs with mock services; backend has no database file.

## Scope

### In Scope

- Add Drizzle CLI scripts to `packages/database/package.json` (`db:push`, `db:studio`)
- Create SQLite database file (`dev.db`) with all 52 tables via `drizzle-kit push`
- Execute seed script (admin user, roles, catalogs)
- Configure frontend `.env.local` with `USE_MOCKS=false`
- Start backend (port 3001) and frontend (port 3000)
- Validate auth flow (login, 2FA, JWT refresh)
- Validate CRUD operations for core modules (predios, animales)
- Document integration steps in project README

### Out of Scope

- Production migration files (Not needed for dev SQLite)
- PostgreSQL configuration (Future phase)
- E2E test automation (Future phase)
- Performance benchmarking (Future phase)

## Capabilities

### New Capabilities

None. This is infrastructure integration work—not a new feature.

### Modified Capabilities

None. No spec-level behavior changes. Existing specs for auth, predios, animales remain unchanged.

## Approach

**Phase 1 - Infrastructure Setup** (< 1 hour):
1. Add missing scripts to database package
2. Run `drizzle-kit push` to create tables from schema
3. Execute seed script for initial data

**Phase 2 - Service Integration** (15 min):
1. Update frontend environment config
2. Start backend first (ensures DB init completes)
3. Start frontend, verify CORS/credentials

**Phase 3 - Validation** (30 min):
1. Manual smoke tests: login → 2FA → JWT refresh
2. Manual smoke tests: create/read/update/delete predios, animales
3. Document any CORS, auth, or data mapping issues

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/database/package.json` | Modified | Add db:push, db:studio scripts |
| `packages/database/dev.db` | New | SQLite database file |
| `apps/web/.env.local` | Modified | Set USE_MOCKS=false |
| Root README | Modified | Add integration section |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CORS issues between ports 3000/3001 | Low | Backend CORS configured for localhost |
| Seed script fails on constraint | Low | Script tested, uses upsert |
| Drizzle schema-drift from last migration | Med | Run drizzle-kit push creates exact tables |
| JWT secret mismatch | Low | Use shared .env values |

## Rollback Plan

1. Revert `.env.local` to `USE_MOCKS=true`
2. Delete `dev.db` file
3. Backend/frontend continue working with mocks independently

## Dependencies

- Backend modules complete (11 modules)
- Frontend mock services complete (11modules)
- Drizzle schema definitions in sync
- `pnpm install` successfully run in monorepo

## Success Criteria

- [ ] `dev.db` exists with all 52 tables
- [ ] Seed script exits with code 0
- [ ] Backend starts on port 3001 without errors
- [ ] Frontend login succeeds with admin credentials
- [ ] 2FA flow completes (setup + verification)
- [ ] JWT refresh works (token rotation)
- [ ] CRUD on predios persists to SQLite
- [ ] CRUD on animales persists to SQLite
- [ ] Integration steps documented in README