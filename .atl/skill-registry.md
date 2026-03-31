# Skill Registry — ganatrack

Generated: 2026-03-30
Project: ganatrack

## User-Level Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| branch-pr | Creating a PR, opening a PR, preparing changes for review | ~/.config/opencode/skills/branch-pr/SKILL.md |
| issue-creation | Creating a GitHub issue, reporting a bug, requesting a feature | ~/.config/opencode/skills/issue-creation/SKILL.md |
| judgment-day | "judgment day", "review adversarial", "dual review", "juzgar", "que lo juzguen" | ~/.config/opencode/skills/judgment-day/SKILL.md |
| go-testing | Writing Go tests, using teatest, adding test coverage | ~/.config/opencode/skills/go-testing/SKILL.md |
| skill-creator | Creating new AI skills, adding agent instructions, documenting patterns | ~/.config/opencode/skills/skill-creator/SKILL.md |

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

## Project-Level Conventions

| File | Location | Purpose |
|------|----------|---------|
| AGENTS.md | ~/.config/Claude/AGENTS.md (user-level, injected) | Agent behavior rules, personality, engram protocol |

## Notes

- No project-level `.claude/skills/`, `.agent/skills/`, or `.gemini/skills/` found
- No project-level `CLAUDE.md`, `.cursorrules`, or `GEMINI.md` found
- Go-testing skill is NOT relevant to this project (TypeScript monorepo)
