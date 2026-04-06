// apps/web/src/shared/components/feedback/loading-spinner.tsx
/**
 * LoadingSpinner — Animated spinner for async operations.
 *
 * Variants:
 * - default: centered spinner with optional label
 * - inline: small spinner for buttons/inline use
 * - fullscreen: full-screen overlay with spinner
 *
 * Sizes: sm (16px), md (24px), lg (40px), xl (56px)
 *
 * @example
 * <LoadingSpinner />                          // default centered
 * <LoadingSpinner size="lg" label="Cargando…" />
 * <LoadingSpinner variant="fullscreen" />
 * <LoadingSpinner variant="inline" size="sm" />
 */

'use client';

import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'inline' | 'fullscreen';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  label,
  className,
}: LoadingSpinnerProps): JSX.Element {
  const spinner = (
    <Loader2
      className={twMerge(
        'animate-spin text-gray-400 dark:text-gray-500',
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    />
  );

  if (variant === 'inline') {
    return spinner;
  }

  if (variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-label={label ?? 'Cargando'}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"
      >
        <Loader2
          className={twMerge('animate-spin text-blue-600 dark:text-blue-400', sizeClasses[size])}
          aria-hidden="true"
        />
        {label && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </span>
        )}
      </div>
    );
  }

  // default: centered
  return (
    <div
      role="status"
      aria-label={label ?? 'Cargando'}
      className="flex flex-col items-center justify-center gap-2 py-8"
    >
      {spinner}
      {label && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}
