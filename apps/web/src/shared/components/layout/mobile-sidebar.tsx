// apps/web/src/shared/components/layout/mobile-sidebar.tsx
/**
 * MobileSidebar — mobile overlay sidebar using Radix Dialog.
 *
 * Features:
 * - Radix Dialog for accessible overlay
 * - Backdrop closes on click
 * - ESC key closes
 * - Body scroll locked when open
 * - Full sidebar content inside Dialog.Content
 *
 * Triggered by hamburger button in header.
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

import { useSidebarStore } from '@/store/sidebar.store';
import { SidebarNav } from './sidebar-nav';

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

export function MobileSidebar(): JSX.Element {
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <DialogPrimitive.Root open={isMobileOpen} onOpenChange={setMobileOpen}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className={twMerge(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />

        {/* Content */}
        <DialogPrimitive.Content
          className={twMerge(
            'fixed inset-y-0 left-0 z-50 w-[280px] max-w-full',
            'bg-white dark:bg-gray-900',
            'shadow-xl',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          )}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between px-2">
            <Logo />
            <DialogPrimitive.Close
              type="button"
              className={twMerge(
                'flex items-center justify-center rounded-lg p-2',
                'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
              )}
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <SidebarNav isCollapsed={false} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
