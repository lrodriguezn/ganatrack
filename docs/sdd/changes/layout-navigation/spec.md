# Delta Spec: Layout + Navigation — GanaTrack

## 1. Navigation Config (navigation.config.ts)

### Requirement: NC-001 — Centralized Navigation Configuration

The system MUST provide a single source of truth for sidebar navigation items in `navigation.config.ts` located in `shared/lib/`.

Each navigation item MUST contain:
- `label`: Human-readable text displayed in sidebar
- `href`: Route path (string)
- `icon`: Heroicon component reference
- `permission`: Optional permission key string (null = visible to all)
- `children`: Optional array of nested items for accordion groups

**Acceptance Criteria:**
- [ ] File exports named `NAVIGATION_ITEMS` constant array
- [ ] Each item type-safe via `NavItem` interface
- [ ] 11 root-level modules present: Dashboard, Animales, Servicios, Predios, Maestros, Configuración, Productos, Reportes, Notificaciones, Usuarios
- [ ] Grouped items (Servicios, Predios, Maestros, Reportes) have `children` arrays
- [ ] Items without `permission` field render for all users

---

## 2. Sidebar Component

### Requirement: NC-002 — Collapsible Sidebar State

The system MUST use Zustand store (`sidebar.store.ts`) to manage sidebar state with persistence.

Store state:
- `isOpen`: boolean — mobile overlay visibility
- `isCollapsed`: boolean — tablet/desktop collapsed mode

Store MUST persist `isCollapsed` to localStorage. Store MUST NOT persist `isOpen` (mobile state is ephemeral).

**Acceptance Criteria:**
- [ ] `sidebar.store.ts` exports `useSidebarStore` hook
- [ ] `isCollapsed` value survives page refresh
- [ ] `isOpen` resets to `false` on page load

---

### Requirement: NC-003 — Responsive Sidebar Behavior

The sidebar MUST render differently based on viewport:

| Viewport | Width | Behavior |
|----------|-------|----------|
| Mobile (<768px) | N/A | Hidden by default, hamburger toggles overlay |
| Tablet (768-1279px) | 72px | Always visible, icons only, no text |
| Desktop (≥1280px) | 280px | Always visible, icons + text |

**Acceptance Criteria:**
- [ ] Mobile: `<aside>` conditionally rendered with Radix Dialog overlay
- [ ] Tablet: Sidebar width fixed at 72px, labels hidden, tooltips shown on hover
- [ ] Desktop: Sidebar width fixed at 280px, full labels visible
- [ ] Resize between breakpoints triggers correct behavior without page reload

---

### Requirement: NC-004 — Active Route Highlighting

The sidebar MUST highlight the active navigation item using `usePathname()` from `next/navigation`.

Active state rules:
- Item `href` matches current pathname exactly OR pathname starts with `href + /` (for nested routes)
- Active item displays solid Heroicon variant (outline variant for inactive)
- Active item has distinct background color (Tailwind `bg-primary-50` or similar)

**Acceptance Criteria:**
- [ ] Direct route match: exact `href` === pathname → item is active
- [ ] Nested route match: pathname.startsWith(`${href}/`) → parent item is active + expanded
- [ ] Non-matching pathname → no active item highlighted
- [ ] Active state updates on navigation without page reload

---

### Requirement: NC-005 — Nested Items Accordion

Navigation items with `children` MUST render as accordion groups.

Accordion behavior:
- Parent item shows chevron icon indicating expand/collapse state
- Clicking parent item toggles children visibility
- Children are hidden by default unless parent is active OR explicitly expanded
- Only one accordion group open at a time (optional, per design decision)

**Acceptance Criteria:**
- [ ] Items with `children` render with chevron indicator
- [ ] Clicking parent item toggles `children` visibility
- [ ] Children render indented under parent
- [ ] Collapsed state persists during session

---

### Requirement: NC-006 — RBAC Filtering in Sidebar

The sidebar MUST filter items based on user permissions using the existing `Can` component and `usePermission` hook from auth module.

RBAC rules:
- Item with `permission: null` → visible to all authenticated users
- Item with `permission: string` → visible only if `usePermission()` returns true
- Hidden items do not render in DOM (not just CSS hidden)

**Acceptance Criteria:**
- [ ] `Can` component wraps each nav item
- [ ] Item without permission renders for all users
- [ ] Item with invalid permission does not appear in sidebar
- [ ] Permission check runs on every render without console errors

---

### Requirement: NC-007 — Mobile Overlay Behavior

Mobile sidebar overlay MUST provide correct UX:

- Backdrop overlay covers entire screen when open
- Clicking backdrop closes overlay and sets `isOpen: false`
- Body scroll locked when overlay open (`overflow-hidden` on `<body>`)
- Overlay renders as Radix Dialog for accessibility

**Acceptance Criteria:**
- [ ] Overlay visible when `isOpen === true`
- [ ] Click outside sidebar closes overlay
- [ ] Body scroll disabled while overlay open
- [ ] Escape key closes overlay
- [ ] Focus trapped within overlay when open

---

## 3. Header Component

### Requirement: NC-008 — Predio Selector

Header MUST display current active predio with ability to switch.

Selector behavior:
- Reads `predioActivo` from `predioStore`
- If `predios.length === 1`: render as plain text (not dropdown)
- If `predios.length > 1`: render as Radix DropdownMenu
- Switching predios calls `predioStore.switchPredio(id)` AND updates `lastSwitchTimestamp`

**Acceptance Criteria:**
- [ ] Single predio: displays name as text, no dropdown arrow
- [ ] Multiple predios: dropdown shows all predios with active marked
- [ ] Selecting different predio updates `predioActivo` in store
- [ ] `lastSwitchTimestamp` updated on every switch
- [ ] Dropdown closed after selection

---

### Requirement: NC-009 — Notification Bell

Header MUST display notification bell with unread count badge.

Bell behavior:
- Badge displays unread notification count
- Count capped at "99+" for values > 99
- Badge hidden when count is 0
- Polling interval: 60 seconds (placeholder, no actual API integration)

**Acceptance Criteria:**
- [ ] Bell icon renders in header
- [ ] Badge shows number ≤ 99 directly
- [ ] Badge shows "99+" for count > 99
- [ ] Badge hidden when unread count === 0
- [ ] Bell click opens notification dropdown (future)

---

### Requirement: NC-010 — User Dropdown

Header MUST display user info with logout option.

User dropdown contents:
- User full name (from `authStore.user?.nombre`)
- User email (from `authStore.user?.email`)
- Separator line
- Logout button triggering `useLogout()` hook

**Acceptance Criteria:**
- [ ] Dropdown shows user name and email
- [ ] Logout button present and clickable
- [ ] Clicking logout clears auth store, clears predio store, redirects to `/login`
- [ ] Dropdown closed when clicking outside

---

## 4. Breadcrumbs

### Requirement: NC-011 — Auto-Generated Breadcrumbs

Breadcrumbs MUST auto-generate from pathname using `usePathname()`.

Generation rules:
- Split pathname by `/`, filtering empty segments
- Map each segment to breadcrumb item
- All segments except LAST are rendered as `<Link>`
- LAST segment rendered as plain `<span>` (current page, not clickable)
- First segment maps to "Home" with href `/dashboard`

**Acceptance Criteria:**
- [ ] Breadcrumbs render for any dashboard route
- [ ] `/dashboard` renders single "Home" item
- [ ] `/dashboard/animales` renders: "Home" (link) → "Animales" (text)
- [ ] `/dashboard/servicios/resumen` renders: Home → Servicios → Resumen
- [ ] Clicking non-last segment navigates to that route

---

### Requirement: NC-012 — Entity ID Segments

Breadcrumb segments matching entity ID patterns (numeric or UUID) MUST display as placeholder until name resolved.

Behavior:
- Segment matches `/^\d+$/` (numeric) or `/^[0-9a-f-]{36}$/` (UUID) → display "..."
- Future hook `useEntityName(entityType, entityId)` provided as hook point
- Name resolution deferred to later iteration

**Acceptance Criteria:**
- [ ] Numeric ID segment displays "..."
- [ ] UUID segment displays "..."
- [ ] Non-ID segments display formatted label (capitalize, replace hyphens with spaces)
- [ ] Hook point exists for future name resolution

---

## 5. UI Atoms

### Requirement: NC-013 — Button Component

Button MUST support variants: `primary`, `secondary`, `ghost`, `danger`.

Button props:
- `variant`: `primary | secondary | ghost | danger`
- `size`: `sm | md | lg` (optional, default `md`)
- `disabled`: boolean
- `loading`: boolean (shows spinner, disables interaction)
- Standard button props: `onClick`, `type`, `children`, `className`

**Acceptance Criteria:**
- [ ] `primary`: solid background, white text
- [ ] `secondary`: outlined, border + text color
- [ ] `ghost`: transparent background, text only
- [ ] `danger`: red variant for destructive actions
- [ ] `disabled` prevents all interaction
- [ ] `loading` shows spinner and prevents click

---

### Requirement: NC-014 — Badge Component

Badge MUST display notification count with overflow handling.

Badge props:
- `count`: number
- `max`: number (default 99)

**Acceptance Criteria:**
- [ ] Displays `count` when ≤ `max`
- [ ] Displays `"${max}+"` when `count > max`
- [ ] Hidden (not rendered) when `count === 0`
- [ ] Supports `className` override

---

### Requirement: NC-015 — DropdownMenu Component

DropdownMenu MUST wrap Radix DropdownMenu with consistent theming.

Exports:
- `DropdownMenu` — root container
- `DropdownMenuTrigger` —wraps Radix trigger
- `DropdownMenuContent` —wraps Radix content
- `DropdownMenuItem` —wraps Radix item
- `DropdownMenuSeparator` —wraps Radix separator

**Acceptance Criteria:**
- [ ] All Radix primitives properly imported and re-exported
- [ ] Styled with Tailwind + design system colors
- [ ] Keyboard navigation works (arrow keys, Enter, Escape)
- [ ] Click outside closes dropdown

---

### Requirement: NC-016 — Tooltip Component

Tooltip MUST wrap Radix Tooltip for collapsed sidebar icons.

Tooltip props:
- `content`: string (required)
- `children`: React node (required)
- `side`: `top | right | bottom | left` (default: `right`)

**Acceptance Criteria:**
- [ ] Hover over children shows tooltip after 400ms delay
- [ ] Tooltip positioned relative to children
- [ ] Supports all four positions
- [ ] Dismisses on mouse leave

---

### Requirement: NC-017 — Separator Component

Separator MUST wrap Radix Separator.

Separator props:
- `orientation`: `horizontal | vertical` (default: `horizontal`)
- `className`: optional string

**Acceptance Criteria:**
- [ ] Horizontal separator renders full-width `<hr>`-like element
- [ ] Vertical separator renders height-containing element
- [ ] Styled with design system color (muted)

---

## Constraints Summary

| ID | Constraint | Type |
|----|------------|------|
| C-001 | Sidebar state MUST use Zustand with localStorage persistence for `isCollapsed` only | MUST |
| C-002 | Sidebar MUST NOT render items user lacks permission for | MUST NOT |
| C-003 | Mobile overlay MUST lock body scroll when open | MUST |
| C-004 | Predio selector MUST update `lastSwitchTimestamp` on switch | MUST |
| C-005 | Notification badge MUST cap display at "99+" | MUST |
| C-006 | Entity ID breadcrumb segments MUST display as "..." until name resolved | MUST |
| C-007 | All UI atoms MUST wrap Radix primitives | MUST |
| C-008 | Layout components MUST live in `shared/components/layout/` | MUST |
| C-009 | UI atoms MUST live in `shared/components/ui/` | MUST |
| C-010 | Navigation config MUST be in `shared/lib/navigation.config.ts` | MUST |
| C-011 | Sidebar MUST use Heroicons outline for inactive, solid for active | MUST |
| C-012 | Breadcrumbs last segment MUST NOT be clickable | MUST NOT |
