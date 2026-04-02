// apps/web/src/shared/components/ui/separator.tsx
/**
 * Separator — Radix UI Separator wrapper.
 *
 * Exports:
 * - Separator
 *
 * Props:
 * - orientation: 'horizontal' | 'vertical' (default: 'horizontal')
 * - decorative: boolean (default: true)
 * - className: optional
 */

'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Separator = forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={twMerge(
      'shrink-0 bg-gray-200 dark:bg-gray-700',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className,
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
