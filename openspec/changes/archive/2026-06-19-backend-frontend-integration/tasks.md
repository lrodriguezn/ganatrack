# Tasks: Backend-Frontend Integration

## Phase 1: Database Infrastructure

- [x] 1.1 Add `db:push` script to `packages/database/package.json` for `drizzle-kit push`
- [x] 1.2 Add `db:studio` script to `packages/database/package.json` for Drizzle Studio
- [x] 1.3 Run `pnpm db:push` in database package to create `dev.db` with all 52 tables
- [x] 1.4 Run `pnpm seed` to populate initial data (admin user, roles, catalogs)
- [x] 1.5 Verify `dev.db` file exists and has tables via `db:studio` or sqlite3 CLI

## Phase 2: Frontend Configuration

- [x] 2.1 Update `apps/web/.env.local` to set `NEXT_PUBLIC_USE_MOCKS=false`
- [x] 2.2 Verify `NEXT_PUBLIC_API_URL=http://localhost:3001` is correct
- [x] 2.3 Restart Next.js dev server to load new environment variables

## Phase 3: Service Startup

- [x] 3.1 Start backend API on port 3001 (`pnpm --filter api dev`)
- [x] 3.2 Verify backend starts without database connection errors
- [x] 3.3 Start frontend web app on port 3000 (`pnpm --filter web dev`)
- [x] 3.4 Verify frontend loads and network tab shows API calls to :3001
- [x] 3.5 Verify CORS headers are present in API responses

## Phase 4: Authentication Validation

- [x] 4.1 Login with admin credentials (`admin@ganatrack.com` / `Admin123!`)
- [x] 4.2 Verify login returns 200 with accessToken and refreshToken
- [ ] 4.3 Complete 2FA setup flow (scan QR, enter TOTP code)
- [ ] 4.4 Verify 2FA verification succeeds and returns new tokens
- [ ] 4.5 Wait for access token to expire, verify auto-refresh with refreshToken
- [ ] 4.6 Verify token rotation: new refreshToken issued, old one invalidated

## Phase 5: CRUD Operations Validation

- [x] 5.1 Create a new predator via frontend form, verify 201 response
- [x] 5.2 Read predios list, verify data matches database via Drizzle Studio
- [ ] 5.3 Update predator name, verify 200 response and UI reflects change
- [ ] 5.4 Create a new animal in predator, verify 201 response
- [ ] 5.5 Read animal details, verify all fields persist correctly
- [ ] 5.6 Update animal weight/condition, verify database reflects changes
- [ ] 5.7 Soft-delete animal (cambiar estado), verify estado changes to 'Vendido' or 'Muerto'

## Phase 6: Documentation & Cleanup

- [ ] 6.1 Add integration steps to root README.md
- [ ] 6.2 Document troubleshooting: CORS issues, port conflicts
- [ ] 6.3 Add rollback instructions: `USE_MOCKS=true` + delete `dev.db`
- [ ] 6.4 Commit all changes with message: "chore: integrate backend with frontend using SQLite"
