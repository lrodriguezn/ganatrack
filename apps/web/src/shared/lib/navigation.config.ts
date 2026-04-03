// apps/web/src/shared/lib/navigation.config.ts
/**
 * Navigation configuration — single source of truth for sidebar navigation.
 *
 * Each navigation item contains:
 * - label: Human-readable text displayed in sidebar (Spanish)
 * - href: Route path (relative to /dashboard)
 * - icon: Heroicons outline component
 * - permission: Optional "module:action" string, null = visible to all
 * - children: Optional nested items for accordion groups
 *
 * Used by sidebar-nav.tsx to render the navigation tree.
 */

import type { ComponentType } from 'react';
import {
  HomeIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  FolderOpenIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  BellIcon,
  UsersIcon,
  BeakerIcon,
  ShieldCheckIcon,
  HeartIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  MapIcon,
  RectangleStackIcon,
  Square3Stack3DIcon,
  UserGroupIcon,
  ArchiveBoxArrowDownIcon,
  MapPinIcon as MapPinIconSolid,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CpuChipIcon as CpuChipIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  MapPinIcon as MapPinIconSolidOutline,
  FolderOpenIcon as FolderOpenIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  BellIcon as BellIconSolid,
  UsersIcon as UsersIconSolid,
} from '@heroicons/react/24/solid';

/**
 * Heroicon component type — accepts className and returns a React node.
 */
type HeroIcon = ComponentType<{ className?: string }>;

/**
 * Navigation item interface.
 */
export interface NavItem {
  label: string;
  href?: string;
  icon: HeroIcon;
  iconActive?: HeroIcon;
  permission: string | null;
  children?: NavItem[];
}

/**
 * Helper to create leaf nav items (no children).
 */
function leaf(
  label: string,
  href: string,
  icon: HeroIcon,
  iconActive: HeroIcon,
  permission: string | null,
): NavItem {
  return { label, href, icon, iconActive, permission };
}

/**
 * Helper to create group nav items (with children, no href).
 */
function group(
  label: string,
  icon: HeroIcon,
  iconActive: HeroIcon,
  permission: string | null,
  children: NavItem[],
): NavItem {
  return { label, icon, iconActive, permission, children };
}

// ============================================================================
// Servicios children
// ============================================================================
const palpaciones = leaf(
  'Palpaciones',
  '/dashboard/servicios/palpaciones',
  BeakerIcon,
  BeakerIcon,
  'servicios:read',
);
const inseminaciones = leaf(
  'Inseminaciones',
  '/dashboard/servicios/inseminaciones',
  HeartIcon,
  HeartIcon,
  'servicios:read',
);
const partos = leaf(
  'Partos',
  '/dashboard/servicios/partos',
  ClipboardDocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  'servicios:read',
);
const veterinarios = leaf(
  'Servicios Veterinarios',
  '/dashboard/servicios/veterinarios',
  ShieldCheckIcon,
  ShieldCheckIcon,
  'servicios:read',
);

// ============================================================================
// Predios children
// ============================================================================
const predios = leaf(
  'Predios',
  '/dashboard/predios',
  MapPinIcon,
  MapPinIconSolidOutline,
  'predios:read',
);
const potreros = leaf(
  'Potreros',
  '/dashboard/predios/potreros',
  MapIcon,
  MapIcon,
  'predios:read',
);
const sectores = leaf(
  'Sectores',
  '/dashboard/predios/sectores',
  RectangleStackIcon,
  RectangleStackIcon,
  'predios:read',
);
const lotes = leaf(
  'Lotes',
  '/dashboard/predios/lotes',
  Square3Stack3DIcon,
  Square3Stack3DIcon,
  'predios:read',
);
const grupos = leaf(
  'Grupos',
  '/dashboard/predios/grupos',
  UserGroupIcon,
  UserGroupIcon,
  'predios:read',
);

// ============================================================================
// Maestros children — 8 entidades maestro
// ============================================================================
const veterinarios = leaf(
  'Veterinarios',
  '/dashboard/maestros/veterinarios',
  ShieldCheckIcon,
  ShieldCheckIcon,
  'maestros:read',
);
const propietarios = leaf(
  'Propietarios',
  '/dashboard/maestros/propietarios',
  UsersIcon,
  UsersIconSolid,
  'maestros:read',
);
const hierros = leaf(
  'Hierros',
  '/dashboard/maestros/hierros',
  ArchiveBoxIcon,
  ArchiveBoxIconSolid,
  'maestros:read',
);
const diagnosticos = leaf(
  'Diagnósticos',
  '/dashboard/maestros/diagnosticos',
  BeakerIcon,
  BeakerIcon,
  'maestros:read',
);
const motivosVentas = leaf(
  'Motivos de Venta',
  '/dashboard/maestros/motivos-ventas',
  TruckIcon,
  TruckIcon,
  'maestros:read',
);
const causasMuerte = leaf(
  'Causas de Muerte',
  '/dashboard/maestros/causas-muerte',
  ExclamationTriangleIcon,
  ExclamationTriangleIcon,
  'maestros:read',
);
const lugaresCompras = leaf(
  'Lugares de Compra',
  '/dashboard/maestros/lugares-compras',
  MapPinIcon,
  MapPinIconSolidOutline,
  'maestros:read',
);
const lugaresVentas = leaf(
  'Lugares de Venta',
  '/dashboard/maestros/lugares-ventas',
  MapPinIconSolid,
  MapPinIconSolid,
  'maestros:read',
);

// ============================================================================
// Reportes children
// ============================================================================
const reporteProductividad = leaf(
  'Productividad',
  '/dashboard/reportes/productividad',
  ChartBarIcon,
  ChartBarIconSolid,
  'reportes:read',
);
const reporteInventario = leaf(
  'Inventario',
  '/dashboard/reportes/inventario',
  ArchiveBoxArrowDownIcon,
  ArchiveBoxArrowDownIcon,
  'reportes:read',
);
const reporteSalud = leaf(
  'Salud',
  '/dashboard/reportes/salud',
  HeartIcon,
  HeartIcon,
  'reportes:read',
);
const reporteMovimientos = leaf(
  'Movimientos',
  '/dashboard/reportes/movimientos',
  TruckIcon,
  TruckIcon,
  'reportes:read',
);
const reporteGeneral = leaf(
  'General',
  '/dashboard/reportes/general',
  ClipboardDocumentListIcon,
  ClipboardDocumentListIconSolid,
  'reportes:read',
);

// ============================================================================
// Root navigation items
// ============================================================================
export const NAVIGATION_ITEMS: NavItem[] = [
  // 1. Dashboard
  leaf('Dashboard', '/dashboard', HomeIcon, HomeIconSolid, null),

  // 2. Animales
  leaf('Animales', '/dashboard/animales', CpuChipIcon, CpuChipIconSolid, 'animales:read'),

  // 3. Servicios (group)
  group(
    'Servicios',
    ClipboardDocumentListIcon,
    ClipboardDocumentListIconSolid,
    'servicios:read',
    [palpaciones, inseminaciones, partos, veterinarios],
  ),

  // 4. Predios (group)
  group(
    'Predios',
    MapPinIcon,
    MapPinIconSolidOutline,
    'predios:read',
    [predios, potreros, sectores, lotes, grupos],
  ),

  // 5. Maestros (group)
  group(
    'Maestros',
    FolderOpenIcon,
    FolderOpenIconSolid,
    'maestros:read',
    [veterinarios, propietarios, hierros, diagnosticos, motivosVentas, causasMuerte, lugaresCompras, lugaresVentas],
  ),

  // 6. Configuración
  leaf('Configuración', '/dashboard/configuracion', Cog6ToothIcon, Cog6ToothIconSolid, 'configuracion:read'),

  // 7. Productos
  leaf('Productos', '/dashboard/productos', ArchiveBoxIcon, ArchiveBoxIconSolid, 'productos:read'),

  // 8. Reportes (group)
  group(
    'Reportes',
    ChartBarIcon,
    ChartBarIconSolid,
    'reportes:read',
    [reporteProductividad, reporteInventario, reporteSalud, reporteMovimientos, reporteGeneral],
  ),

  // 9. Notificaciones
  leaf('Notificaciones', '/dashboard/notificaciones', BellIcon, BellIconSolid, 'notificaciones:read'),

  // 10. Usuarios
  leaf('Usuarios', '/dashboard/usuarios', UsersIcon, UsersIconSolid, 'usuarios:read'),
];
