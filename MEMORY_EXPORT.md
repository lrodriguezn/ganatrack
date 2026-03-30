# Engram Memory Export — GanaTrack Project

> Export date: 2026-03-30
> Project: ganatrack
> This file captures key decisions, architecture choices, and session history.

---

## Session Summary — 2026-03-30

**Goal**: Judgment Day adversarial review of PRD_GanaTrack_Backend_Drizzle.md (v1.3.0 → v1.5.0)

### What happened
- PRD underwent 4 rounds of adversarial review (Judgment Day protocol)
- 20 total fixes applied across 3 fix iterations
- All critical issues resolved: JWT tenant isolation, bcrypt salt, 2FA tempToken, schema syntax, unique constraints, job queue, middleware flow
- Final verdict: APPROVED — both judges returned CLEAN

### Key decisions made
- JWT now includes `predioIds[]` for tenant context validation
- Schema uses `unique()` constraint for (predio_id, codigo) pairs
- 2FA uses opaque `tempToken` instead of exposing `usuarioId`
- Job queue: BullMQ + Redis for async exports
- Request flow: AuthN → TenantContext → AuthZ middleware chain

---

## Session Summary — 2026-03-16 (MVP)

**Goal**: Build GanaTrack MVP following SDD methodology

### What happened
- Full SDD cycle: proposal → specs → design → tasks → apply → verify → archive
- Phase 1-7 completed (frontend + backend integration)
- Frontend: React 19 + TypeScript, Dashboard, Animals, Events, Settings, MovementService
- Backend: Fastify + Drizzle + tsyringe hexagonal architecture

---

## Architecture Decisions

### Stack
- Frontend: React 19, TypeScript, Monorepo
- Backend: Node.js 20+, TypeScript 5+, Fastify 4+, Drizzle ORM, Turborepo
- DB: SQLite (dev) / PostgreSQL (prod)
- Auth: JWT + 2FA, tsyringe DI

### Key patterns established
- Hexagonal architecture (Ports & Adapters)
- Multi-tenant logical (shared DB, filtered by `predio_id`)
- Domain entities: no Drizzle/Fastify imports
- Repositories: interfaces only in domain, implementations in infrastructure

---

## PRD Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-29 | Initial PRD |
| 1.3.0 | 2026-03-29 | 15 architectural decisions applied |
| 1.4.0 | 2026-03-30 | 14 fixes post Round 1 judgment |
| 1.4.1 | 2026-03-30 | Syntax fixes (schema orphans, client.ts) |
| 1.4.2 | 2026-03-30 | usuarios_predios constraint applied |
| 1.5.0 | 2026-03-30 | APPROVED — Judgment Day passed |

---

## Observations (chronological)

1. **PRD v1.3.0**: Multi-tenant with `predio_id` discriminator, tsyringe DI chosen over manual/Awilix
2. **PRD v1.4.0**: 6 CRITICAL + 8 WARNING fixed (Round 1)
3. **PRD v1.4.1**: Schema syntax errors fixed (orphaned fields, dual imports)
4. **PRD v1.4.2**: Final constraint applied, approved

---

*This file was auto-generated from Engram persistent memory.*
*To update: run the export again after significant sessions.*
