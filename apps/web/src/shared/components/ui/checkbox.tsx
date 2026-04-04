// apps/web/src/shared/components/ui/checkbox.tsx
/**
 * Checkbox — Radix UI Checkbox wrapper with label slot, indeterminate state,
 * size variants, and error styling.
 *
 * Variants:
 * - default: Standard checkbox with brand-500 fill
 * - error: Red border ring when error=true
 *
 * Sizes: sm | md
 *
 * RHF integration:
 *   <FormField name="agree" control={control}
 *     render={({ field }) => (
 *       <Checkbox checked={field.value} onCheckedChange={field.onChange} />
 *     )}
 *   />
 */

'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type CheckboxSize = 'sm' | 'md';

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
  indeterminate?: boolean;
  size?: CheckboxSize;
  error?: boolean;
}

const sizeClasses: Record<CheckboxSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

/**
 * Check icon SVG for the checked state.
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Dash icon SVG for the indeterminate state.
 */
function DashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Checkbox component with optional label, indeterminate state, and error variant.
 *
 * @example
 * <Checkbox label="Accept terms" checked={accepted} onCheckedChange={setAccepted} />
 * <Checkbox indeterminate={someSelected} />
 */
export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      label,
      indeterminate = false,
      size = 'md',
      error = false,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const checkboxId = id || props.name || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          disabled={disabled}
          className={twMerge(
            // Base
            'inline-flex shrink-0 items-center justify-center rounded border border-gray-300 bg-white',
            'dark:border-gray-600 dark:bg-gray-900',
            // Focus ring
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            // Disabled
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Checked state
            'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500',
            'data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:bg-brand-500',
            // Error variant
            error && 'border-red-500 focus-visible:ring-red-500 dark:border-red-400',
            sizeClasses[size],
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={twMerge(
              'flex items-center justify-center text-white',
              'data-[state=unchecked]:hidden',
            )}
          >
            {indeterminate ? (
              <DashIcon className={sizeClasses[size]} />
            ) : (
              <CheckIcon className={sizeClasses[size]} />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label
            htmlFor={checkboxId}
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

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
