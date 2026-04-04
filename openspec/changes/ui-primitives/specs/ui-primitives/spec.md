# UI Primitives Specification

## 1. Overview

This spec defines 5 new UI primitive components for the GanaTrack frontend design system. Each component wraps a Radix UI primitive, follows existing conventions (file header, JSDoc, `forwardRef`, `twMerge`, variants as `Record`, dark mode, focus-visible ring), and integrates with React Hook Form via `FormField` + `Controller`.

**Change Name**: `ui-primitives`
**Artifacts**: `checkbox.tsx`, `select.tsx`, `switch.tsx`, `tabs.tsx`, `radio-group.tsx`
**Dependencies**: `@radix-ui/react-checkbox`, `@radix-ui/react-select`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-radio-group`

---

## 2. Requirements

### 2.1 Checkbox

#### Props Interface

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `checked` | `boolean \| 'indeterminate'` | `undefined` | No |
| `defaultChecked` | `boolean` | `false` | No |
| `onCheckedChange` | `(checked: boolean) => void` | — | No |
| `disabled` | `boolean` | `false` | No |
| `required` | `boolean` | `false` | No |
| `label` | `ReactNode` | — | No |
| `indeterminate` | `boolean` | `false` | No |
| `size` | `'sm' \| 'md'` | `'md'` | No |
| `className` | `string` | — | No |
| `id` | `string` | — | No |
| `name` | `string` | — | No |
| `error` | `boolean` | `false` | No |

#### Variants

| Variant | Description |
|---------|-------------|
| `default` | Standard checkbox with brand-500 fill |
| `error` | Red border ring when error=true |

#### Sizes

| Size | Dimensions |
|------|-----------|
| `sm` | `h-3.5 w-3.5` |
| `md` | `h-4 w-4` |

#### Scenarios

**Scenario: Basic checked state**
- GIVEN a Checkbox with `checked={true}`
- WHEN rendered
- THEN the checkbox displays a filled checkmark icon
- AND `aria-checked="true"` is present on the element

**Scenario: Indeterminate state**
- GIVEN a Checkbox with `indeterminate={true}`
- WHEN rendered
- THEN the checkbox displays a horizontal dash (—) icon
- AND `aria-checked="mixed"` is present on the element
- AND visually distinct from checked/unchecked states

**Scenario: With optional label**
- GIVEN a Checkbox with `label="Accept terms"`
- WHEN rendered
- THEN the label is rendered adjacent to the checkbox
- AND clicking the label toggles the checkbox
- AND the label is associated via `htmlFor`/`id`

**Scenario: Disabled state**
- GIVEN a Checkbox with `disabled={true}`
- WHEN rendered
- THEN the checkbox is non-interactive
- AND `opacity-50` and `cursor-not-allowed` are applied
- AND `aria-disabled="true"` is present

**Scenario: React Hook Form integration**
- GIVEN a Checkbox wrapped in `FormField` with `Controller`
- WHEN the form value changes
- THEN `checked` maps from `field.value` (boolean)
- AND `onCheckedChange` maps to `field.onChange`
- AND the `name` attribute is passed for form submission

**Scenario: Error variant**
- GIVEN a Checkbox with `error={true}`
- WHEN rendered
- THEN a red focus ring is applied (`ring-red-500`)
- AND visually matches the Input error variant pattern

---

### 2.2 Select

#### Props Interface

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `undefined` | No |
| `defaultValue` | `string` | `undefined` | No |
| `onValueChange` | `(value: string) => void` | — | No |
| `disabled` | `boolean` | `false` | No |
| `placeholder` | `string` | `'Select...'` | No |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | `[]` | Yes |
| `label` | `string` | — | No |
| `error` | `string` | — | No |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No |
| `className` | `string` | — | No |
| `searchable` | `boolean` | `false` | No |

#### Variants

| Variant | Description |
|---------|-------------|
| `default` | Standard border with brand-500 focus ring |
| `error` | Red border with error message below |

#### Sizes

| Size | Trigger height | Text |
|------|---------------|------|
| `sm` | `h-8` | `text-sm` |
| `md` | `h-10` | `text-base` |
| `lg` | `h-12` | `text-lg` |

#### Scenarios

**Scenario: Basic selection**
- GIVEN a Select with `options={[{ value: 'a', label: 'Option A' }]}`
- WHEN the user clicks the trigger
- THEN the dropdown opens showing "Option A"
- AND `aria-expanded="true"` is set on the trigger
- AND `role="listbox"` is present on the dropdown

**Scenario: Option selection**
- GIVEN an open Select dropdown
- WHEN the user clicks an option
- THEN `onValueChange` is called with the option's `value`
- AND the trigger displays the selected option's `label`
- AND the dropdown closes

**Scenario: Disabled option**
- GIVEN an option with `disabled: true`
- WHEN the dropdown is open
- THEN the option is rendered with `opacity-50` and `pointer-events-none`
- AND the option cannot be selected via click or keyboard

**Scenario: Searchable mode**
- GIVEN a Select with `searchable={true}`
- WHEN the dropdown opens
- THEN a search input is rendered at the top of the dropdown panel
- AND typing filters options by matching against `label` (case-insensitive)
- AND "No results found" is displayed when no options match

**Scenario: Placeholder display**
- GIVEN a Select with no `value` set and `placeholder="Choose..."`
- WHEN rendered
- THEN the trigger displays "Choose..." in `text-gray-400`
- AND `aria-label` includes the placeholder text

**Scenario: Error state**
- GIVEN a Select with `error="This field is required"`
- WHEN rendered
- THEN the trigger has a red border (`border-red-500`)
- AND the error message is displayed below in `text-red-500` with `role="alert"`

**Scenario: React Hook Form integration**
- GIVEN a Select wrapped in `FormField` with `Controller`
- WHEN the form value changes
- THEN `value` maps from `field.value` (string)
- AND `onValueChange` maps to `field.onChange`

---

### 2.3 Switch

#### Props Interface

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `checked` | `boolean` | `undefined` | No |
| `defaultChecked` | `boolean` | `false` | No |
| `onCheckedChange` | `(checked: boolean) => void` | — | No |
| `disabled` | `boolean` | `false` | No |
| `label` | `ReactNode` | — | No |
| `size` | `'sm' \| 'md'` | `'md'` | No |
| `className` | `string` | — | No |
| `id` | `string` | — | No |
| `name` | `string` | — | No |
| `error` | `boolean` | `false` | No |

#### Sizes

| Size | Track dimensions | Thumb dimensions |
|------|-----------------|-----------------|
| `sm` | `h-4 w-8` | `h-3 w-3` |
| `md` | `h-5 w-9` | `h-4 w-4` |

#### Scenarios

**Scenario: Toggle on**
- GIVEN a Switch with `checked={false}`
- WHEN the user clicks or presses Space/Enter
- THEN `onCheckedChange(true)` is called
- AND the thumb animates to the right position
- AND the track background changes to brand-500

**Scenario: Toggle off**
- GIVEN a Switch with `checked={true}`
- WHEN the user clicks or presses Space/Enter
- THEN `onCheckedChange(false)` is called
- AND the thumb animates to the left position
- AND the track background changes to `bg-gray-300`

**Scenario: With optional label**
- GIVEN a Switch with `label="Enable notifications"`
- WHEN rendered
- THEN the label is rendered adjacent to the switch
- AND clicking the label toggles the switch
- AND `role="switch"` and `aria-checked` are present

**Scenario: Disabled state**
- GIVEN a Switch with `disabled={true}`
- WHEN rendered
- THEN the switch is non-interactive
- AND `opacity-50` is applied
- AND `aria-disabled="true"` is present

**Scenario: React Hook Form integration**
- GIVEN a Switch wrapped in `FormField` with `Controller`
- WHEN the form value changes
- THEN `checked` maps from `field.value` (boolean)
- AND `onCheckedChange` maps to `field.onChange`

---

### 2.4 Tabs

#### Props Interface

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `tabs` | `{ id: string; label: string; icon?: ReactNode; disabled?: boolean }[]` | `[]` | Yes |
| `defaultValue` | `string` | `tabs[0].id` | No |
| `value` | `string` | — | No |
| `onValueChange` | `(value: string) => void` | — | No |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | No |
| `variant` | `'underline' \| 'pills'` | `'underline'` | No |
| `className` | `string` | — | No |
| `contentClassName` | `string` | — | No |
| `syncUrl` | `boolean` | `false` | No |
| `lazy` | `boolean` | `false` | No |

#### Variants

| Variant | Description |
|---------|-------------|
| `underline` | Tabs with bottom border indicator (default) |
| `pills` | Tabs with rounded pill-shaped active background |

#### Modes

| Mode | Behavior |
|------|----------|
| `StateTabs` (default) | Pure client state, no URL interaction |
| `UrlTabs` (opt-in via `syncUrl`) | Syncs active tab to URL search param `?tab=<id>` |

#### Scenarios

**Scenario: Basic tab rendering**
- GIVEN Tabs with `tabs={[{ id: 'a', label: 'Tab A' }, { id: 'b', label: 'Tab B' }]}`
- WHEN rendered
- THEN two tab buttons are displayed
- AND the first tab is active by default
- AND `role="tablist"` wraps the tabs
- AND each tab has `role="tab"` and `aria-selected`

**Scenario: Tab content switching**
- GIVEN Tabs with content panels for each tab
- WHEN the user clicks tab "B"
- THEN tab "B" becomes active (`aria-selected="true"`)
- AND the content panel for tab "B" is displayed
- AND `role="tabpanel"` and `aria-controls` are correct

**Scenario: URL-synced mode**
- GIVEN Tabs with `syncUrl={true}` and `defaultValue="overview"`
- WHEN the page loads with `?tab=settings`
- THEN the "settings" tab is active
- WHEN the user clicks the "billing" tab
- THEN the URL updates to `?tab=billing` (using `replaceState`)
- AND browser back/forward navigation changes the active tab

**Scenario: Lazy loading**
- GIVEN Tabs with `lazy={true}` and 3 tabs
- WHEN only tab 1 has been activated
- THEN content for tabs 2 and 3 is NOT rendered in the DOM
- WHEN tab 2 is activated
- THEN tab 2 content is rendered and remains in DOM (not unmounted on switch)

**Scenario: Disabled tab**
- GIVEN a tab with `disabled: true`
- WHEN rendered
- THEN the tab is visually dimmed (`opacity-50`)
- AND the tab cannot be activated via click, keyboard, or programmatic selection
- AND `aria-disabled="true"` is present

**Scenario: Vertical orientation**
- GIVEN Tabs with `orientation="vertical"`
- WHEN rendered
- THEN tabs are stacked vertically on the left
- AND content panels are displayed to the right
- AND arrow keys navigate up/down instead of left/right

**Scenario: Pills variant**
- GIVEN Tabs with `variant="pills"`
- WHEN rendered
- THEN the active tab has a rounded pill background (`bg-brand-500 text-white`)
- AND inactive tabs have transparent background

---

### 2.5 Radio Group

#### Props Interface

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `undefined` | No |
| `defaultValue` | `string` | `undefined` | No |
| `onValueChange` | `(value: string) => void` | — | No |
| `disabled` | `boolean` | `false` | No |
| `options` | `{ value: string; label: string; description?: string; disabled?: boolean }[]` | `[]` | Yes |
| `label` | `string` | — | No |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | No |
| `className` | `string` | — | No |
| `name` | `string` | — | No |
| `error` | `string` | — | No |

#### Scenarios

**Scenario: Basic selection**
- GIVEN a RadioGroup with 3 options
- WHEN the user clicks option 2
- THEN `onValueChange` is called with option 2's value
- AND only option 2 shows `aria-checked="true"`
- AND options 1 and 3 show `aria-checked="false"`

**Scenario: Exclusive selection**
- GIVEN a RadioGroup with option A selected
- WHEN the user clicks option B
- THEN option A is deselected
- AND option B is selected
- AND only one option is ever selected at a time

**Scenario: Option with description**
- GIVEN an option with `description="Recommended plan"`
- WHEN rendered
- THEN the description is displayed below the label in smaller text (`text-sm text-gray-500`)
- AND the description is associated via `aria-describedby`

**Scenario: Disabled option**
- GIVEN an option with `disabled: true`
- WHEN rendered
- THEN the option is non-interactive
- AND visually dimmed (`opacity-50`)
- AND cannot be selected

**Scenario: Horizontal orientation**
- GIVEN a RadioGroup with `orientation="horizontal"`
- WHEN rendered
- THEN options are displayed in a row with `flex-row`
- AND appropriate gap between options

**Scenario: React Hook Form integration**
- GIVEN a RadioGroup wrapped in `FormField` with `Controller`
- WHEN the form value changes
- THEN `value` maps from `field.value` (string)
- AND `onValueChange` maps to `field.onChange`

**Scenario: Error state**
- GIVEN a RadioGroup with `error="Please select an option"`
- WHEN rendered
- THEN the error message is displayed below the group in `text-red-500` with `role="alert"`
- AND `aria-invalid="true"` is set on the radiogroup

---

## 3. Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| AC-1 | All 5 components compile with zero TypeScript errors | `tsc --noEmit` |
| AC-2 | Each component passes axe-core WCAG 2.1 AA scan | Automated a11y test |
| AC-3 | Checkbox supports indeterminate state | Visual + `aria-checked="mixed"` |
| AC-4 | Select supports search/filter within dropdown | Type to filter test |
| AC-5 | Switch toggles with keyboard (Space/Enter) | Keyboard navigation test |
| AC-6 | Tabs support both URL-synced and client-state modes | URL param test + state test |
| AC-7 | Radio Group enforces exclusive selection | Click multiple options test |
| AC-8 | All components work with `FormField` + RHF `Controller` | Form submission test |
| AC-9 | All components include dark mode styling | Visual inspection in dark mode |
| AC-10 | All leaf components use `forwardRef` | Code review |
| AC-11 | All components use `twMerge` for className composition | Code review |
| AC-12 | All interactive components have `'use client'` directive | Code review |
| AC-13 | Focus ring matches pattern: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2` | Code review |
| AC-14 | Bundle size increase < 25kb gzipped for all 5 components | Bundle analyzer |

---

## 4. Non-Functional Requirements

### 4.1 Accessibility

- All components MUST meet WCAG 2.1 AA compliance
- All interactive elements MUST have visible focus indicators
- All components MUST support keyboard navigation
- ARIA roles, states, and properties MUST match WAI-ARIA Authoring Practices
- Color contrast ratios MUST meet 4.5:1 minimum (3:1 for large text)
- Screen reader labels MUST be present for all interactive elements

### 4.2 Performance

- Components MUST be tree-shakeable (named exports, no barrel re-exports that prevent tree-shaking)
- Select search filtering MUST debounce at 150ms minimum
- Tabs with `lazy={true}` MUST NOT render inactive tab content until activated
- No component MUST cause layout shift on mount

### 4.3 Bundle Size

- Total gzipped addition from 5 Radix packages + 5 wrapper components MUST NOT exceed 25kb
- Each individual component wrapper MUST NOT exceed 2kb gzipped (excluding Radix dependency)

### 4.4 Consistency

- All components MUST follow the existing file header pattern: `// apps/web/src/shared/components/ui/<name>.tsx`
- All components MUST include a JSDoc block describing the component
- All components MUST use `twMerge` from `tailwind-merge` for className composition
- All components MUST support dark mode via `dark:` prefix classes
- Variants MUST be defined as `Record<VariantType, string>` maps

---

## 5. Edge Cases

| Edge Case | Component | Expected Behavior |
|-----------|-----------|-------------------|
| Empty options array | Select | Display placeholder, dropdown shows "No options available" |
| No matching search results | Select (searchable) | Display "No results found" message |
| All tabs disabled | Tabs | Render tabs as disabled; no tab is active; show empty content area |
| URL param with invalid tab ID | Tabs (syncUrl) | Fall back to `defaultValue`; do NOT update URL |
| Indeterminate + checked both true | Checkbox | `indeterminate` takes visual precedence; `aria-checked="mixed"` |
| Rapid toggling | Switch | Each toggle fires `onCheckedChange`; no debouncing needed |
| RadioGroup with single option | Radio Group | Renders normally; can be selected/deselected only via external state reset |
| FormField error + component error prop | All | Component `error` prop takes precedence for visual styling |
| Controlled + uncontrolled mixed | All | Warn in dev mode if both `value` and `defaultValue` are provided |
| Tabs content unmounting | Tabs (lazy=false) | All tab content mounted on first render; hidden via CSS |
| Select option value is empty string | Select | Treated as valid value; not equivalent to "no selection" |
| Checkbox label with long text | Checkbox | Label wraps to next line; checkbox stays aligned to top |

---

## 6. Migration Notes

### 6.1 Current State

The codebase currently has ~40 ad-hoc implementations of these primitives scattered across modules:
- Raw `<input type="checkbox">` elements without ARIA attributes
- Raw `<select>` elements without search or consistent styling
- Custom toggle implementations using divs with onClick handlers
- Tab implementations using custom state management without URL sync
- Radio button groups using raw `<input type="radio">` without grouping semantics

### 6.2 Migration Strategy (Future Change)

The migration of existing ad-hoc implementations to these new primitives is **out of scope** for this change. A separate change will:

1. Audit all existing ad-hoc implementations per module
2. Replace them incrementally with the new primitives
3. Verify no regressions in form submissions or accessibility
4. Remove dead code from replaced implementations

### 6.3 FormField Integration Pattern

For Checkbox, Switch, and Radio Group (boolean/checked-based controls), the RHF `Controller` pattern requires mapping:

```tsx
<FormField
  name="isEnabled"
  control={control}
  render={({ field }) => (
    <Switch
      checked={field.value}
      onCheckedChange={field.onChange}
    />
  )}
/>
```

For Select and Radio Group (value-based controls):

```tsx
<FormField
  name="category"
  control={control}
  render={({ field }) => (
    <Select
      value={field.value}
      onValueChange={field.onChange}
      options={categoryOptions}
    />
  )}
/>
```

### 6.4 Dependencies to Add

```json
{
  "@radix-ui/react-checkbox": "^1.1.0",
  "@radix-ui/react-select": "^2.1.0",
  "@radix-ui/react-switch": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-radio-group": "^1.2.0"
}
```

All packages use the same major version family (^1.x) as existing Radix packages (`@radix-ui/react-separator`, `@radix-ui/react-tooltip`, etc.), ensuring no version conflicts.
