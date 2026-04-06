# Design: Coverage +Lighthouse Quality Gates

## Technical Approach

Implement quality gates through configuration-only changes: per-module coverage thresholds in Vitest, dual Lighthouse presets (desktop/mobile), local quality scripts, and automated badge generation. The approach follows the exploration recommendation: structured quality gates with graceful thresholds for modules currently at0% coverage.

**Mapping to Proposal Phases:**
- Phase1 (Foundation) → Dependencies + scripts
- Phase 2 (Coverage Gates) → vitest.config.ts threshold overrides
- Phase 3 (Lighthouse Mobile) → Separate config files
- Phase 4 (Badge Generation) → Script + CI integration
- Phase 5 (Documentation) → README updates

---

## Architecture Decisions

### Decision: Per-Module Coverage Thresholds

**Choice**: Use Vitest `coverage.thresholds['**/path/*']` overrides with globs

**Alternatives considered**:
| Option | Tradeoff |
|--------|----------|
| Global thresholds only | Fails CI immediately(11 modules at 0%) |
| Separate vitest configs per module | High maintenance, complex orchestration |
| Coverage overrides with globs | ✅ Simple, Vitest-native, maintainable |

**Rationale**: Vitest supports threshold overrides per glob pattern. This allows setting 0% thresholds for uncovered modules while enforcing higher thresholds for tested modules. Clean rollback (remove overrides).

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    // Global baseline
    lines: 50,branches: 40, functions: 50, statements: 50,
    // Module overrides (0% for uncovered)
    '**/modules/animales/**': { lines: 0, branches: 0, functions: 0, statements: 0 },
    '**/modules/auth/**': { lines: 0, branches: 0, functions: 0, statements: 0 },
    // ... other 0% modules
    // Partially covered modules
    '**/modules/usuarios/**': { lines: 35, branches: 30, functions: 35, statements: 35 },'**/shared/**': { lines: 70, branches: 60, functions: 70, statements: 70 },
  }
}
```

---

### Decision: Lighthouse Configuration Strategy

**Choice**: Separate config files for desktop and mobile

**Alternatives considered**:
| Option | Tradeoff |
|--------|----------|
| Singleconfig with multiple presets | ✅ Lighthouse CI supports this directly |
| Separate config files | Simple, supports parallel CI jobs |
| Inline config in CI workflow | Hard to maintain, no local testing |

**Rationale**: Lighthouse CI supports multiple `collect` configurations. Use single `.lighthouserc.json` with bothdesktop and mobile presets, run via separate CI jobs for parallelism.

```json
{
  "ci": {
    "collect": [
      { "url": [...], "settings": { "preset": "desktop" } },
      { "url": [...], "settings": { "preset": "mobile" } }
    ]
  }
}
```

---

### Decision: Badge Generation Approach

**Choice**: CI-based badge generation with `badge-maker`, stored in `badges/` directory

**Alternatives considered**:
| Option | Tradeoff |
|--------|----------|
| shields.io endpoint| Requires hosted JSON, external dependency |
| GitHub Actions badges | Limited customization, no coverage data |
| `badge-maker` + local files | ✅ Full control, works offline, CI-friendly |

**Rationale**: `badge-maker` is a small dependency that generates SVGs from code. Run post-coverage and post-lighthouse, generate badges, commit to `badges/` directory. README references badges viarelative path.

---

### Decision: Local Quality Scripts Design

**Choice**: Three scripts: `quality:check`, `quality:coverage`, `quality:lighthouse`

**Rationale**: Developers need quick feedback loops before pushing. Scripts mirror CI quality gates:

| Script | Purpose | Command |
|--------|---------|---------|
| `quality:check` | Run all quality gates | `pnpm quality:coverage && pnpm quality:lighthouse` |
| `quality:coverage` | Coverage with thresholds | `vitest run --coverage` |
| `quality:lighthouse` | Local Lighthouse run | `lhci autorun` (requires running dev server) |

---

## Data Flow

```
Developer commits → CI Pipeline
                        │
                        ├── typecheck (parallel)
                        ├── lint (parallel)
                        └── test → coverage report → badge generation
                                │
                                └── e2e (depends on test)
                                        │
                                        ├── lighthouse-desktop (parallel)
                                        └── lighthouse-mobile (parallel)
                                                │
                                                └── badges committed to badges/
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/package.json` | Modify | Add `@lhci/cli`, `wait-on`, `badge-maker` as devDependencies; add quality scripts |
| `apps/web/vitest.config.ts` | Modify | Add per-module coverage threshold overrides |
| `apps/web/.lighthouserc.json` | Modify | Add mobile preset alongside desktop |
| `apps/web/scripts/generate-badges.ts` | Create | Badge generation script |
| `badges/coverage.svg` | Create | Coverage badge (auto-generated) |
| `badges/lighthouse-desktop.svg` | Create | Desktop Lighthouse badge |
| `badges/lighthouse-mobile.svg` | Create | Mobile Lighthouse badge |
| `README.md` | Modify | Add quality badges section |
| `.github/workflows/quality.yml` | Modify | Split lighthouse into parallel jobs, add badge generation step |
| `.gitignore` | Modify | Ignore `.lighthouseci/` but track `badges/` |

---

## Interfaces / Contracts

### Coverage Thresholds Contract

```typescript
// apps/web/vitest.config.ts - threshold structure
interface CoverageThresholds {
  // Global minimum (baseline)
  global: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  // Per-module overrides
  overrides: Record<string, {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  }>;
}
```

### Badge Generation Script Interface

```typescript
// apps/web/scripts/generate-badges.ts
interface BadgeConfig {
  label: string;
  value: string;
  color: 'brightgreen' | 'green' | 'yellowgreen' | 'yellow' | 'orange' | 'red';
}

function generateBadge(config: BadgeConfig): string; // Returns SVG content
function writeBadge(filename: string, svg: string): void;
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Config | Coverage thresholds enforced | Run `vitest --coverage` with intentional threshold failure |
| Config | Lighthouse assertions pass | Run `lhci autorun` locally with both presets |
| Unit | Badge script generates valid SVG | Unit test with mock coverage JSON |
| Integration | CI pipeline runs end-to-end | Push to branch, verify all jobs pass |
| E2E | Quality scripts work locally | Manual: `pnpm quality:check` |

---

## Migration / Rollout

**No database migration required** — this is configuration-only.

### Rollout Steps
1. Add dependencies (safe, no breaking changes)
2. Add vitest threshold overrides (CI may fail initially)
3. Add Lighthouse mobile preset (parallel to desktop)
4. Add badge generation script
5. Wire badge generation into CI
6. Update README

### Rollback Plan
```bash
# 1. Revert vitest.config.ts to global thresholds
git revert <commit>

# 2. Remove mobile preset from lighthouserc
# 3. Remove badge generation from CI workflow
# 4. Revert package.json changes
```

---

## Open Questions

- [ ] Should badge generation commit directly to main, or create a PR artifact?
- [ ] What coverage baseline values should we start with per module? (Exploration shows current_coverage for shared/~52%, usuarios/~39%, others 0%)
- [ ] Should mobile Lighthouse thresholds be automatically 10% lower, or independently configured?