# Design: Add Missing UI Primitives

## Technical Approach

Create 5 Radix UI wrapper components (`checkbox.tsx`, `select.tsx`, `switch.tsx`, `tabs.tsx`, `radio-group.tsx`) under `apps/web/src/shared/components/ui/`, each following existing conventions: file header, JSDoc, `'use client'`, `forwardRef`, `twMerge`, `Record` variant maps, `dark:` classes, and the standard focus-visible ring pattern. Each component integrates with the existing `FormField` + RHF `Controller` pattern.

## Architecture Decisions

### Decision: Radix UI Wrapper vs Headless Alternatives

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Radix UI wrappers** | Proven a11y, consistent with existing 4 Radix packages, zero CSS needed for behavior | ✅ Selected |
| Headless UI (Tailwind) | Tighter Tailwind integration, but different API, new dependency | Rejected |
| Custom from scratch | Full control, but must implement all a11y/keyboard/ARIA manually | Rejected |

**Rationale**: GanaTrack already uses 4 Radix packages (dialog, dropdown-menu, separator, tooltip). Adding 5 more maintains a single accessibility library, consistent patterns, and shared conventions. Radix handles WAI-ARIA compliance, keyboard navigation, and focus management — the hard parts we should NOT reimplement.

### Decision: Wrapper Approach — Thin Layer Over Radix

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Thin wrapper per primitive** | Single file per component, consistent import path, easy to override | ✅ Selected |
| Direct Radix usage in consumers | No wrapper code, but every consumer repeats styling/a11y classes | Rejected |
| Compound component API (shadcn-style) | More flexible composition, but higher learning curve, more files | Rejected |

**Rationale**: Existing primitives (`separator.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`) all use the thin wrapper pattern. `dropdown-menu.tsx` shows the compound sub-component pattern when needed (exports `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, etc.). We follow the same approach: single file, named exports, `forwardRef` on leaf components.

### Decision: RHF `checked` vs `value` Mapping

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Document pattern in JSDoc + examples** | Consumers learn once, no adapter overhead, matches RHF docs | ✅ Selected |
| Build adapter HOC/wrapper | Hides complexity, but adds indirection and bundle size | Rejected |
| Modify `form-field.tsx` to auto-detect | Magic behavior, breaks with custom components | Rejected |

**Rationale**: The existing `form-field.tsx` is a generic `Controller` wrapper — it does NOT transform props. Checkbox, Switch use `checked`/`onCheckedChange` (boolean), while Select, Radio Group use `value`/`onValueChange` (string). The mapping is trivial and documented in JSDoc:

```tsx
// Boolean controls (Checkbox, Switch):
<FormField name="isEnabled" control={control}
  render={({ field }) => (
    <Switch checked={field.value} onCheckedChange={field.onChange} />
  )}
/>

// String controls (Select, Radio Group):
<FormField name="category" control={control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange} options={opts} />
  )}
/>
```

### Decision: Tabs URL-Synced Mode

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **`syncUrl` prop on single `Tabs` component** | One component, opt-in URL sync, internal `useSearchParams` | ✅ Selected |
| Separate `UrlTabs` and `StateTabs` exports | Explicit types, but duplicated logic, confusing API | Rejected |
| External hook `useTabUrlSync()` | Composable, but consumer must wire it up manually | Rejected |

**Rationale**: A single `Tabs` component with `syncUrl?: boolean` prop keeps the API surface minimal. When `syncUrl=true`, the component internally uses `useSearchParams` and `useRouter` from `next/navigation` to sync the active tab to `?tab=<id>`. When `false` (default), it behaves as pure client state. This matches the spec's requirement for two modes while keeping one component.

**Implementation detail**: URL sync uses `router.replace()` (not `push`) to avoid polluting browser history. On mount, reads `searchParams.get('tab')` to initialize `value`. On tab change, updates URL. Listens to `popstate` for browser back/forward.

### Decision: Select Search Implementation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Client-side filter with `Input` in dropdown** | Simple, no server dependency, ~150ms debounce | ✅ Selected |
| Server-side search via callback | Scales to large datasets, but adds network complexity | Rejected |
| Native `<select>` with no search | Simplest, but fails spec requirement for searchable mode | Rejected |

**Rationale**: Radix Select renders content inside a `Portal`, so we can place an `Input` component at the top of `SelectContent`. Client-side filtering with `Array.filter()` on `option.label` (case-insensitive) handles the common case (< 200 options). Debounce at 150ms via `setTimeout`/`clearTimeout` — no external dependency needed.

## Data Flow

### Component Architecture

```
FormField (Controller wrapper)
  │
  ├── render={({ field }) => <Primitive {...fieldMapping} />}
  │
  ├── Checkbox ──→ checked={field.value} │ onCheckedChange={field.onChange}
  ├── Switch   ──→ checked={field.value} │ onCheckedChange={field.onChange}
  ├── Select   ──→ value={field.value}   │ onValueChange={field.onChange}
  └── RadioGroup → value={field.value}   │ onValueChange={field.onChange}

Tabs (standalone, no FormField):
  ├── State mode: internal useState → onValueChange callback
  └── URL mode: useSearchParams → useState → router.replace → popstate listener
```

### Radix Composition Map

```
checkbox.tsx    → @radix-ui/react-checkbox  (Checkbox.Root + Indicator)
select.tsx      → @radix-ui/react-select    (Root, Trigger, Value, Content, Viewport, Item, ItemText, Label, Separator, Group, Portal)
switch.tsx      → @radix-ui/react-switch    (Root + Thumb)
tabs.tsx        → @radix-ui/react-tabs      (Root, List, Trigger, Content)
radio-group.tsx → @radix-ui/react-radio-group (Root + Item + Indicator)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/shared/components/ui/checkbox.tsx` | **Create** | Checkbox primitive with indeterminate state, label slot, error variant |
| `apps/web/src/shared/components/ui/select.tsx` | **Create** | Select primitive with optional search, error display, 3 sizes |
| `apps/web/src/shared/components/ui/switch.tsx` | **Create** | Switch primitive with label slot, 2 sizes, error variant |
| `apps/web/src/shared/components/ui/tabs.tsx` | **Create** | Tabs primitive with URL-sync mode, lazy loading, 2 variants (underline/pills) |
| `apps/web/src/shared/components/ui/radio-group.tsx` | **Create** | Radio Group primitive with option descriptions, 2 orientations, error display |
| `apps/web/package.json` | **Modify** | Add 5 Radix dependencies |

## Interfaces / Contracts

### Checkbox

```tsx
// apps/web/src/shared/components/ui/checkbox.tsx

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type CheckboxSize = 'sm' | 'md';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
  indeterminate?: boolean;
  size?: CheckboxSize;
  error?: boolean;
}

const sizeClasses: Record<CheckboxSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

// Radix composition: CheckboxPrimitive.Root + CheckboxPrimitive.Indicator
// Two indicator states: CheckIcon (checked), DashIcon (indeterminate)
// RHF: <Checkbox checked={field.value} onCheckedChange={field.onChange} />
```

### Select

```tsx
// apps/web/src/shared/components/ui/select.tsx

import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options: SelectOption[];
  label?: string;
  error?: string;
  size?: SelectSize;
  className?: string;
  searchable?: boolean;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-4 text-lg',
};

// Radix composition: SelectPrimitive.Root, Trigger, Value, Content, Viewport, Item, ItemText, Portal
// Search: Input inside SelectContent, filters options array client-side with 150ms debounce
// RHF: <Select value={field.value} onValueChange={field.onChange} options={opts} />
```

### Switch

```tsx
// apps/web/src/shared/components/ui/switch.tsx

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type SwitchSize = 'sm' | 'md';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: React.ReactNode;
  size?: SwitchSize;
  error?: boolean;
}

const trackClasses: Record<SwitchSize, string> = {
  sm: 'h-4 w-8',
  md: 'h-5 w-9',
};

const thumbClasses: Record<SwitchSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
};

// Radix composition: SwitchPrimitive.Root + SwitchPrimitive.Thumb
// Track: data-[state=checked] → bg-brand-500, else bg-gray-300
// Thumb: translate-x transition via CSS transform
// RHF: <Switch checked={field.value} onCheckedChange={field.onChange} />
```

### Tabs

```tsx
// apps/web/src/shared/components/ui/tabs.tsx

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type TabsVariant = 'underline' | 'pills';
type TabsOrientation = 'horizontal' | 'vertical';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  variant?: TabsVariant;
  className?: string;
  contentClassName?: string;
  syncUrl?: boolean;
  lazy?: boolean;
}

const variantClasses: Record<TabsVariant, string> = {
  underline: 'border-b border-gray-200 dark:border-gray-700',
  pills: 'flex gap-1',
};

// Radix composition: TabsPrimitive.Root, List, Trigger, Content
// URL sync: internal useSearchParams + useRouter when syncUrl=true
// Lazy: tracks Set<activatedTabIds>, only renders content for activated tabs
// RHF: Not typically used with FormField (navigation, not form input)
```

### Radio Group

```tsx
// apps/web/src/shared/components/ui/radio-group.tsx

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[];
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
}

// Radix composition: RadioGroupPrimitive.Root + RadioGroupPrimitive.Item + RadioGroupPrimitive.Indicator
// Indicator: circular dot (h-2 w-2 rounded-full bg-brand-500)
// RHF: <RadioGroup value={field.value} onValueChange={field.onChange} options={opts} />
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit** | Checkbox renders checked/unchecked/indeterminate states | `render(<Checkbox />)` + `expect(getByRole('checkbox')).toHaveAttribute('aria-checked')` |
| **Unit** | Checkbox label toggles on click | `userEvent.click(getByText('label'))` → assert `onCheckedChange` called |
| **Unit** | Select renders options, selects value | `userEvent.click(trigger)` → `userEvent.click(option)` → assert `onValueChange` |
| **Unit** | Select searchable mode filters options | Type in search input → assert filtered options count |
| **Unit** | Select empty options shows "No options available" | `options={[]}` → assert message visible |
| **Unit** | Switch toggles on/off with click and keyboard | `userEvent.click()` + `userEvent.keyboard('{Space}')` |
| **Unit** | Tabs renders tab list, switches content | `userEvent.click(tab)` → assert correct `tabpanel` visible |
| **Unit** | Tabs URL mode syncs `?tab=` param | Mock `useSearchParams` → assert `router.replace` called |
| **Unit** | Tabs lazy mode defers rendering | Assert inactive tab content NOT in DOM until activated |
| **Unit** | RadioGroup exclusive selection | Click option A then B → assert only B has `aria-checked="true"` |
| **Unit** | All components: dark mode classes present | `container.innerHTML` contains `dark:` class strings |
| **Unit** | All components: focus-visible ring classes present | Assert `focus-visible:ring-2 focus-visible:ring-brand-500` in className |
| **Integration** | Checkbox + FormField + RHF form submission | Render form → toggle checkbox → submit → assert form value |
| **Integration** | Select + FormField + RHF form submission | Render form → select option → submit → assert form value |
| **Integration** | Switch + FormField + RHF form submission | Render form → toggle switch → submit → assert form value |
| **Integration** | RadioGroup + FormField + RHF form submission | Render form → select radio → submit → assert form value |
| **Accessibility** | All components pass axe-core WCAG 2.1 AA | `@axe-core/react` or `jest-axe` in each test file |
| **Typecheck** | Zero TypeScript errors across all 5 files | `pnpm typecheck` |

## Migration / Rollout

**No breaking changes.** This change is purely additive — 5 new files + 5 new dependencies. No existing code is modified or removed.

1. **Dependencies**: Add 5 Radix packages to `apps/web/package.json`
2. **Components**: Create 5 new `.tsx` files under `shared/components/ui/`
3. **Verification**: `pnpm typecheck && pnpm lint` must pass
4. **Future migration**: A separate change will replace ~40 ad-hoc implementations incrementally per module

**Rollback**: `git revert` the commit(s) + `pnpm remove` the 5 Radix packages. Zero downstream impact since no consumers exist yet.

## Open Questions

- [ ] Should `select.tsx` also export compound sub-components (`SelectTrigger`, `SelectContent`, `SelectItem`) for advanced use cases beyond the `options` array prop? (Recommend: defer — the `options` prop covers 95% of cases; compound API can be added later if needed)
- [ ] Should `tabs.tsx` use `router.replace()` or `router.push()` for URL sync? (Recommend: `replace()` — tab changes are not navigation events that should create history entries)
- [ ] Should the Select search debounce use `useRef` + `setTimeout` or a custom `useDebounce` hook? (Recommend: `useRef` + `setTimeout` inline — avoids adding a new hook dependency for a single use case)
