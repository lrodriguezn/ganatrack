// apps/web/src/shared/components/layout/admin-sidebar.tsx
/**
 * AdminSidebar — desktop and tablet sidebar component.
 *
 * Responsive behavior:
 * - Desktop (≥1280px): 280px width, full labels, collapsible toggle button
 * - Tablet (768-1279px): 72px width, icons only + tooltips, no toggle button
 *
 * Uses sidebarStore for isCollapsed state.
 */

'use client';

import { useSidebarStore } from '@/store/sidebar.store';
import { SidebarNav } from './sidebar-nav';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Bars3Icon as Bars3IconSolid } from '@heroicons/react/24/solid';
import { twMerge } from 'tailwind-merge';

function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      {/* GanaTrack logo placeholder */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
        <span className="text-sm font-bold text-white">GT</span>
      </div>
      <span className="text-lg font-semibold text-gray-900 dark:text-white">
        GanaTrack
      </span>
    </div>
  );
}

export function AdminSidebar(): JSX.Element {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <>
      {/* Desktop sidebar (≥1280px) */}
      <aside
        className={twMerge(
          'hidden xl:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-gray-900',
          'border-r border-gray-200 dark:border-gray-800',
          'transition-all duration-200 ease-in-out z-40',
          isCollapsed ? 'w-[72px]' : 'w-[280px]',
        )}
      >
        {/* Logo */}
        <Logo />

        {/* Collapse toggle — desktop only */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={twMerge(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg',
              'text-sm font-medium text-gray-700 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-white/5',
              'transition-colors',
              isCollapsed && 'justify-center',
            )}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <Bars3IconSolid className="h-5 w-5" />
            ) : (
              <>
                <Bars3Icon className="h-5 w-5" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* Tablet sidebar (768px - 1279px) — always collapsed icons-only */}
      <aside
        className={twMerge(
          'hidden md:flex xl:hidden flex-col fixed left-0 top-0 h-screen w-[72px',
          'bg-white dark:bg-gray-900',
          'border-r border-gray-200 dark:border-gray-800',
          'z-40',
        )}
      >
        {/* Logo */}
        <div className="px-2 py-5 justify-center flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">GT</span>
          </div>
        </div>

        {/* Navigation — collapsed with tooltips */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav isCollapsed={true} />
        </div>
      </aside>
    </>
  );
}
