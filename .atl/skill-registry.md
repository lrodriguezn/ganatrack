# Skill Registry — ganatrack

Generated: 2026-04-04
Project: ganatrack

## User-Level Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| ganatrack-conventions | ANY GanaTrack file — naming, response format, conventions | ~/.config/opencode/skills/ganatrack-conventions/SKILL.md |
| fastify-backend | Fastify routes, plugins, schemas, error handling | ~/.config/opencode/skills/fastify-backend/SKILL.md |
| drizzle-database | Drizzle ORM, schema, migrations, queries, repositories | ~/.config/opencode/skills/drizzle-database/SKILL.md |
| hexagonal-architecture | Hexagonal architecture, modules, domain, use cases, DI (tsyringe) | ~/.config/opencode/skills/hexagonal-architecture/SKILL.md |
| multi-tenant-security | Auth, JWT, RBAC, tenant context, security middleware | ~/.config/opencode/skills/multi-tenant-security/SKILL.md |
| branch-pr | Creating a PR, opening a PR, preparing changes for review | ~/.config/opencode/skills/branch-pr/SKILL.md |
| issue-creation | Creating a GitHub issue, reporting a bug, requesting a feature | ~/.config/opencode/skills/issue-creation/SKILL.md |
| judgment-day | "judgment day", "review adversarial", "dual review", "juzgar" | ~/.config/opencode/skills/judgment-day/SKILL.md |
| skill-creator | Creating new AI skills, adding agent instructions | ~/.config/opencode/skills/skill-creator/SKILL.md |
| skill-registry | "update skills", "skill registry", "actualizar skills" | ~/.config/opencode/skills/skill-registry/SKILL.md |

## SDD Skills (auto-loaded by orchestrator)

| Skill | Phase |
|-------|-------|
| sdd-init | Initialize SDD context |
| sdd-explore | Explore ideas before committing |
| sdd-propose | Create change proposal |
| sdd-spec | Write specifications |
| sdd-design | Technical design document |
| sdd-tasks | Break down into task checklist |
| sdd-apply | Implement tasks |
| sdd-verify | Validate implementation |
| sdd-archive | Archive completed change |
| sdd-onboard | Guided SDD walkthrough |

## Project-Level Conventions

| File | Location | Purpose |
|------|----------|---------|
| AGENTS.md | ~/.config/Claude/AGENTS.md (user-level, injected) | Agent behavior rules, personality, engram protocol |

## Notes

- No project-level `.claude/skills/`, `.agent/skills/`, or `.gemini/skills/` found
- No project-level `CLAUDE.md`, `.cursorrules`, or `GEMINI.md` found
- GanaTrack-specific skills (ganatrack-conventions, fastify-backend, drizzle-database, hexagonal-architecture, multi-tenant-security) are HIGH PRIORITY for backend work
- go-testing skill is NOT relevant to this project (TypeScript monorepo)
