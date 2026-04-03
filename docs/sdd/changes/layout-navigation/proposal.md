# Proposal: Layout + Navigation — GanaTrack

## Intent

Implement the complete authenticated shell layout for GanaTrack dashboard: sidebar navigation, header with predio selector + notification bell + user dropdown, and auto-generated breadcrumbs. The current dashboard layout is a minimal placeholder with comments — this proposal replaces it with a production-ready responsive layout following Screaming Architecture and Container-Presentational pattern.

**Why now**: Auth module is complete (login, 2FA, JWT, RBAC, multi-predio). The dashboard layout is the next dependency — all feature modules (Animales, Servicios, Predios, etc.) require navigation to be accessible.

## Scope

### In Scope
- **Sidebar**: Collapsible, 11 navigation modules with RBAC visibility (`Can` component), active route highlighting via `usePathname()`, nested groups (Servicios, Predios, Maestros, Reportes)
- **Header**: Predio selector dropdown, notification bell with unread badge (60s polling placeholder), user dropdown with logout
- **Breadcrumbs**: Auto-generated from pathname, clickable segments, entity name overrides (future hook point)
- **Responsive**: Mobile (<768px) hamburger + overlay, Tablet (768-1279px) collapsed icons-only, Desktop (≥1280px) expanded
- **UI Atoms**: Button, Badge, DropdownMenu, Tooltip, Separator (Radix primitives wrapped)
- **State**: Zustand store for sidebar collapse (persisted)

### Out of Scope
- Actual notification API integration (mock placeholder only)
- Entity name resolution in breadcrumbs (hook provided, actual API calls deferred)
- Toast/notification system
- Loading skeletons for layout
- Theme toggle (dark mode deferred)
- Page-level headers (`PageHeader` component deferred to each module)

## Capabilities

### New Capabilities
- `layout-sidebar`: Collapsible sidebar with RBAC-filtered navigation, active route highlighting, responsive behavior
- `layout-header`: Header bar with predio selector, notification bell badge, user dropdown/logout
- `layout-breadcrumbs`: Auto-generated breadcrumb trail from pathname with clickable segments
- `ui-radix-atoms`: Wrapped Radix primitives (DropdownMenu, Tooltip, Separator, Badge) as reusable atoms

### Modified Capabilities
- None (no existing specs to modify)

## Approach

**Architecture**: Screaming Architecture — all layout components live in `src/shared/components/layout/`, UI atoms in `src/shared/components/ui/`. No feature-specific code in layout.

**Pattern**: Container-Presentational
- **Containers** (in `shared/components/layout/`): Handle data fetching, store connections, permission checks
- **Presentational** (in `shared/components/ui/`): Pure UI, props-driven, no side effects

**Navigation Data**: Centralized `navigation.config.ts` in `shared/lib/` — single source of truth for menu items, routes, icons, permission keys. Sidebar renders from config.

**State**: Zustand store `sidebar.store.ts` with `isOpen` (mobile) and `isCollapsed` (tablet) persisted to localStorage.

**Icons**: Heroicons (`@heroicons/react`) — outline style for sidebar, solid for active state.

**Responsive Strategy**:
- CSS media queries via Tailwind (`md:`, `lg:`) for visual changes
- Zustand + JS resize listener for sidebar state transitions
- Mobile: `<aside>` rendered conditionally with backdrop overlay
- Tablet: `<aside>` always rendered, width 72px (icons only)
- Desktop: `<aside>` always rendered, width 280px (full)

**RBAC Integration**: Reuse existing `Can` component and `usePermission` hook from auth module. Each nav item has `permission: string | null` — null means visible to all.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/app/(dashboard)/layout.tsx` | Modified | Replace placeholder with AdminLayout shell |
| `apps/web/src/shared/components/layout/admin-sidebar.tsx` | New | Sidebar organism |
| `apps/web/src/shared/components/layout/admin-header.tsx` | New | Header organism |
| `apps/web/src/shared/components/layout/breadcrumbs.tsx` | New | Breadcrumbs organism |
| `apps/web/src/shared/components/layout/mobile-sidebar.tsx` | New | Mobile overlay variant |
| `apps/web/src/shared/components/ui/badge.tsx` | New | Badge atom |
| `apps/web/src/shared/components/ui/tooltip.tsx` | New | Tooltip wrapper |
| `apps/web/src/shared/components/ui/dropdown-menu.tsx` | New | Radix dropdown wrapper |
| `apps/web/src/shared/components/ui/separator.tsx` | New | Separator atom |
| `apps/web/src/shared/lib/navigation.config.ts` | New | Navigation menu config |
| `apps/web/src/store/sidebar.store.ts` | New | Sidebar state (Zustand) |
| `apps/web/package.json` | Modified | Add Radix + Heroicons deps |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Radix + Tailwind v4 CSS variable conflicts | Medium | Test early; Radix works with Tailwind v4 via data attributes, not conflicting |
| Sidebar state desync on rapid resize | Low | Debounce resize listener, single source of truth in Zustand |
| RBAC permission checks on every render | Low | Memoize filtered nav items, `Can` component already optimized |
| Mobile overlay scroll lock issues | Medium | Use `overflow-hidden` on body when overlay open, Radix Dialog handles this |
| Heroicons tree-shaking bloat | Low | Import individual icons, not entire library |

## Rollback Plan

1. Revert `layout.tsx` to placeholder version (git restore)
2. Delete new `shared/components/layout/` and `shared/components/ui/` files
3. Remove `sidebar.store.ts` and `navigation.config.ts`
4. Uninstall Radix + Heroicons from `package.json`
5. Run `pnpm install` to clean node_modules

No data migration needed — pure UI layer, no database changes.

## Dependencies

**Install required:**
```json
{
  "@radix-ui/react-dropdown-menu": "^2.1.0",
  "@radix-ui/react-tooltip": "^1.1.0",
  "@radix-ui/react-separator": "^1.1.0",
  "@heroicons/react": "^2.2.0"
}
```

**Already available:**
- Zustand (sidebar store)
- Next.js App Router (layout structure)
- Tailwind CSS v4 (styling)
- `Can` component + `usePermission` hook (RBAC)
- Auth store (user info, predio)

## Success Criteria

- [ ] Sidebar renders 11 modules with correct hierarchy and RBAC filtering
- [ ] Active route is visually highlighted
- [ ] Sidebar collapses to icons on tablet (768-1279px)
- [ ] Sidebar hidden on mobile, hamburger toggles overlay
- [ ] Header shows predio selector, notification bell (placeholder), user dropdown with logout
- [ ] Breadcrumbs auto-generate from pathname, segments are clickable
- [ ] All components pass TypeScript strict mode (`pnpm typecheck`)
- [ ] No console errors on navigation between dashboard routes
- [ ] Layout works on Chrome, Firefox, Safari (desktop + mobile viewport)

## Estimated Size

~12 files (8 new components + 2 new configs + 2 modified), ~600-800 lines total.
