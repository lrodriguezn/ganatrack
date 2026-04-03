// apps/web/src/app/(dashboard)/layout.tsx
/**
 * Dashboard layout — authenticated shell.
 *
 * Uses AdminLayout to compose:
 * - Sidebar navigation (desktop/tablet + mobile overlay)
 * - Header with sitio selector, notifications, user dropdown
 * - Breadcrumbs bar
 * - Main content area
 */

import { AdminLayout } from '@/shared/components/layout/admin-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): JSX.Element {
  return (
    <AdminLayout>
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
    </AdminLayout>
  );
}
