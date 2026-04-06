# Tasks: Coverage + Lighthouse Quality Gates

## Phase 1: Foundation (Dependencies + Scripts)

### T1.1: Add missing devDependencies
- **Description**: Add `@lhci/cli`, `wait-on`, `badge-maker` to `apps/web/package.json` devDependencies
- **Acceptance**: `pnpm install` succeeds, packages available
- **Effort**: S
- **Deps**: None

### T1.2: Add quality scripts to package.json
- **Description**: Add scripts: `quality:check`, `quality:coverage`, `quality:lighthouse`, `quality:badges`
- **Acceptance**: Scripts run without errors
- **Effort**: S
- **Deps**: T1.1

### T1.3: Verify local quality workflow
- **Description**: Run `pnpm quality:coverage` and confirm output matches expectations
- **Acceptance**: Coverage report generates, thresholds evaluated
- **Effort**: S
- **Deps**: T1.2

---

## Phase 2: Coverage Gates (Per-Module Thresholds)

### T2.1: Measure current per-module coverage
- **Description**: Run `vitest run --coverage` and record actual coverage per module
- **Acceptance**: Coverage data for all 12 modules documented
- **Effort**: S
- **Deps**: T1.3

### T2.2: Configure per-module thresholds in vitest.config.ts
- **Description**: Add `coverage.thresholds` overrides per glob pattern for each module
  - Modules at 0%: set 0% floor with TODO comment
  - shared/: set at current level (~52% lines)
  - usuarios/: set at current level (~35% lines)
  - Other modules: 0% floor with TODO
- **Acceptance**: `pnpm test:coverage` passes with new thresholds
- **Effort**: M
- **Deps**: T2.1

### T2.3: Verify CI threshold enforcement
- **Description**: Temporarily set a threshold above current to confirm CI fails, then revert
- **Acceptance**: CI fails with clear threshold error message
- **Effort**: S
- **Deps**: T2.2

---

## Phase 3: Lighthouse Mobile Configuration

### T3.1: Add mobile preset to .lighthouserc.json
- **Description**: Add mobile collect configuration with:
  - Same 6 URLs as desktop
  - Performance threshold: 0.70 (vs 0.80 desktop)
  - a11y, best-practices, seo, pwa: 0.90
  - Mobile form factor with throttling
- **Acceptance**: `.lighthouserc.json` validates, mobile config present
- **Effort**: S
- **Deps**: None

### T3.2: Add local lighthouse scripts
- **Description**: Add `lighthouse` and `lighthouse:ci` scripts for local development
- **Acceptance**: `pnpm lighthouse` runs locally (requires dev server)
- **Effort**: S
- **Deps**: T3.1

### T3.3: Update CI workflow for dual Lighthouse
- **Description**: Split lighthouse job into desktop + mobile parallel jobs in quality.yml
- **Acceptance**: Both presets run in CI, both upload reports
- **Effort**: M
- **Deps**: T3.1

---

## Phase 4: Quality Badges

### T4.1: Create badge generation script
- **Description**: Create `apps/web/scripts/generate-badges.ts` that:
  - Reads coverage-final.json for coverage %
  - Reads .lighthouseci/ for LH scores
  - Generates SVG badges using badge-maker
  - Writes to `apps/web/badges/` directory
- **Acceptance**: Script generates valid SVG badges
- **Effort**: M
- **Deps**: T1.1, T2.2

### T4.2: Generate initial badges
- **Description**: Run badge script to create initial coverage.svg, lighthouse-desktop.svg, lighthouse-mobile.svg
- **Acceptance**: SVG files exist and render correctly
- **Effort**: S
- **Deps**: T4.1

### T4.3: Add badges to README.md
- **Description**: Add badges section at top of README with relative paths to badge SVGs
- **Acceptance**: Badges render on GitHub when viewed
- **Effort**: S
- **Deps**: T4.2

---

## Phase 5: CI Improvements

### T5.1: Update .gitignore
- **Description**: Add `.lighthouseci/` to .gitignore, ensure `badges/` is tracked
- **Acceptance**: `.lighthouseci/` not in git, `badges/` tracked
- **Effort**: S
- **Deps**: None

### T5.2: Optimize CI workflow
- **Description**:
  - Parallelize lighthouse-desktop and lighthouse-mobile (both depend on build, not e2e)
  - Add badge generation step after test+coverage
  - Ensure cache: 'pnpm' on all jobs
- **Acceptance**: Workflow YAML validates, parallel jobs work
- **Effort**: M
- **Deps**: T3.3, T4.1

### T5.3: Create state.yaml
- **Description**: Create `openspec/changes/coverage-lighthouse-audit/state.yaml` with change metadata
- **Acceptance**: File exists with correct structure
- **Effort**: S
- **Deps**: None
