# Design: Layout + Navigation — GanaTrack

## Technical Approach

Build the authenticated dashboard shell: sidebar, header, breadcrumbs. Reuse existing auth module (Can, usePermission, useLogout) and predio store. Navigation items defined in a centralized config, filtered by RBAC at render time. Tailwind v4 utilities for menu styling already exist in globals.css — we reuse them directly. Radix UI primitives for DropdownMenu, Tooltip, Separator. Heroicons for icons.

---

## 1. File Structure

```
apps/web/src/
├── app/(dashboard)/layout.tsx                   # MODIFY: compose Sidebar + Header + Breadcrumbs
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── admin-layout.tsx                 # NEW: orchestrator (sidebar + header + breadcrumbs + content)
│   │   │   ├── admin-sidebar.tsx                # NEW: desktop/tablet sidebar organism
│   │   │   ├── mobile-sidebar.tsx               # NEW: mobile overlay sidebar (Radix Dialog)
│   │   │   ├── sidebar-nav.tsx                  # NEW: nav list renderer (presentational)
│   │   │   ├── sidebar-nav-item.tsx             # NEW: single nav item with nested accordion
│   │   │   ├── admin-header.tsx                 # NEW: header bar organism
│   │   │   ├── breadcrumbs.tsx                  # NEW: breadcrumb trail organism
│   │   │   ├── predio-selector.tsx              # NEW: header dropdown for predio switching
│   │   │   ├── notification-bell.tsx            # NEW: bell icon + badge (placeholder polling)
│   │   │   └── user-dropdown.tsx                # NEW: user avatar + dropdown menu
│   │   └── ui/
│   │       ├── badge.tsx                        # NEW: Badge atom
│   │       ├── button.tsx                       # NEW: Button atom (variants, sizes)
│   │       ├── dropdown-menu.tsx                # NEW: Radix DropdownMenu wrapper
│   │       ├── separator.tsx                    # NEW: Radix Separator wrapper
│   │       └── tooltip.tsx                      # NEW: Radix Tooltip wrapper
│   └── lib/
│       └── navigation.config.ts                 # NEW: NavigationItem[] — single source of truth
├── store/
│   └── sidebar.store.ts                         # NEW: Zustand sidebar state
```

**Total**: 14 new files, 1 modified file.

---

## 2. Navigation Config Architecture

### NavigationItem Type

```typescript
// shared/lib/navigation.config.ts

export interface NavigationItem {
  label: string;                    // Display label (i18n-ready: use Spanish directly for now)
  href?: string;                    // Leaf item URL (relative to /dashboard)
  icon: React.ComponentType<{ className?: string }>;  // Heroicons outline component
  iconActive?: React.ComponentType<{ className?: string }>;  // Heroicons solid (optional override)
  permission?: string | null;       // "module:action" or null (visible to all)
  children?: NavigationItem[];      // Nested items (accordion group)
  badge?: string | null;            // Optional text badge (e.g., "Nuevo")
}
```

### Permission Mapping

Each item with `permission` gets wrapped in `<Can permission={item.permission}>` at render time. Items with `permission: null` or omitted permission render unconditionally. The existing `Can` component from `modules/auth/components/can.tsx` handles the admin wildcard (`*`, `*:*`) automatically.

### Nested Children Structure

Groups like "Servicios", "Predios", "Maestros", "Reportes" have `children` arrays. The parent item has NO `href` — it acts as an accordion toggle. Children are rendered inside a collapsible `<ul>` with animation. The accordion auto-expands when any child's `href` matches the active route.

### Config Example (abbreviated)

```typescript
import {
  HomeIcon,
  CubeIcon,
  BuildingOffice2Icon,
  // ... outline icons
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  // ... solid icons
} from '@heroicons/react/24/solid';

export const navigationConfig: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconActive: HomeIconSolid, permission: null },
  {
    label: 'Servicios',
    icon: WrenchScrewdriverIcon,
    permission: null,
    children: [
      { label: 'Inseminación', href: '/servicios/inseminacion', icon: BeakerIcon, permission: 'servicios:read' },
      { label: 'Vacunación', href: '/servicios/vacunacion', icon: ShieldCheckIcon, permission: 'servicios:read' },
      // ...
    ],
  },
  // Predios, Animales, Maestros, Reportes, etc.
];
```

---

## 3. Sidebar Architecture

### sidebar.store.ts

```typescript
interface SidebarState {
  isCollapsed: boolean;     // tablet: icons-only (persisted to localStorage)
  isMobileOpen: boolean;    // mobile: overlay toggle (NOT persisted — ephemeral)
}

interface SidebarActions {
  toggleCollapsed(): void;
  setCollapsed(v: boolean): void;
  toggleMobile(): void;
  setMobileOpen(v: boolean): void;
}

// Persists isCollapsed only — localStorage via Zustand persist middleware
// Mobile state is ephemeral (reset on route change)
```

### Responsive Behavior

| Viewport | State | Mechanism |
|----------|-------|-----------|
| Mobile (< md=768px) | Hidden by default. Hamburger toggles overlay. | `<aside>` rendered inside mobile-sidebar.tsx with Radix Dialog backdrop |
| Tablet (md to xl-1: 768–1279px) | Icons-only (72px width). Tooltip on hover. | CSS `w-[72px]` + `<Tooltip>` wrappers. `isCollapsed` always true below xl. |
| Desktop (≥ xl=1280px) | Full sidebar (280px). Collapsible via toggle button. | CSS `w-[280px]` or `w-[72px]` based on `isCollapsed` state |

**Key decision**: Below xl breakpoint, sidebar is ALWAYS collapsed (icons-only). The `toggleCollapsed` button only works at xl+.

### Active Route Matching

```typescript
function isActiveRoute(itemHref: string, pathname: string): boolean {
  // Exact match for dashboard root
  if (itemHref === '/dashboard') return pathname === '/dashboard';
  // Prefix match for other routes (must match full segment)
  return pathname === itemHref || pathname.startsWith(itemHref + '/');
}
```

A parent group is "active" (auto-expanded) if any of its children match the active route.

### Nested Accordion

- Controlled by React `useState` for `expandedGroups: Set<string>` (keyed by label)
- Auto-expand on mount if active route matches a child
- Click toggles expand/collapse
- Animation: CSS `max-height` transition with `overflow-hidden`
- Arrow icon rotates 180° on expand (already styled via `menu-item-arrow-active` utility in globals.css)

### Mobile Overlay

- **Radix Dialog** (`@radix-ui/react-dialog`) for the mobile sidebar overlay
- Handles: backdrop click to close, ESC to close, focus trap, scroll lock on body
- Overlay uses z-index-99 (from globals.css: `--z-index-99: 9`)
- Sidebar panel slides in from left via CSS `translate-x` animation

### Tooltip for Collapsed Mode

- Radix Tooltip wraps each nav icon when `isCollapsed && viewport >= xl`
- Content: item label string
- Side: right, offset: 8px
- Import from `shared/components/ui/tooltip.tsx` (Radix wrapper)

---

## 4. Header Architecture

### PredioSelector

- Reads `usePredioStore(selectPredios)` and `selectPredioActivo`
- Renders dropdown (Radix DropdownMenu) with list of predios
- On select: calls `switchPredio(id)` — updates store + `lastSwitchTimestamp` for cache invalidation
- Shows `predioActivo.nombre` or "Seleccionar predio" placeholder
- Hidden if user has no predios (`predios.length === 0`)

### NotificationBell

- Renders `<BellIcon>` with a red badge (unread count, hardcoded `0` for now)
- Placeholder: 60s `setInterval` polling (no actual API — just a `useState<number>(0)` counter)
- Click: opens a Radix Popover with "No hay notificaciones" placeholder
- Badge uses `Badge` atom with `variant="error"` positioned `absolute -top-1 -right-1`

### UserDropdown

- Reads `useAuthStore(selectUser)` for `user.nombre`, `user.email`
- Shows user initials avatar (circle with first letters of nombre)
- Radix DropdownMenu with:
  - User info header (name + email)
  - `<Separator />`
  - "Perfil" link (future)
  - "Configuración" link (future)
  - `<Separator />`
  - "Cerrar sesión" → calls `useLogout().logout()`

### Responsive Header Layout

```
[Mobile: hamburger] [Logo] [PredioSelector] [NotificationBell] [UserDropdown]
```

- Mobile (< md): hamburger button visible (left side)
- Tablet+: hamburger hidden, sidebar has its own toggle button
- PredioSelector collapses to icon-only on mobile (shows first letter of predio name)
- NotificationBell and UserDropdown always visible

---

## 5. Breadcrumbs Architecture

### useBreadcrumbs() Hook

```typescript
// hooks/use-breadcrumbs.ts (in shared/components/layout/ or a hooks dir)

interface BreadcrumbSegment {
  label: string;           // Human-readable label
  href: string;            // Full path
  isCurrent: boolean;      // Last segment = current page
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname(); // next/navigation
  // Strip /dashboard prefix, split by /
  // Map each segment to label via ROUTE_LABEL_MAP
  // Build cumulative hrefs
  // Mark last as isCurrent (not clickable)
}
```

### Route-to-Label Mapping

```typescript
const ROUTE_LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  animales: 'Animales',
  servicios: 'Servicios',
  inseminacion: 'Inseminación',
  vacunacion: 'Vacunación',
  predios: 'Predios',
  maestros: 'Maestros',
  reportes: 'Reportes',
  usuarios: 'Usuarios',
  configuracion: 'Configuración',
  // Entity IDs will be resolved by a future hook (out of scope)
};
```

For unknown segments (e.g., UUIDs), show the segment as-is (humanized). A future hook point `resolveEntityName(segment, parentSegment)` will be provided for API resolution.

### Clickable vs Non-Clickable

- All segments except the LAST are clickable `<Link>` elements
- Last segment (current page) is a plain `<span>` with `font-medium`
- Separator between segments: `<span>/</span>` or ChevronRight icon

---

## 6. UI Atoms Design

### Button (`shared/components/ui/button.tsx`)

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

Uses `tailwind-merge` (`cn` utility) + `cva` (class-variance-authority) OR manual variant map. Given the project doesn't have `cva`, use a simple variant object approach.

### Badge (`shared/components/ui/badge.tsx`)

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand';
  size?: 'sm' | 'md';
}
```

Uses brand/error/success/warning color tokens from globals.css.

### DropdownMenu (`shared/components/ui/dropdown-menu.tsx`)

Thin wrapper around `@radix-ui/react-dropdown-menu`. Re-exports Root, Trigger, Content, Item, Separator, Label. Applies Tailwind classes for consistent styling.

### Tooltip (`shared/components/ui/tooltip.tsx`)

Thin wrapper around `@radix-ui/react-tooltip`. Re-exports Provider, Root, Trigger, Content. Applies shadow-tooltip from globals.css.

### Separator (`shared/components/ui/separator.tsx`)

Thin wrapper around `@radix-ui/react-separator`. Props: `orientation`, `decorative`.

---

## 7. Layout Integration

### Composition in `(dashboard)/layout.tsx`

```typescript
import { AdminLayout } from '@/shared/components/layout/admin-layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

### AdminLayout Component

```
<div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
  <AdminSidebar />          {/* Desktop/tablet: fixed left aside */}
  <MobileSidebar />         {/* Mobile: Radix Dialog overlay */}
  <div className="flex flex-1 flex-col xl:ml-[280px] md:ml-[72px]">
    <AdminHeader />
    <div className="flex-1 p-4 md:p-6">
      <Breadcrumbs />
      <main className="mt-4">{children}</main>
    </div>
  </div>
</div>
```

**Key**: The sidebar is NOT flex-shrink sibling on mobile (it's an overlay). On tablet/desktop it's a fixed-width `<aside>` with the main content offset via `margin-left`.

### Z-Index Stacking

| Layer | z-index | Source |
|-------|---------|--------|
| Mobile overlay backdrop | z-99 | globals.css `--z-index-99` |
| Mobile sidebar panel | z-99 (same as backdrop — Dialog handles stacking) | Radix Dialog |
| Dropdown menus | z-9999 | globals.css `--z-index-9999` |
| Tooltips | z-99999 | globals.css `--z-index-99999` |

### Layout Strategy

**CSS Flexbox** — not Grid. The sidebar + content is a simple flex row. The internal header + breadcrumbs + main content is a flex column. This matches the existing placeholder layout pattern.

---

## 8. State Architecture

### Stores Interaction

```
sidebar.store ─── isCollapsed, isMobileOpen (layout-local state)
    │
auth.store ───── user, permissions (for UserDropdown, Can filtering)
    │
predio.store ─── predios, predioActivo (for PredioSelector)
    │
useLogout() ──── clears auth.store + predio.store, redirects to /login
```

**No cross-store dependencies**: Each store is independent. The `useLogout` hook is the only place that coordinates clearing multiple stores (explicit, testable pattern established in auth module).

### Sidebar State Persistence

- `isCollapsed` → persisted to `localStorage` via Zustand `persist` middleware (key: `ganatrack-sidebar`)
- `isMobileOpen` → ephemeral, reset on every route change via `useEffect` watching `pathname`

---

## 9. Dependency Decisions

| Package | Version | Why | Alternatives Rejected |
|---------|---------|-----|----------------------|
| @radix-ui/react-dropdown-menu | ^2.1.0 | Accessible dropdown, keyboard nav, portal rendering, works with Tailwind | Headless UI (less feature-rich), custom (accessibility risk) |
| @radix-ui/react-tooltip | ^1.1.0 | Accessible tooltip with delay, positioning, portal | Tippy.js (heavier), custom (a11y gaps) |
| @radix-ui/react-separator | ^1.1.0 | Semantic separator with orientation support | Manual `<hr>` (less semantic) |
| @radix-ui/react-dialog | ^1.1.0 | Mobile overlay: focus trap, ESC, scroll lock, backdrop | Custom modal (a11y risk), @headlessui/dialog (less popular) |
| @heroicons/react | ^2.2.0 | Official Tailwind icons, outline+solid variants, tree-shakeable | Lucide (different style), react-icons (bloat), custom SVGs (maintenance) |
| tailwind-merge | ^2.6.0 | Already installed. Used for `cn()` utility to merge Tailwind classes safely | clsx (doesn't dedupe Tailwind classes) |

### Heroicons Usage Pattern

```typescript
// Outline for inactive sidebar items:
import { HomeIcon } from '@heroicons/react/24/outline';
// Solid for active sidebar items:
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
```

Both variants exist for every Heroicon. NavigationItem type supports optional `iconActive` for solid override.

---

## Data Flow

### Sidebar Render (desktop/tablet)

```
navigationConfig[]
    │
    └─→ sidebar-nav.tsx (maps items)
            │
            ├─→ For each item with permission:
            │       <Can permission={item.permission}>
            │           <SidebarNavItem />
            │       </Can>
            │
            ├─→ For items with children:
            │       <SidebarNavItem> (accordion toggle)
            │           └─→ <ul> with child SidebarNavItems
            │
            └─→ isActiveRoute(item.href, usePathname()) → highlight
```

### Mobile Sidebar Toggle

```
Header hamburger click → sidebarStore.toggleMobile()
    │
    └─→ MobileSidebar re-renders (isMobileOpen=true)
            │
            ├─→ Radix Dialog opens
            ├─→ Body scroll locked
            └─→ <AdminSidebar variant="mobile" /> renders inside Dialog.Content
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `sidebar.store.ts`: toggleCollapsed, setMobileOpen | Vitest: direct store manipulation |
| Unit | `isActiveRoute()`: exact match, prefix match, edge cases | Vitest: parametrized tests |
| Unit | `useBreadcrumbs()`: pathname → segments mapping | Vitest + renderHook |
| Unit | Navigation config: all items have valid hrefs/permissions | Vitest: static analysis |
| Unit | `Badge`, `Button` variants render correct classes | Vitest + RTL |
| Integration | `SidebarNav`: config + permissions → rendered items | Vitest + RTL + mock authStore |
| Integration | `UserDropdown`: click logout → stores cleared + redirect | Vitest + RTL + mock useLogout |
| Integration | `PredioSelector`: select predio → store updated | Vitest + RTL |
| Integration | Mobile sidebar: toggle → dialog opens/closes | Vitest + RTL |

---

## Open Questions

- [ ] Should sidebar `isCollapsed` persist per-device (current) or sync across tabs? → **Decision**: per-device localStorage is fine for now.
- [ ] Notification API shape (out of scope for this phase, but Bell component needs to be extensible) → Provide a `useNotifications()` hook placeholder that returns `{ count: number, isLoading: boolean }`.
- [ ] Entity name resolution in breadcrumbs — provide hook signature but no implementation (deferred to data modules).
