// apps/web/src/shared/components/layout/breadcrumbs/use-breadcrumbs.ts
/**
 * useBreadcrumbs — hook to generate breadcrumb segments from pathname.
 *
 * Features:
 * - Uses usePathname() from next/navigation
 * - Maps path segments to human-readable Spanish labels via ROUTE_LABEL_MAP
 * - Entity IDs (numeric or UUID) display as "..." placeholder
 * - Each segment's href is the cumulative path up to that segment
 *
 * Returns BreadcrumbSegment[] with label, href, and isLast flag.
 */

'use client';

import { usePathname } from 'next/navigation';

/**
 * Route segment to label mapping (Spanish).
 */
const ROUTE_LABEL_MAP: Record<string, string> = {
  dashboard: 'Inicio',
  animales: 'Animales',
  servicios: 'Servicios',
  palpaciones: 'Palpaciones',
  inseminaciones: 'Inseminaciones',
  partos: 'Partos',
  veterinarios: 'Servicios Veterinarios',
  predios: 'Predios',
  potreros: 'Potreros',
  sectores: 'Sectores',
  lotes: 'Lotes',
  grupos: 'Grupos',
  maestros: 'Maestros',
  empleados: 'Empleados',
  medicamentos: 'Medicamentos',
  insumos: 'Insumos',
  equipos: 'Equipos',
  razas: 'Razas',
  estados: 'Estados',
  alertas: 'Alertas',
  configuracion: 'Configuración',
  productos: 'Productos',
  reportes: 'Reportes',
  productividad: 'Productividad',
  inventario: 'Inventario',
  salud: 'Salud',
  movimientos: 'Movimientos',
  general: 'General',
  notificaciones: 'Notificaciones',
  usuarios: 'Usuarios',
};

/**
 * Patterns for entity ID segments that should display as "...".
 */
const NUMERIC_PATTERN = /^\d+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Breadcrumb segment interface.
 */
export interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

/**
 * Generate breadcrumb segments from the current pathname.
 *
 * @returns Array of breadcrumb segments from root to current page.
 */
export function useBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();

  // Strip leading /dashboard prefix if present
  const pathWithoutDashboard = pathname.startsWith('/dashboard')
    ? pathname.slice('/dashboard'.length)
    : pathname;

  // Split by '/' and filter empty segments
  const segments = pathWithoutDashboard.split('/').filter(Boolean);

  // Build cumulative hrefs and map to labels
  const breadcrumbs: BreadcrumbSegment[] = [];
  let cumulativeHref = '/dashboard';

  segments.forEach((segment, index) => {
    // Build href up to and including this segment
    cumulativeHref = `${cumulativeHref}/${segment}`;

    // Determine label
    let label: string;

    if (NUMERIC_PATTERN.test(segment) || UUID_PATTERN.test(segment)) {
      // Entity ID — show placeholder
      label = '...';
    } else {
      // Look up in route map, or humanize the segment
      label = ROUTE_LABEL_MAP[segment] ?? humanizeSegment(segment);
    }

    breadcrumbs.push({
      label,
      href: cumulativeHref,
      isLast: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}

/**
 * Humanize a path segment: replace hyphens with spaces, capitalize.
 */
function humanizeSegment(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
