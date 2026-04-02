// apps/web/src/shared/components/layout/sidebar-nav.tsx
/**
 * SidebarNav — renders the navigation list from NAVIGATION_ITEMS config.
 *
 * Imports NAVIGATION_ITEMS and maps over each root item,
 * wrapping with <Can> for RBAC filtering.
 */

'use client';

import { NAVIGATION_ITEMS } from '@/shared/lib/navigation.config';
import { SidebarNavItem } from './sidebar-nav-item';

interface SidebarNavProps {
  isCollapsed?: boolean;
}

export function SidebarNav({ isCollapsed = false }: SidebarNavProps): JSX.Element {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {NAVIGATION_ITEMS.map((item) => (
        <SidebarNavItem
          key={item.label}
          item={item}
          isCollapsed={isCollapsed}
          depth={0}
        />
      ))}
    </nav>
  );
}
