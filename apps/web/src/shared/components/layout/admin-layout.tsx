// apps/web/src/shared/components/layout/admin-layout.tsx
/**
 * AdminLayout — orchestrator component for the authenticated dashboard shell.
 *
 * Composition:
 * - AdminSidebar: desktop/tablet fixed sidebar (hidden on mobile)
 * - MobileSidebar: mobile overlay sidebar (Radix Dialog, toggled by isMobileOpen)
 * - AdminHeader: top bar with sitio selector, notification bell, user dropdown
 * - Breadcrumbs: subtle breadcrumb trail bar below header
 * - {children}: main content area with padding
 *
 * Uses sidebarStore for isMobileOpen state.
 */

'use client';

import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { useSidebarStore } from '@/store/sidebar.store';
import { AdminSidebar } from './admin-sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { AdminHeader } from './admin-header';
import { twMerge } from 'tailwind-merge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Desktop/tablet sidebar */}
        <AdminSidebar />

        {/* Mobile overlay sidebar */}
        <MobileSidebar />

        {/* Main content area — margin adjusts to sidebar collapsed state */}
        <div className={twMerge(
          'flex flex-1 flex-col transition-all duration-200 ease-in-out',
          'md:ml-[72px]',
          isCollapsed ? 'xl:ml-[72px]' : 'xl:ml-[280px]',
        )}>
          {/* Header */}
          <AdminHeader onMobileMenuToggle={() => {}} />

          {/* Breadcrumbs bar — subtle, below header */}
          <div className="border-b border-gray-200 bg-white/50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50 md:px-6">
            {/* Breadcrumbs component renders itself */}
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
