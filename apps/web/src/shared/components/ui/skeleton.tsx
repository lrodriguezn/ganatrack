// apps/web/src/shared/components/ui/skeleton.tsx
/**
 * Skeleton — UI atom for loading placeholder animations.
 *
 * Variants:
 * - rectangular: standard rectangle (default)
 * - circular: circle shape for avatar placeholders
 * - text: single line text placeholder
 *
 * Animations:
 * - pulse: opacity animation (default)
 * - wave: shimmer effect via gradient animation
 *
 * @example
 * <Skeleton className="h-4 w-full" /> // rectangular pulse
 * <Skeleton variant="circular" width="40px" height="40px" /> // avatar placeholder
 */

'use client';

import { twMerge } from 'tailwind-merge';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';
type SkeletonAnimation = 'pulse' | 'wave';

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  className?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  rectangular: 'rounded-md',
  circular: 'rounded-full',
  text: 'rounded h-4 w-full',
};

const animationClasses: Record<SkeletonAnimation, string> = {
  pulse: 'animate-pulse bg-gray-200 dark:bg-gray-700',
  wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
};

function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  className,
}: SkeletonProps): JSX.Element {
  return (
    <div
      className={twMerge(
        'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1rem' : undefined),
      }}
      aria-hidden="true"
    />
  );
}

export { Skeleton };
