// apps/web/src/shared/components/layout/notification-bell.tsx
/**
 * NotificationBell — header bell icon with unread count badge.
 *
 * Features:
 * - Bell icon from @heroicons/react/24/outline
 * - Badge showing unread count (absolute positioned top-right)
 * - Badge hidden when count === 0
 * - Badge shows "99+" when count > 99
 * - Click handler placeholder for future notification dropdown
 */

'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/shared/components/ui/badge';
import { useState } from 'react';

export function NotificationBell(): JSX.Element {
  // Placeholder: hardcoded unread count for now
  // Future: replace with useNotifications() hook with polling
  const [unreadCount] = useState(3);

  return (
    <button
      type="button"
      className="relative flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      aria-label="Notificaciones"
      onClick={() => {
        // Future: open notifications dropdown
      }}
    >
      <BellIcon className="h-5 w-5" />
      <Badge count={unreadCount} max={99} />
    </button>
  );
}
