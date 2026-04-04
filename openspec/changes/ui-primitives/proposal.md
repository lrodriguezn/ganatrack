# Proposal: Add Missing UI Primitives

## Intent

GanaTrack has 12 UI primitives in `apps/web/src/shared/components/ui/` but is missing 5 essential form/navigation atoms (Checkbox, Select, Switch, Tabs, Radio Group). This forces ~40 ad-hoc raw HTML implementations scattered across modules, causing inconsistent UX, accessibility gaps (no ARIA roles, missing keyboard nav), and duplicated logic. Adding these as Radix-wrapped primitives establishes a single source of truth for interactive controls.

## Scope

### In Scope
- **Checkbox** (`checkbox.tsx`): Radix `@radix-ui/react-checkbox`, indeterminate state, label slot, RHF `checked` adapter
- **Select** (`select.tsx`): Radix `@radix-ui/react-select`, search/filter support, RHF integration, replaces ~32 raw `<select>` elements
- **Switch** (`switch.tsx`): Radix `@radix-ui/react-switch`, boolean toggle, RHF `checked` adapter
- **Tabs** (`tabs.tsx`): Radix `@radix-ui/react-tabs`, URL-synced mode + client-state mode, proper ARIA `tablist`/`tab`/`tabpanel` roles
- **Radio Group** (`radio-group.tsx`): Radix `@radix-ui/react-radio-group`, exclusive choice, RHF integration
- New Radix dependencies: `@radix-ui/react-checkbox`, `@radix-ui/react-select`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-radio-group`
- Barrel export update in `shared/components/ui/index.ts` (if exists)

### Out of Scope
- Migration of existing ad-hoc implementations to new primitives (separate change)
- New Radix packages beyond the 5 listed
- Changes to `form-field.tsx` beyond documenting `checked` vs `value` usage pattern
- Any visual redesign — styling matches existing primitives exactly

## Capabilities

### New Capabilities
- `ui-checkbox`: Accessible checkbox with indeterminate state, label integration, RHF compatibility
- `ui-select`: Accessible dropdown select with optional search, RHF compatibility
- `ui-switch`: Accessible toggle switch for boolean settings, RHF compatibility
- `ui-tabs`: Accessible tabbed navigation with URL-sync and client-state modes
- `ui-radio-group`: Accessible radio button group for exclusive choices, RHF compatibility

### Modified Capabilities
- None

## Approach

1. Add 5 Radix UI packages as dependencies
2. Create each component following existing conventions: file header, JSDoc, `'use client'`, `forwardRef`, `twMerge`, variants as `Record`, dark mode classes, focus-visible ring
3. Checkbox/Switch/Radio Group use `checked`/`onCheckedChange` — adapters documented for RHF via `Controller` with `value={field.value}` → `checked` mapping
4. Tabs exports two variants: `UrlTabs` (uses `useSearchParams`/`useRouter`) and `StateTabs` (pure client state)
5. Select includes optional search input within dropdown panel

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/ui/checkbox.tsx` | New | Checkbox primitive |
| `apps/web/src/shared/components/ui/select.tsx` | New | Select primitive |
| `apps/web/src/shared/components/ui/switch.tsx` | New | Switch primitive |
| `apps/web/src/shared/components/ui/tabs.tsx` | New | Tabs primitive |
| `apps/web/src/shared/components/ui/radio-group.tsx` | New | Radio group primitive |
| `apps/web/package.json` | Modified | 5 new Radix dependencies |
| `apps/web/src/shared/components/ui/index.ts` | Modified | Barrel export (if exists) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Radix version conflicts with existing packages | Low | All Radix packages at ^1.1.0 — same major |
| Select search adds bundle size | Low | Radix Select is tree-shakeable; ~8kb gzipped |
| Tabs URL mode conflicts with existing `useSearchParams` usage | Medium | URL mode is opt-in; existing `AnimalDetailTabs` migrates later |
| RHF `checked` vs `value` confusion for consumers | Medium | Document pattern in JSDoc; provide `FormField` usage example |

## Rollback Plan

1. `git revert` the commit(s) adding the 5 new files
2. `npm uninstall` the 5 new Radix packages
3. No consumer migration has occurred yet, so zero downstream impact

## Dependencies

- `@radix-ui/react-checkbox` ^1.1.0
- `@radix-ui/react-select` ^2.1.0
- `@radix-ui/react-switch` ^1.1.0
- `@radix-ui/react-tabs` ^1.1.0
- `@radix-ui/react-radio-group` ^1.2.0

## Success Criteria

- [ ] All 5 components compile with zero TypeScript errors
- [ ] Each component passes axe-core accessibility scan (WCAG 2.1 AA)
- [ ] Checkbox supports indeterminate state via `ref.indeterminate = true`
- Select supports search/filter within dropdown
- Switch toggles boolean state with keyboard (Space/Enter)
- Tabs support both URL-synced and client-state modes
- Radio Group enforces exclusive selection
- All components work with `FormField` + RHF `Controller`
- All components include dark mode styling
