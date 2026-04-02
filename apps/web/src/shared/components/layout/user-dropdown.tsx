// apps/web/src/shared/components/layout/user-dropdown.tsx
/**
 * UserDropdown — header dropdown with user info and logout.
 *
 * Features:
 * - Reads user.nombre and user.email from authStore
 * - Shows user avatar circle (first letter of nombre)
 * - Radix DropdownMenu with user info + logout button
 * - Logout calls useLogout().logout()
 * - Returns null if user is not authenticated
 */

'use client';

import { ChevronDownIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/modules/auth/hooks/use-logout';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

export function UserDropdown(): JSX.Element | null {
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();

  // Not authenticated — don't render
  if (!user) {
    return null;
  }

  // Get first letter of nombre for avatar
  const initial = user.nombre?.charAt(0).toUpperCase() ?? '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
        {/* Avatar circle */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
          {initial}
        </div>
        {/* Name and chevron */}
        <div className="hidden items-center gap-1 md:flex">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {user.nombre}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        {/* User info */}
        <div className="px-2 py-1.5">
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.nombre}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
