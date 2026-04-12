// apps/web/src/shared/components/feedback/page-skeleton.tsx
/**
 * PageSkeleton — Composite skeleton for page layout loading states.
 *
 * Composes the Skeleton atom to mimic a typical dashboard page:
 * - Title line
 * - Subtitle line (optional)
 * - Content lines (default 4)
 *
 * Used as React.lazy Suspense fallback for page-level code splitting.
 *
 * @example
 * <PageSkeleton />
 * <PageSkeleton titleLines={2} contentLines={6} animation="wave" />
 */

'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { twMerge } from 'tailwind-merge';

interface PageSkeletonProps {
  titleLines?: number;
  subtitleLines?: number;
  contentLines?: number;
  animation?: 'pulse' | 'wave';
  className?: string;
}

export function PageSkeleton({
  titleLines = 1,
  subtitleLines = 1,
  contentLines = 4,
  animation = 'pulse',
  className,
}: PageSkeletonProps): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Cargando página"
      aria-busy="true"
      className={twMerge('space-y-4 p-4', className)}
    >
      {/* Title skeletons */}
      {Array.from({ length: titleLines }).map((_, i) => (
        <Skeleton
          key={`title-${i}`}
          variant="text"
          animation={animation}
          className={i === 0 ? 'h-8 w-2/3' : 'h-6 w-1/2'}
        />
      ))}

      {/* Subtitle skeletons */}
      {Array.from({ length: subtitleLines }).map((_, i) => (
        <Skeleton
          key={`subtitle-${i}`}
          variant="text"
          animation={animation}
          className="h-4 w-1/3"
        />
      ))}

      {/* Content line skeletons */}
      {Array.from({ length: contentLines }).map((_, i) => (
        <Skeleton
          key={`content-${i}`}
          variant="text"
          animation={animation}
          className="h-4 w-full"
        />
      ))}
    </div>
  );
}
