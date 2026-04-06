# Delta Spec: Coverage + Lighthouse Quality Gates

## Purpose

Establish automated quality gates for GanaTrack frontend production readiness: per-module coverage thresholds, dual (desktop + mobile) Lighthouse auditing, quality badge generation, and CI pipeline enforcement. Current state: 17% coverage, 11 modules at 0%, Lighthouse desktop-only.

---

## Domain: quality-coverage-gates

### Requirement: Per-Module Coverage Thresholds

The system MUST define individual coverage thresholds for each of the 12 business modules in `vitest.config.ts`. Thresholds MUST be set at CURRENT coverage levels (not aspirational) to avoid immediate CI failures on adoption. Modules with 0% coverage MUST have a 0% floor with a TODO comment indicating the target. Each module MUST specify thresholds for: lines, branches, functions, and statements.

#### Scenario: Module with existing coverage has threshold set

- GIVEN a module has measured coverage (e.g., `usuarios` at 39%)
- WHEN the coverage threshold is configured for that module
- THEN the threshold MUST be set at or below the current measured level
- AND all four metrics (lines, branches, functions, statements) MUST be specified

#### Scenario: Module with zero coverage gets floor threshold

- GIVEN a module has 0% test coverage (e.g., `animales`, `auth`, `predios`)
- WHEN the coverage threshold is configured for that module
- THEN the threshold MUST be set to 0% for all metrics
- AND a TODO comment MUST indicate the future target threshold

#### Scenario: Shared utilities have separate thresholds

- GIVEN the `shared/` directory contains cross-cutting utilities with ~52 tests
- WHEN coverage thresholds are defined
- THEN `shared/` MUST have its own threshold block separate from business modules
- AND the threshold MUST reflect the current measured coverage level

#### Scenario: Global fallback threshold remains

- GIVEN per-module thresholds are defined
- WHEN a source file does not match any module pattern
- THEN the global fallback threshold (lines: 80, branches: 70, functions: 80, statements: 80) MUST still apply
- AND the global threshold MUST NOT be removed

#### Scenario: Module pattern matching covers all source files

- GIVEN the 12 business modules: animales, auth, configuracion, imagenes, maestros, notificaciones, predios, productos, reportes, servicios, usuarios, and shared
- WHEN coverage patterns are defined in vitest.config.ts
- THEN every source file under `src/modules/` MUST match at least one module pattern
- AND no source file MUST be excluded unintentionally

### Requirement: Coverage Reporting in CI

The system MUST upload coverage reports as CI artifacts after the test job completes. The coverage summary (JSON) MUST be available for downstream badge generation. The CI job MUST fail if per-module thresholds are not met.

#### Scenario: Coverage artifact uploaded on test completion

- GIVEN the test job runs `vitest run --coverage`
- WHEN the job completes (success or failure)
- THEN the `apps/web/coverage/` directory MUST be uploaded as a CI artifact
- AND the artifact MUST be retained for 30 days
- AND the upload MUST use `if: always()` to run even on failure

#### Scenario: CI fails when module threshold not met

- GIVEN a module's coverage falls below its configured threshold
- WHEN the test job runs
- THEN Vitest MUST exit with a non-zero code
- AND the CI pipeline MUST mark the job as failed
- AND the failure message MUST indicate which module and metric failed

#### Scenario: Coverage JSON available for badge generation

- GIVEN the coverage reporter includes `json` format
- WHEN the test job completes
- THEN `coverage/coverage-final.json` MUST exist in the artifact
- AND the JSON MUST contain per-file coverage data for badge computation

---

## Domain: lighthouse-audit-pipeline

### Requirement: Mobile Lighthouse Configuration

The system MUST run Lighthouse audits against both desktop and mobile presets. The mobile preset MUST use the same 6 URLs as the desktop preset. Mobile performance thresholds MUST be set at 0.70 (vs 0.80 for desktop). All other category thresholds (accessibility, best-practices, SEO, PWA) MUST remain at 0.90 for both presets.

#### Scenario: Mobile preset audits same URLs as desktop

- GIVEN the 6 URLs: /login, /dashboard, /dashboard/animales, /dashboard/predios, /dashboard/usuarios, /dashboard/sincronizacion
- WHEN the mobile Lighthouse preset runs
- THEN all 6 URLs MUST be audited with mobile form factor
- AND the same URL list MUST be reused from the desktop configuration

#### Scenario: Mobile performance threshold is lower

- GIVEN the mobile preset is configured
- WHEN Lighthouse assertions are evaluated
- THEN the performance category minimum MUST be 0.70 (not 0.80)
- AND accessibility, best-practices, SEO, and PWA MUST remain at 0.90

#### Scenario: Mobile throttling is applied

- GIVEN the mobile preset runs
- WHEN Lighthouse collects metrics
- THEN CPU and network throttling MUST be applied per Lighthouse mobile defaults
- AND the formFactor MUST be set to "mobile"

#### Scenario: Desktop preset remains unchanged

- GIVEN the mobile preset is added
- WHEN the desktop preset runs
- THEN all existing desktop thresholds MUST remain as currently configured
- AND desktop performance threshold MUST stay at 0.80

#### Scenario: Both presets run in CI

- GIVEN the CI pipeline triggers the lighthouse job
- WHEN Lighthouse CI autorun executes
- THEN both desktop and mobile presets MUST be executed
- AND the job MUST fail if either preset's error-level assertions fail

### Requirement: Local Lighthouse Workflow

The system MUST provide npm scripts for running Lighthouse locally and in CI mode. Local runs MUST save reports to `.lighthouseci/` directory. The CI script MUST match the behavior of the GitHub Actions lighthouse job.

#### Scenario: Local Lighthouse run with single command

- GIVEN the developer runs `pnpm lighthouse` from the web app directory
- WHEN the command executes
- THEN the app MUST be built and served locally
- AND Lighthouse MUST run against the local server
- AND reports MUST be saved to `.lighthouseci/` directory

#### Scenario: CI-matching Lighthouse script

- GIVEN the developer runs `pnpm lighthouse:ci`
- WHEN the command executes
- THEN it MUST replicate the CI job behavior (build, serve, audit, assert)
- AND the same assertion thresholds MUST apply as in CI

#### Scenario: Lighthouse reports are gitignored

- GIVEN the `.lighthouseci/` directory contains generated reports
- WHEN the developer commits changes
- THEN the `.lighthouseci/` directory MUST be excluded from git
- AND the directory MUST be created automatically on first run

---

## Domain: quality-badges

### Requirement: Quality Badge Generation

The system MUST generate SVG badges for coverage percentage and Lighthouse scores. Badges MUST be placed in `apps/web/coverage/badges/` directory. A script MUST exist to regenerate badges from latest test/Lighthouse results. The README.md MUST display the generated badges.

#### Scenario: Coverage badge generated from vitest output

- GIVEN the coverage JSON report exists after `pnpm test:coverage`
- WHEN the badge generation script runs
- THEN an SVG badge MUST be created showing the overall coverage percentage
- AND the badge MUST be saved to `apps/web/coverage/badges/coverage.svg`
- AND the badge color MUST reflect the coverage level (red <50%, yellow <75%, green >=75%)

#### Scenario: Lighthouse badge generated from LH CI results

- GIVEN the Lighthouse CI results exist in `.lighthouseci/`
- WHEN the badge generation script runs
- THEN an SVG badge MUST be created showing the Lighthouse performance score
- AND the badge MUST be saved to `apps/web/coverage/badges/lighthouse.svg`
- AND the badge MUST reflect the desktop performance score

#### Scenario: Badges displayed in README

- GIVEN the badges exist in `apps/web/coverage/badges/`
- WHEN the README.md is viewed on GitHub
- THEN the badges MUST be visible in the repository header section
- AND the badge images MUST use relative paths that resolve in the repo

#### Scenario: Badge regeneration script is idempotent

- GIVEN badges already exist from a previous run
- WHEN the badge regeneration script runs again
- THEN the existing badges MUST be overwritten with updated values
- AND the script MUST NOT fail if badges already exist
- AND the script MUST NOT fail if no previous badges exist

---

## Domain: ci-pipeline

### Requirement: CI Pipeline Improvements

The system MUST install `@lhci/cli` and `wait-on` as devDependencies in `apps/web/package.json` (not globally in CI). The CI workflow MUST cache the pnpm store to reduce install time. Independent CI jobs SHOULD be parallelized where dependency chains allow.

#### Scenario: Missing devDependencies are installed locally

- GIVEN `@lhci/cli` and `wait-on` are not in `apps/web/package.json`
- WHEN the dependency installation step runs
- THEN both packages MUST be added to `devDependencies`
- AND `pnpm install` MUST succeed without global installs

#### Scenario: pnpm store is cached in CI

- GIVEN the CI workflow runs on GitHub Actions
- WHEN the setup-node step executes
- THEN the pnpm store MUST be cached using `cache: 'pnpm'`
- AND subsequent runs MUST use the cached store when lockfile is unchanged

#### Scenario: Lighthouse job depends on build, not e2e

- GIVEN the lighthouse job needs a running server
- WHEN the CI pipeline is triggered
- THEN the lighthouse job MUST depend on the build step completing
- AND the lighthouse job SHOULD run in parallel with e2e tests when possible (both only need build)

#### Scenario: Coverage artifact available for downstream jobs

- GIVEN the test job produces coverage reports
- WHEN a downstream job needs coverage data (e.g., badge generation)
- THEN the coverage artifact MUST be downloadable via `actions/download-artifact`
- AND the artifact name MUST be `coverage-report`

---

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | All 12 modules have per-module thresholds in vitest.config.ts | Config review |
| AC-02 | Zero-coverage modules have 0% floor with TODO comment | Config review |
| AC-03 | Coverage reports uploaded as CI artifacts | CI run inspection |
| AC-04 | CI fails when any module is below its threshold | Intentional threshold test |
| AC-05 | Mobile Lighthouse preset configured with 0.70 performance | .lighthouserc.json review |
| AC-06 | Same 6 URLs used for both desktop and mobile | .lighthouserc.json review |
| AC-07 | `pnpm lighthouse` script works locally | Manual execution |
| AC-08 | `pnpm lighthouse:ci` script matches CI behavior | Script comparison |
| AC-09 | Coverage badge generated as SVG | File existence check |
| AC-10 | Lighthouse badge generated as SVG | File existence check |
| AC-11 | Badges visible in README.md | README render check |
| AC-12 | `@lhci/cli` and `wait-on` in devDependencies | package.json review |
| AC-13 | pnpm store cached in CI | Workflow YAML review |
| AC-14 | `.lighthouseci/` directory is gitignored | .gitignore check |
