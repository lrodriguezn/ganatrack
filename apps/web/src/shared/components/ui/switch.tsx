// apps/web/src/shared/components/ui/switch.tsx
/**
 * Switch — Radix UI Switch wrapper with label slot, size variants,
 * and error styling.
 *
 * Sizes: sm | md
 *
 * RHF integration:
 *   <FormField name="isEnabled" control={control}
 *     render={({ field }) => (
 *       <Switch checked={field.value} onCheckedChange={field.onChange} />
 *     )}
 *   />
 */

'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type SwitchSize = 'sm' | 'md';

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: React.ReactNode;
  size?: SwitchSize;
  error?: boolean;
}

const trackClasses: Record<SwitchSize, string> = {
  sm: 'h-4 w-8',
  md: 'h-5 w-9',
};

const thumbClasses: Record<SwitchSize, string> = {
  sm: 'h-3 w-3 data-[state=checked]:translate-x-4',
  md: 'h-4 w-4 data-[state=checked]:translate-x-4',
};

/**
 * Switch component with optional label, size variants, and error styling.
 *
 * @example
 * <Switch label="Enable notifications" checked={enabled} onCheckedChange={setEnabled} />
 */
export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  (
    {
      className,
      label,
      size = 'md',
      error = false,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const switchId = id || props.name || `switch-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          disabled={disabled}
          className={twMerge(
            // Base
            'inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
            // Track colors
            'bg-gray-300 dark:bg-gray-600',
            'data-[state=checked]:bg-brand-500',
            // Focus ring
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            // Disabled
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Error variant
            error && 'ring-1 ring-red-500 dark:ring-red-400',
            trackClasses[size],
            className,
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={twMerge(
              // Base
              'pointer-events-none block rounded-full bg-white shadow-lg',
              'transition-transform',
              // Unchecked position
              'translate-x-0',
              thumbClasses[size],
            )}
          />
        </SwitchPrimitive.Root>
        {label && (
          <label
            htmlFor={switchId}
            className={twMerge(
              'text-sm text-gray-700 dark:text-gray-200',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Switch.displayName = SwitchPrimitive.Root.displayName;
