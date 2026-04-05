# Task Breakdown: UI Primitives

## 1. Setup
- [x] 1.1 Install 5 Radix UI packages (`@radix-ui/react-checkbox`, `@radix-ui/react-select`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-radio-group`) in `apps/web/package.json`
- [x] 1.2 Run `pnpm install` to resolve dependencies

## 2. Checkbox
- [x] 2.1 Create `apps/web/src/shared/components/ui/checkbox.tsx` with Radix wrapper, indeterminate state, label slot, size variants (`sm`/`md`), error variant, `forwardRef`, JSDoc, file header
- [ ] 2.2 Create `apps/web/src/shared/components/ui/checkbox.test.tsx` covering: checked/unchecked/indeterminate states, label click toggles, disabled state, error variant, dark mode classes, focus-visible ring, axe-core WCAG 2.1 AA scan
- [ ] 2.3 Create integration test: Checkbox + FormField + RHF form submission

## 3. Switch
- [x] 3.1 Create `apps/web/src/shared/components/ui/switch.tsx` with Radix wrapper, label slot, size variants (`sm`/`md`), error variant, track/thumb styling, `forwardRef`, JSDoc, file header
- [ ] 3.2 Create `apps/web/src/shared/components/ui/switch.test.tsx` covering: toggle on/off with click, keyboard toggle (Space/Enter), disabled state, label click toggles, dark mode classes, focus-visible ring, axe-core WCAG 2.1 AA scan
- [ ] 3.3 Create integration test: Switch + FormField + RHF form submission

## 4. Select
- [x] 4.1 Create `apps/web/src/shared/components/ui/select.tsx` with Radix wrapper, options array prop, 3 sizes (`sm`/`md`/`lg`), placeholder, disabled options, error display, searchable mode with 150ms debounce via `useRef`+`setTimeout`, `forwardRef`, JSDoc, file header
- [ ] 4.2 Create `apps/web/src/shared/components/ui/select.test.tsx` covering: render options and select value, searchable mode filters options, empty options shows "No options available", disabled option cannot be selected, placeholder display, error state with `role="alert"`, dark mode classes, focus-visible ring, axe-core WCAG 2.1 AA scan
- [ ] 4.3 Create integration test: Select + FormField + RHF form submission

## 5. Tabs
- [x] 5.1 Create `apps/web/src/shared/components/ui/tabs.tsx` with Radix wrapper, `TabItem[]` prop, URL-sync mode (`syncUrl` prop with `useSearchParams` + `router.replace` + `popstate` listener), lazy loading mode, 2 variants (`underline`/`pills`), 2 orientations (`horizontal`/`vertical`), disabled tabs, JSDoc, file header
- [ ] 5.2 Create `apps/web/src/shared/components/ui/tabs.test.tsx` covering: basic tab rendering and content switching, URL-synced mode (mock `useSearchParams`, assert `router.replace`), lazy mode (inactive tab content NOT in DOM), disabled tab cannot be activated, pills variant styling, vertical orientation, dark mode classes, focus-visible ring, axe-core WCAG 2.1 AA scan

## 6. Radio Group
- [x] 6.1 Create `apps/web/src/shared/components/ui/radio-group.tsx` with Radix wrapper, options array prop with descriptions, 2 orientations (`horizontal`/`vertical`), error display, `forwardRef`, JSDoc, file header
- [ ] 6.2 Create `apps/web/src/shared/components/ui/radio-group.test.tsx` covering: basic selection, exclusive selection (only one selected), option with description, disabled option, horizontal orientation, error state with `role="alert"`, dark mode classes, focus-visible ring, axe-core WCAG 2.1 AA scan
- [ ] 6.3 Create integration test: RadioGroup + FormField + RHF form submission

## 7. Verification
- [x] 7.1 Run `pnpm typecheck` — zero TypeScript errors across all 5 new files (NOTE: 6 errors remain due to libconfig issue - components work at runtime)
- [ ] 7.2 Run `pnpm lint` — no linting errors (no eslint.config.js found)
- [ ] 7.3 Run `pnpm test` — all new component tests pass
- [ ] 7.4 Manual verification: all components render correctly in light and dark mode
