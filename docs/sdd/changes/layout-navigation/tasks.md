# SDD Tasks: Layout + Navigation — GanaTrack

## Goal
Implement the authenticated dashboard shell: sidebar navigation, header with sitio/predio selector + notification bell + user dropdown, breadcrumbs, and required UI atoms.

---

## Phase 1: Foundation — deps, navigation config, atoms

- [x] **TASK-LAYOUT-01**: Install UI dependencies (Heroicons + Radix primitives) — **[S]**
  - Files: `apps/web/package.json`
  - Specs covered: all (prerequisite)
  - Depends on: none
  - Acceptance: `@heroicons/react`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-separator`, `@radix-ui/react-dialog` added to dependencies

- [x] **TASK-LAYOUT-02**: Create `navigation.config.ts` — **[M]**
  - Files: `apps/web/src/shared/lib/navigation.config.ts`
  - Specs covered: NC-001
  - Depends on: none
  - Acceptance: Exports `NAVIGATION_ITEMS` with all 11 root modules, `NavItem` interface, groups have `children`, items without `permission` render for all

- [x] **TASK-LAYOUT-03**: Create `button.tsx` atom — **[S]**
  - Files: `apps/web/src/shared/components/ui/button.tsx`
  - Specs covered: NC-013
  - Depends on: none
  - Acceptance: Variants `primary | secondary | ghost | danger`, sizes `sm | md | lg`, `disabled` and `loading` (spinner) props work

- [x] **TASK-LAYOUT-04**: Create `badge.tsx` atom — **[S]**
  - Files: `apps/web/src/shared/components/ui/badge.tsx`
  - Specs covered: NC-014
  - Depends on: none
  - Acceptance: Displays count ≤ max, shows "max+" when > max, hidden when count === 0

- [x] **TASK-LAYOUT-05**: Create `dropdown-menu.tsx`, `tooltip.tsx`, `separator.tsx` atoms — **[M]**
  - Files: `apps/web/src/shared/components/ui/dropdown-menu.tsx`, `apps/web/src/shared/components/ui/tooltip.tsx`, `apps/web/src/shared/components/ui/separator.tsx`
  - Specs covered: NC-015, NC-016, NC-017
  - Depends on: none
  - Acceptance: All wrap Radix primitives, keyboard nav works (arrows, Enter, Escape), click outside closes

- [x] **TASK-LAYOUT-06**: Create `sidebar.store.ts` — **[S]**
  - Files: `apps/web/src/store/sidebar.store.ts`
  - Specs covered: NC-002
  - Depends on: none
  - Acceptance: `isCollapsed` persists to localStorage, `isMobileOpen` is ephemeral (not persisted)

---

## Phase 2: Sidebar — store, component, responsive

- [x] **TASK-LAYOUT-07**: Create `sidebar-nav-item.tsx` (single item, accordion) — **[M]**
  - Files: `apps/web/src/shared/components/layout/sidebar-nav-item.tsx`
  - Specs covered: NC-004, NC-005, NC-006
  - Depends on: TASK-LAYOUT-02, TASK-LAYOUT-03, TASK-LAYOUT-05
  - Acceptance: Active route highlighting works (exact + prefix match), accordion toggle shows chevron, RBAC filtering via `<Can>` wrapper

- [x] **TASK-LAYOUT-08**: Create `sidebar-nav.tsx` (list renderer) — **[S]**
  - Files: `apps/web/src/shared/components/layout/sidebar-nav.tsx`
  - Specs covered: NC-006
  - Depends on: TASK-LAYOUT-02, TASK-LAYOUT-07
  - Acceptance: Renders all nav items from config, wraps each with `<Can>`, handles items with/without children

- [x] **TASK-LAYOUT-09**: Create `admin-sidebar.tsx` (desktop/tablet) — **[M]**
  - Files: `apps/web/src/shared/components/layout/admin-sidebar.tsx`
  - Specs covered: NC-003 (tablet/desktop), NC-004, NC-005
  - Depends on: TASK-LAYOUT-06, TASK-LAYOUT-07, TASK-LAYOUT-08
  - Acceptance: Fixed 72px on tablet (icons only + tooltips), 280px on desktop, responsive resize without reload

- [x] **TASK-LAYOUT-10**: Create `mobile-sidebar.tsx` (overlay) — **[M]**
  - Files: `apps/web/src/shared/components/layout/mobile-sidebar.tsx`
  - Specs covered: NC-003 (mobile), NC-007
  - Depends on: TASK-LAYOUT-09
  - Acceptance: Radix Dialog overlay, backdrop closes, ESC closes, body scroll locked, hamburger in header triggers it

---

## Phase 3: Header — sitio selector, notification bell, user dropdown

- [ ] **TASK-LAYOUT-11**: Create `sitio-selector.tsx` — **[M]**
  - Files: `apps/web/src/shared/components/layout/sitio-selector.tsx`
  - Specs covered: NC-008
  - Depends on: TASK-LAYOUT-05
  - Acceptance: Single sitio = plain text, multiple = Radix DropdownMenu, switching calls `switchPredio()` + updates `lastSwitchTimestamp`

- [ ] **TASK-LAYOUT-12**: Create `notification-bell.tsx` — **[S]**
  - Files: `apps/web/src/shared/components/layout/notification-bell.tsx`
  - Specs covered: NC-009
  - Depends on: TASK-LAYOUT-04
  - Acceptance: Bell icon + red badge showing count (99+ cap), badge hidden when 0

- [ ] **TASK-LAYOUT-13**: Create `user-dropdown.tsx` — **[M]**
  - Files: `apps/web/src/shared/components/layout/user-dropdown.tsx`
  - Specs covered: NC-010
  - Depends on: TASK-LAYOUT-05
  - Acceptance: Shows user name + email, logout button calls `useLogout()`, dropdown closes on outside click

- [ ] **TASK-LAYOUT-14**: Create `admin-header.tsx` — **[S]**
  - Files: `apps/web/src/shared/components/layout/admin-header.tsx`
  - Specs covered: NC-008, NC-009, NC-010
  - Depends on: TASK-LAYOUT-10, TASK-LAYOUT-11, TASK-LAYOUT-12, TASK-LAYOUT-13
  - Acceptance: Hamburger on mobile (triggers mobile sidebar), contains PredioSelector + NotificationBell + UserDropdown

---

## Phase 4: Breadcrumbs — hook, component

- [ ] **TASK-LAYOUT-15**: Create `use-breadcrumbs.ts` hook — **[M]**
  - Files: `apps/web/src/shared/components/layout/breadcrumbs/use-breadcrumbs.ts`
  - Specs covered: NC-011, NC-012
  - Depends on: none
  - Acceptance: `usePathname()` → segments, maps to labels via ROUTE_LABEL_MAP, entity IDs (numeric/UUID) return "...", provides `BreadcrumbSegment[]`

- [ ] **TASK-LAYOUT-16**: Create `breadcrumbs.tsx` organism — **[S]**
  - Files: `apps/web/src/shared/components/layout/breadcrumbs/breadcrumbs.tsx`
  - Specs covered: NC-011, NC-012
  - Depends on: TASK-LAYOUT-15
  - Acceptance: All segments except last are `<Link>`, last is `<span>`, separator between segments

---

## Phase 5: Integration — dashboard layout wiring

- [ ] **TASK-LAYOUT-17**: Compose `admin-layout.tsx` and update `(dashboard)/layout.tsx` — **[S]**
  - Files: `apps/web/src/shared/components/layout/admin-layout.tsx`, `apps/web/src/app/(dashboard)/layout.tsx`
  - Specs covered: all layout integration
  - Depends on: TASK-LAYOUT-09, TASK-LAYOUT-10, TASK-LAYOUT-14, TASK-LAYOUT-16
  - Acceptance: `AdminLayout` wraps Sidebar + Header + Breadcrumbs + `{children}`, `(dashboard)/layout.tsx` uses `<AdminLayout>`

---

## Task Summary

| Phase | Tasks | Total |
|-------|-------|-------|
| 1: Foundation | T01–T06 | 6 tasks (COMPLETE) |
| 2: Sidebar | T07–T10 | 4 tasks (COMPLETE) |
| 3: Header | T11–T14 | 4 tasks (PENDING) |
| 4: Breadcrumbs | T15–T16 | 2 tasks (PENDING) |
| 5: Integration | T17 | 1 task (PENDING) |
| **Total** | | **17 tasks** (10/17 complete) |

**Batch 1 complete**: Phases 1 (Foundation) + 2 (Sidebar) — 10/17 tasks
