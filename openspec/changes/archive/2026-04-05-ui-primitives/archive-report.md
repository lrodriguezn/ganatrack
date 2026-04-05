# Archive Report: UI Primitives — Add Missing Radix Components

**Change**: ui-primitives
**Project**: ganatrack
**Mode**: hybrid
**Date**: 2026-04-05
**Status**: COMPLETED

## Summary

Added 5 missing Radix UI wrapper components to `apps/web/src/shared/components/ui/`, establishing a single source of truth for interactive controls and replacing ad-hoc raw HTML implementations across modules. All components follow existing conventions and integrate with `FormField` + React Hook Form `Controller` pattern.

## Artifacts

- ✅ `proposal.md` — Change proposal
- ✅ `design.md` — Technical design (331 lines, 3 architecture decisions)
- ✅ `specs/` — Delta specs
- ✅ `tasks.md` — Task breakdown

## What Was Done

### New Components (5 files, 1,002 lines)

| Component | File | Lines | Radix Package | Features |
|-----------|------|-------|---------------|----------|
| Checkbox | `checkbox.tsx` | 160 | `@radix-ui/react-checkbox` | Indeterminate state, label slot, RHF `checked` adapter, dark mode |
| Select | `select.tsx` | 282 | `@radix-ui/react-select` | Search/filter within dropdown, RHF integration, dark mode |
| Switch | `switch.tsx` | 115 | `@radix-ui/react-switch` | Boolean toggle, keyboard (Space/Enter), RHF `checked` adapter |
| Tabs | `tabs.tsx` | 288 | `@radix-ui/react-tabs` | URL-synced mode + client-state mode, ARIA roles (`tablist`/`tab`/`tabpanel`) |
| Radio Group | `radio-group.tsx` | 157 | `@radix-ui/react-radio-group` | Exclusive choice, RHF integration, dark mode |

### Design Decisions

1. **Radix UI wrappers** — Consistent with existing 4 Radix packages (dialog, dropdown-menu, separator, tooltip), single a11y library
2. **Thin wrapper per primitive** — Single file per component, follows existing `dropdown-menu.tsx` compound pattern
3. **RHF `checked` vs `value` mapping** — Documented in JSDoc, no adapter HOC overhead

### Conventions Applied

All components follow established patterns:
- `'use client'` directive
- `forwardRef` on leaf components
- `twMerge` for class composition
- Variants as `Record` type maps
- `dark:` Tailwind classes
- Standard `focus-visible` ring pattern
- JSDoc with usage examples

### Dependencies Added

- `@radix-ui/react-checkbox` ^1.1.0
- `@radix-ui/react-select` ^2.1.0
- `@radix-ui/react-switch` ^1.1.0
- `@radix-ui/react-tabs` ^1.1.0
- `@radix-ui/react-radio-group` ^1.2.0

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| N/A | None | This change adds UI primitives, not domain API specs. |

## Files

```
apps/web/src/shared/components/ui/
├── checkbox.tsx         # 160 lines — Radix Checkbox wrapper
├── select.tsx           # 282 lines — Radix Select with search
├── switch.tsx           # 115 lines — Radix Switch wrapper
├── tabs.tsx             # 288 lines — Radix Tabs (URL + client modes)
└── radio-group.tsx      # 157 lines — Radix RadioGroup wrapper
```
