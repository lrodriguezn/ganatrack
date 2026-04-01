// apps/web/src/app/(dashboard)/page.tsx
/**
 * Dashboard home page — placeholder.
 *
 * This is the landing page after successful login.
 * It will eventually display:
 * - Overview statistics
 * - Recent activity
 * - Quick actions
 *
 * For auth-frontend phase: simple placeholder redirect or message.
 */

import { redirect } from 'next/navigation';

export default function DashboardPage(): JSX.Element {
  // Temporary: redirect to a simple placeholder
  // Future phases will add actual dashboard content
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Bienvenido al Dashboard
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        GanaTrack — Sistema de gestión ganadera
      </p>
    </div>
  );
}
