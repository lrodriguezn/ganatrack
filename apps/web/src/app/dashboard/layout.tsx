// apps/web/src/app/(dashboard)/layout.tsx
/**
 * Dashboard layout — authenticated shell.
 *
 * Uses AdminLayout to compose:
 * - Sidebar navigation (desktop/tablet + mobile overlay)
 * - Header with sitio selector, notifications, user dropdown
 * - Breadcrumbs bar
 * - Main content area
 *
 * Feedback components:
 * - ErrorBoundary: catches render errors in dashboard pages
 * - OfflineBanner: shows connectivity warning (fixed position)
 */

import { AdminLayout } from '@/shared/components/layout/admin-layout';
import { ErrorBoundary, OfflineBanner } from '@/shared/components/feedback';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): JSX.Element {
  return (
    <>
      <OfflineBanner />
      <AdminLayout>
        <ErrorBoundary>
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
        </ErrorBoundary>
      </AdminLayout>
    </>
  );
}
