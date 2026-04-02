// apps/web/src/shared/components/layout/breadcrumbs/breadcrumbs.tsx
/**
 * Breadcrumbs — breadcrumb trail navigation component.
 *
 * Features:
 * - Renders breadcrumb trail from useBreadcrumbs() hook
 * - All segments except LAST are clickable <Link> elements
 * - LAST segment is a plain <span> (current page, not clickable)
 * - ChevronRightIcon separates segments
 * - Home icon for first segment when available
 */

'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useBreadcrumbs } from './use-breadcrumbs';

export function Breadcrumbs(): JSX.Element {
  const segments = useBreadcrumbs();

  // Empty breadcrumbs — don't render
  if (segments.length === 0) {
    return <nav aria-label="Breadcrumb" />;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-1">
        {segments.map((segment, index) => {
          // First segment: show Home icon for "Inicio"
          if (index === 0 && segment.label === 'Inicio') {
            return (
              <li key={segment.href} className="flex items-center gap-1">
                <Link
                  href={segment.href}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span className="sr-only">Inicio</span>
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </li>
            );
          }

          // Last segment: plain text (current page)
          if (segment.isLast) {
            return (
              <li key={segment.href}>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {segment.label}
                </span>
              </li>
            );
          }

          // Non-last segments: clickable link
          return (
            <li key={segment.href} className="flex items-center gap-1">
              <Link
                href={segment.href}
                className="text-gray-500 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-300"
              >
                {segment.label}
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
