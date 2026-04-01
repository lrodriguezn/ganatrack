// apps/web/src/app/(dashboard)/layout.tsx
/**
 * Dashboard layout — authenticated shell.
 *
 * This is the layout for all protected routes under /(dashboard)/.
 * It will eventually include:
 * - Sidebar navigation
 * - Header with user info and predio selector
 * - Main content area
 *
 * For auth-frontend phase: minimal placeholder structure.
 * The actual sidebar and header will be built in future UI modules.
 */

import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Future: <Sidebar /> */}
      <main className="flex-1 flex flex-col">
        {/* Future: <Header /> */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
