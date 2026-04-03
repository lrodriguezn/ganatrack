**What**: Implemented complete authenticated dashboard shell — sidebar, header, breadcrumbs, UI atoms
**Why**: Phase 3 of frontend roadmap, gives structure to all dashboard content
**Where**: shared/components/layout/, shared/components/ui/, store/sidebar.store.ts

## Files Created (14 new + 1 modified)

### shared/components/ui/ (5 atoms)
- button.tsx — 4 variants (primary/secondary/ghost/danger), 3 sizes, loading state
- badge.tsx — count display with max cap, hidden at 0
- dropdown-menu.tsx — Radix wrapper with Tailwind
- tooltip.tsx — Radix wrapper, 400ms delay
- separator.tsx — Radix wrapper

### shared/components/layout/ (11 components)
- navigation.config.ts — 11 root modules, NavItem interface, RBAC permission mapping
- sidebar.store.ts — Zustand with localStorage persist (isCollapsed only)
- sidebar-nav-item.tsx — active route highlighting, accordion, RBAC via Can
- sidebar-nav.tsx — maps NAVIGATION_ITEMS
- admin-sidebar.tsx — 280px desktop, 72px tablet
- mobile-sidebar.tsx — Radix Dialog overlay, ESC/backdrop close
- sitio-selector.tsx — single predio = text, multiple = dropdown
- notification-bell.tsx — bell icon + badge
- user-dropdown.tsx — avatar + name/email + logout
- admin-header.tsx — hamburger + breadcrumbs + right-side controls
- admin-layout.tsx — orchestrator: sidebar + header + breadcrumbs + content

### breadcrumbs/
- use-breadcrumbs.ts — usePathname() → segments, ROUTE_LABEL_MAP, entity IDs → "..."
- breadcrumbs.tsx — clickable segments, chevron separators, last = plain text

### Modified
- app/(dashboard)/layout.tsx — replaced placeholder with AdminLayout

## Build: ✅ PASS (6/6 pages, 32kB middleware)
## Typecheck: ✅ PASS (tsc --noEmit via next build)

## Navigation Structure
Dashboard → Animales → Servicios (Palpaciones, Inseminaciones, Partos, Veterinarios) → Predios (Potreros, Sectores, Lotes, Grupos) → Maestros (8 sub-items) → Configuración → Productos → Reportes → Notificaciones → Usuarios (admin only)

## Responsive Behavior
- Mobile (<768px): hamburger + Radix Dialog overlay, body scroll locked
- Tablet (768-1279px): 72px sidebar (icons only + tooltips)
- Desktop (≥1280px): 280px sidebar (icons + text), always visible
