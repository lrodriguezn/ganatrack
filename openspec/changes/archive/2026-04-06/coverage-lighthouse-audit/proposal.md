# Proposal: Coverage + Lighthouse Quality Gates

## Intent

Establish automated quality gates for production readiness: enforce code coverage thresholds per module and Lighthouse audit scores (desktop + mobile) before deployment. Current state has 17% test file coverage (59 tests / 339 sources), 11 modules with zero tests, and Lighthouse runs desktop-only.

## Scope

### In Scope
- Per-module coverage thresholds in vitest.config.ts
- Lighthouse mobile preset configuration
- Quality badge generation for README
- CI job dependencies (wait-on, @lhci/cli local install)
- Documentation of quality gate process

### Out of Scope
- Writing new tests (separate change)
- Performance optimization work
- Accessibility fixes (audit only)

## Capabilities

### New Capabilities
- `quality-coverage-gates`: Module-level coverage thresholds with CI enforcement
- `lighthouse-audit-pipeline`: Desktop + mobile Lighthouse CI with score assertions
- `quality-badges`: Auto-generated coverage/Lighthouse badges in README

### Modified Capabilities
None (pure infrastructure addition)

## Approach

**Phase 1: Foundation** (~1h)
- Install missing deps: `wait-on`, `@lhci/cli`, `badge-maker`
- Update vitest config for per-module coverage patterns

**Phase 2: Coverage Gates** (~1.5h)
- Define module paths and threshold targets (graceful degradation for zero-test modules)
- Configure coverage reporters per module
- Wire threshold enforcement into CI

**Phase 3: Lighthouse Mobile** (~1h)
- Add mobile preset to `.lighthouserc.json` alongside desktop
- Configure assertions for mobile scores (allow lower thresholds initially)

**Phase 4: Badge Generation** (~1h)
- Create badge generation script for coverage + Lighthouse scores
- Wire into post-test CI job
- Update README with badge placeholders

**Phase 5: Documentation** (~1h)
- Document quality gate requirements in CONTRIBUTING.md
- Add badge update process to docs

**Total: ~5.5h**

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/package.json` | Modified | Add @lhci/cli, wait-on, badge-maker |
| `apps/web/vitest.config.ts` | Modified | Per-module coverage thresholds |
| `apps/web/.lighthouserc.json` | Modified | Add mobile preset |
| `.github/workflows/quality.yml` | Modified | Badge generation step |
| `README.md` | Modified | Quality badges section |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Module coverage gaps cause immediate CI failures | High | Set per-module thresholds with 0% floor for uncovered modules |
| Mobile Lighthouse scores lower than desktop | Med | Separate assertion thresholds for mobile (initially 10% lower) |
| CI time increase with LH mobile | Med | Run desktop + mobile in parallel jobs |
| Badge generation fails silently | Low | Add CI step verification and fallback static badges |

## Rollback Plan

1. Revert vitest.config.ts to global thresholds
2. Remove mobile preset from .lighthouserc.json
3. Remove badge generation from CI workflow
4. Uninstall new dependencies
5. All changes are config-only — no code changes to revert

## Dependencies

- Node.js 18+ (already in use)
- Vitest v2.1.9 (installed)
- @lhci/cli ^0.14 (to install)
- wait-on ^7.2 (to install)
- badge-maker ^4 (to install)

## Success Criteria

- [ ] Each module has defined coverage threshold in vitest.config.ts
- [ ] Lighthouse runs both desktop and mobile presets in CI
- [ ] Coverage and Lighthouse badges display in README
- [ ] CI pipeline fails when thresholds not met
- [ ] Documentation describes quality gate process