**What**: Comprehensive exploration of layout-navigation requirements for GanaTrack frontend
**Why**: Need to implement sidebar, header, breadcrumbs for authenticated dashboard
**Where**: apps/web/src/app/(dashboard)/layout.tsx and new shared components
**Learned**: Current state has minimal placeholder layout, need to build everything from scratch following PRD specs

## Exploration: Layout-Navigation for GanaTrack Dashboard

### Current State

**Files and Structure:**
- `apps/web/src/app/(dashboard)/layout.tsx`: Minimal placeholder with comments indicating future sidebar/header
- `apps/web/src/app/layout.tsx`: Root layout with Outfit font and AppProviders
- `apps/web/src/shared/providers/app-providers.tsx`: Currently only wraps with AuthProvider
- No existing sidebar, header, or breadcrumb components found
- No Radix UI or other UI libraries installed yet (only basic dependencies)

**Current Dependencies:**
- Next.js 15.1.6, React 18.3.1, TypeScript 5.9.3
- Zustand for state management
- Tailwind CSS v4 for styling
- No Radix UI, no icon libraries, no additional UI components

**Auth Module Status:**
- Complete authentication system with login, 2FA, JWT, RBAC
- `Can` component and `usePermission` hook available for role-based access control
- Auth store contains user permissions array
- Multi-predio switching implemented

### Layout/Navigation Requirements from PRDs

#### 1. Sidebar Structure (Section 12.1)
- **11 main modules** with hierarchical organization:
  - Dashboard (/)
  - Animales (/animales)
  - Servicios (with sub-items: Palpaciones, Inseminaciones, Partos, Veterinarios)
  - Predios (with sub-items: Lista, Potreros, Sectores, Lotes, Grupos)
  - Maestros (with 8 sub-items)
  - Configuración
  - Productos
  - Reportes (with 5 sub-items)
  - Notificaciones
  - Usuarios (admin only)

- **RBAC Integration**: Items without permission must be hidden from DOM (not just disabled)
- **Active Item**: Must be visually highlighted with 'active' class
- **Responsive Behavior**:
  - Mobile (<768px): Hidden by default, hamburger toggle, overlay when open
  - Tablet (768-1279px): Collapsed (icons only)
  - Desktop (≥1280px): Expanded (icons + text), always visible

#### 2. Header Requirements (Section 12.4)
- **Predio Selector**: Dropdown showing active predio name, allows switching
  - If user has only one predio, show as non-interactive text
- **Notification Bell**: Shows unread count badge
  - Badge updates every 60 seconds via polling to `/api/v1/notificaciones/resumen`
  - Shows "99+" for counts over 99
- **User Info**: User name/dropdown with logout option
- **Mobile Responsiveness**: Must adapt to different screen sizes

#### 3. Breadcrumbs (Section 12.2)
- **Automatic Generation**: Based on current pathname using `usePathname()`
- **Hierarchical Display**: Shows full path (e.g., Dashboard > Animales > Brahman #001 > Editar)
- **Clickable Segments**: All segments except last are clickable links
- **Entity Name Overrides**: Replace UUIDs with actual names (e.g., animal name instead of ID)

#### 4. Technical Specifications
- **Radix UI Primitives**: Required for accessible components (already in stack per PRD)
- **Icons**: Heroicons or template SVGs for consistency
- **Responsive Breakpoints**:
  - Mobile: <768px
  - Tablet: 768-1279px  
  - Desktop: ≥1280px
- **Component Hierarchy**:
  - Atoms: Button, Badge, Dropdown
  - Molecules: PredioSelector, NotificationBell
  - Organisms: Sidebar, Header, Breadcrumbs
  - Templates: AdminLayout (combines all)

### Navigation Menu Structure with Role Visibility

```
Dashboard (all roles)
Animales (animales:ver)
Servicios (servicios:ver)
├── Palpaciones (servicios:ver)
├── Inseminaciones (servicios:ver)
├── Partos (servicios:ver)
└── Veterinarios (servicios:ver)
Predios (predios:ver)
├── Potreros (predios:ver)
├── Sectores (predios:ver)
├── Lotes (predios:ver)
└── Grupos (predios:ver)
Maestros (maestros:ver)
├── Veterinarios (maestros:ver)
├── Propietarios (maestros:ver)
├── Hierros (maestros:ver)
├── Diagnósticos (maestros:ver)
├── Motivos de Venta (maestros:ver)
├── Causas de Muerte (maestros:ver)
├── Lugares de Compra (maestros:ver)
└── Lugares de Venta (maestros:ver)
Configuración (configuracion:ver)
Productos (productos:ver)
Reportes (reportes:ver)
Notificaciones (notificaciones:ver)
Usuarios (usuarios:ver) [admin only]
```

**Role-Based Visibility:**
- **Admin**: Sees all items
- **Operario**: Sees operational items (Animales, Servicios, Predios, etc.) but not Usuarios
- **Visor**: Read-only access, sees most items but without creation/edition buttons

### Technical Decisions

#### Sidebar Behavior
- **Collapsible**: Desktop shows icons+text, tablet shows icons only, mobile shows hamburger
- **Persistent State**: Use Zustand or localStorage to remember collapse state
- **Active Route Highlighting**: Use Next.js `usePathname()` to determine active item
- **Nested Routes**: Support for multi-level nested navigation (e.g., /servicios/palpaciones)

#### Icons Library
- **Heroicons**: Already specified in PRD stack
- **Implementation**: Install `@heroicons/react` for React components
- **Usage**: Use outline style for consistency with Tailwind

#### Radix UI Components Needed
Based on PRD stack and requirements:
- `@radix-ui/react-dialog` (for modals)
- `@radix-ui/react-dropdown-menu` (for user dropdown, notifications)
- `@radix-ui/react-navigation-menu` (for sidebar navigation)
- `@radix-ui/react-separator` (for visual dividers)
- `@radix-ui/react-tooltip` (for hover tooltips)

#### Component Hierarchy
```
src/shared/components/
├── ui/ (Atoms & Molecules)
│   ├── button.tsx
│   ├── badge.tsx
│   ├── dropdown-menu.tsx
│   ├── separator.tsx
│   └── tooltip.tsx
├── layout/ (Organisms)
│   ├── admin-sidebar.tsx
│   ├── admin-header.tsx
│   ├── breadcrumbs.tsx
│   └── page-header.tsx
└── feedback/
    ├── toast-provider.tsx
    └── loading-spinner.tsx
```

### Dependency Analysis

**Missing Dependencies to Install:**
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-separator`
- `@radix-ui/react-tooltip`
- `@heroicons/react` (for icons)
- `lucide-react` (alternative icon library, optional)

**Available Dependencies:**
- Next.js App Router (for layout structure)
- Zustand (for sidebar state management)
- Tailwind CSS v4 (for styling)
- TypeScript (for type safety)

### Risks and Gotchas

1. **Radix UI Learning Curve**: Team may need time to learn Radix primitives
2. **Responsive Complexity**: Mobile sidebar behavior requires careful state management
3. **Permission Performance**: Checking permissions for every sidebar item could impact performance
4. **Nested Route Handling**: Multi-level navigation requires proper route matching logic
5. **Icon Consistency**: Need to establish consistent icon naming and usage patterns
6. **Accessibility**: Must ensure all components meet WCAG standards (Radix helps but requires proper implementation)

### Recommended Next Phase

**Phase 1: Setup and Foundation**
- Install missing Radix UI and icon dependencies
- Create basic shared component structure
- Implement responsive layout foundation

**Phase 2: Sidebar Implementation**
- Create navigation data structure with permission mapping
- Build collapsible sidebar component
- Implement active route highlighting
- Add RBAC integration with Can component

**Phase 3: Header Implementation**
- Build header with predio selector
- Implement notification bell with badge
- Add user dropdown with logout
- Connect to stores and services

**Phase 4: Breadcrumbs**
- Create breadcrumb generation logic
- Implement entity name resolution
- Add clickable segments

**Phase 5: Integration and Testing**
- Combine all components in AdminLayout
- Test responsive behavior
- Verify RBAC works correctly
- Test accessibility compliance

**Estimated Timeline**: 3-5 days for full implementation
