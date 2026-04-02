// apps/web/src/shared/components/layout/admin-header.tsx
/**
 * AdminHeader — top header bar for the dashboard.
 *
 * Layout:
 * - Flex row, items-center, justify-between
 * - Left: Hamburger button (mobile only, xl:hidden) + Breadcrumbs
 * - Right: SitioSelector + NotificationBell + UserDropdown
 * - Height: h-16, border-bottom
 *
 * Props:
 * - onMobileMenuToggle: function to open mobile sidebar
 */

'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import { useSidebarStore } from '@/store/sidebar.store';
import { SitioSelector } from './sitio-selector';
import { NotificationBell } from './notification-bell';
import { UserDropdown } from './user-dropdown';
import { Breadcrumbs } from './breadcrumbs/breadcrumbs';

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps): JSX.Element {
  const toggleMobileOpen = useSidebarStore((s) => s.toggleMobile);

  function handleMobileMenuToggle(): void {
    toggleMobileOpen();
    onMobileMenuToggle();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:px-6">
      {/* Left: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="xl:hidden flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          onClick={handleMobileMenuToggle}
          aria-label="Abrir menú"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Right: SitioSelector + NotificationBell + UserDropdown */}
      <div className="flex items-center gap-2">
        <SitioSelector />
        <NotificationBell />
        <UserDropdown />
      </div>
    </header>
  );
}
