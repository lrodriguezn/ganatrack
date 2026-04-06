# Exploration: Coverage + Lighthouse Audit for GanaTrack Frontend

## Current State

### Test Coverage Infrastructure
- **Framework**: Vitest 2.1.9 with v8 coverage provider
- **Configuration**: `apps/web/vitest.config.ts`
- **Current Thresholds**: 
  - Lines: 80%
  - Branches: 70%
  - Functions: 80%
  - Statements: 80%
- **Reporters**: text, json, html
- **Test Files**: 59 unit/component tests
- **Source Files**: 339 non-test files
- **Coverage Output**: `apps/web/coverage/` (exists with HTML report)

### Coverage Distribution (Major Gaps Identified)
| Module | Test Files | Source Files | Coverage Status |
|--------|------------|--------------|-----------------|
| animales | 0 | 17 | ❌ No tests |
| auth | 0 | 11 | ❌ No tests |
| configuracion | 0 | 10 | ❌ No tests |
| imagenes | 0 | 16 | ❌ No tests |
| maestros | 0 | 13 | ❌ No tests |
| notificaciones | 0 | 15 | ❌ No tests |
| predios | 0 | 28 | ❌ No tests |
| productos | 0 | 16 | ❌ No tests |
| reportes | 0 | 19 | ❌ No tests |
| servicios | 0 | 33 | ❌ No tests |
| usuarios | 7 | 18 | ⚠️ Partial (39%) |
| **shared/** | ~52 tests | ~100 files | ✅ Mostly covered |

**Critical Finding**: 11 modules have ZERO unit tests. Only `shared/` and `usuarios/` have test coverage.

### Lighthouse CI Configuration
- **Config**: `apps/web/.lighthouserc.json`
- **URLs Tested**: 6 (login, dashboard, animales, predios, usuarios, sincronizacion)
- **Device**: Desktop only (no mobile)
- **Assertions**:
  - Performance: 80 (warn)
  - Accessibility: 90 (error)
  - Best Practices: 90 (error)
  - SEO: 90 (error)
  - PWA: 90 (error)
  - CLS: <0.1 (warn)
  - LCP: <2500ms (warn)
  - TTI: <3800ms (warn)
  - TBT: <200ms (warn)

### CI Pipeline (`.github/workflows/quality.yml`)
| Job | Dependencies | Issues |
|-----|--------------|--------|
| typecheck | none | ✅ Working |
| lint | none | ✅ Working |
| test | typecheck, lint | ✅ Working |
| e2e | test | ✅ Working (57 tests, 18 spec files) |
| lighthouse | e2e | ⚠️ Needs `wait-on`, `@lhci/cli` installed globally |
| a11y | e2e | ⚠️ Only runs Playwright tests, no axe-core integration |

### E2E Testing (Playwright)
- **Config**: `apps/web/playwright.config.ts`
- **Browsers**: Chromium, Firefox, Mobile Chrome, Mobile Safari
- **Test Files**: 18 spec files
- **Total Tests**: 57 E2E tests
- **Projects**: 4 browser configurations
- **Missing**: axe-core accessibility tests

### Missing Dependencies
The following packages are NOT in `apps/web/package.json` but are needed:

| Package | Purpose | Current Status |
|---------|---------|----------------|
| `@lhci/cli` | Lighthouse CI CLI | Installed globally in CI only |
| `wait-on` | Wait for server to start | Used in CI but not in devDependencies |
| `@axe-core/react` | React accessibility testing | ❌ Missing |
| `@axe-core/playwright` | E2E accessibility testing | ❌ Missing |
| `badge-maker` | Coverage badge generation | ❌ Missing |
| `lighthouse` | Local Lighthouse runs | ❌ Missing |
| `budget.json` | Performance budgets | ❌ Missing |

### Scripts Gap Analysis
Current scripts in `apps/web/package.json`:
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

**Missing Scripts**:
- `test:a11y` - Run axe-core accessibility tests
- `test:lighthouse` - Run Lighthouse locally
- `test:quality` - Run all quality checks
- `coverage:report` - Generate coverage badges
- `coverage:open` - Open coverage report

## Affected Areas

### Configuration Files
- `apps/web/vitest.config.ts` — Add module-specific coverage thresholds
- `apps/web/.lighthouserc.json` — Add mobile preset, more URLs
- `apps/web/playwright.config.ts` — Add axe-core integration
- `apps/web/package.json` — Add devDependencies and scripts
- `.github/workflows/quality.yml` — Add caching, parallelization, PR comments

### Source Code
- `apps/web/src/modules/*/components/` — 11 modules need component tests
- `apps/web/src/modules/*/hooks/` — Custom hooks need testing
- `apps/web/src/modules/*/services/` — API services need mocking tests
- `apps/web/src/app/**/page.tsx` — Page components need tests

### Documentation
- `apps/web/coverage/badges/` — New directory for badges
- `apps/web/.lighthouseci/` — Lighthouse reports (gitignored)
- `README.md` — Add quality badges

## Approaches

### Option A: Minimal Enhancement
Add only the missing dependencies and scripts for local quality runs.

**Pros:**
- Low effort (~2 hours)
- No CI changes required
- Immediate local development benefit

**Cons:**
- No coverage gap analysis
- No mobile Lighthouse
- No badge generation
- No PR integration

**Effort**: Low

### Option B: Structured Quality Gates
Add dependencies, scripts, module-level coverage thresholds, mobile Lighthouse, and local quality workflow.

**Pros:**
- Identifies coverage gaps by module
- Mobile + Desktop Lighthouse
- Local quality gate matching CI
- Badge generation ready

**Cons:**
- Moderate effort
- Requires threshold tuning
- May fail CI initially due to coverage gaps

**Effort**: Medium

### Option C: Full Quality Automation
Complete solution with PR comments, coverage delta checks, axe-core integration, performance budgets, and badge publishing.

**Pros:**
- Full automation
- PR quality gates
- Historical tracking
- Visibility via badges

**Cons:**
- High effort
- Requires GitHub App tokens
- Needs ongoing maintenance
- May slow CI significantly

**Effort**: High

## Recommendation

**Choose Option B: Structured Quality Gates** with incremental rollout:

1. **Phase 1**: Add missing dependencies + local scripts
2. **Phase 2**: Add module-specific coverage thresholds (start at current levels)
3. **Phase 3**: Add mobile Lighthouse configuration
4. **Phase 4**: Add badge generation script (manual for now)
5. **Phase 5**: CI improvements (parallelization, caching)

**Rationale**:
- Current global thresholds are meaningless with 11 modules at 0% coverage
- Local quality scripts enable developers to verify before pushing
- Mobile Lighthouse is critical for PWA (cattle management in the field)
- Option B provides structure without CI complexity

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Module thresholds will fail initially | High | Set initial thresholds at current coverage levels, incrementally raise |
| Mobile Lighthouse scores lower than desktop | Medium | Adjust thresholds or fix performance issues before enforcing |
| Adding dependencies increases install time | Low | Use pnpm dedupe, consider dev-only deps |
| CI job duration increases significantly | Medium | Parallelize jobs, cache Lighthouse results |
| axe-core integration finds many violations | Medium | Fix critical issues first, set warn-only for minor issues |
| Coverage badge generation fails in CI | Low | Generate locally, commit badges manually for now |

## Ready for Proposal

**Yes** — This exploration provides sufficient detail to create a proposal with the following focus:

1. Add local quality workflow dependencies (`wait-on`, `lighthouse`, `badge-maker`)
2. Create quality scripts in package.json
3. Add module-specific coverage thresholds to vitest.config.ts
4. Add mobile Lighthouse preset to .lighthouserc.json
5. Add badge generation script
6. Document quality workflow in README

**Estimated Implementation Time**: 4-6 hours
**Key Decision Needed**: Should we add axe-core integration now or defer to a future change?
