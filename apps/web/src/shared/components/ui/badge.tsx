// apps/web/src/shared/components/ui/badge.tsx
/**
 * Badge — notification count badge atom.
 *
 * Props:
 * - count: number to display
 * - max: cap number (default 99), shows "${max}+" when count > max
 * - className: optional Tailwind overrides
 *
 * Returns null when count === 0 (hidden).
 */

import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  count: number;
  max?: number;
  className?: string;
}

const DEFAULT_MAX = 99;

/**
 * Red circular badge showing notification count.
 * Hidden when count === 0.
 */
export function Badge({ count, max = DEFAULT_MAX, className }: BadgeProps): JSX.Element | null {
  if (count === 0) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={twMerge(
        'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full',
        'bg-red-500 text-white text-[10px] font-bold',
        'pointer-events-none',
        className,
      )}
      aria-label={`${count} notificaciones`}
    >
      {displayCount}
    </span>
  );
}
