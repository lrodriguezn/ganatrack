// apps/web/src/shared/components/ui/radio-group.tsx
/**
 * RadioGroup — Radix UI RadioGroup wrapper with option descriptions,
 * 2 orientations, and error display.
 *
 * Orientations: horizontal | vertical
 *
 * RHF integration:
 *   <FormField name="plan" control={control}
 *     render={({ field }) => (
 *       <RadioGroup value={field.value} onValueChange={field.onChange} options={plans} />
 *     )}
 *   />
 */

'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Types
// ============================================================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[];
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * RadioGroup component with option descriptions, orientations, and error display.
 *
 * @example
 * <RadioGroup options={[{ value: 'a', label: 'Option A' }]} value={selected} onValueChange={setSelected} />
 * <RadioGroup options={plans} orientation="horizontal" />
 */
export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(
  (
    {
      className,
      options = [],
      label,
      orientation = 'vertical',
      error,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const groupId = id || `radiogroup-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            id={`${groupId}-label`}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <RadioGroupPrimitive.Root
          ref={ref}
          id={groupId}
          disabled={disabled}
          orientation={orientation}
          aria-labelledby={label ? `${groupId}-label` : undefined}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? `${groupId}-error` : undefined}
          className={twMerge(
            'flex gap-4',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={twMerge(
                'flex items-start gap-3',
                option.disabled && 'opacity-50',
              )}
            >
              <RadioGroupPrimitive.Item
                value={option.value}
                disabled={option.disabled}
                className={twMerge(
                  // Base
                  'mt-0.5 aspect-square h-4 w-4 shrink-0 rounded-full border-2 border-gray-300 bg-white',
                  'dark:border-gray-600 dark:bg-gray-900',
                  // Checked
                  'data-[state=checked]:border-brand-500',
                  // Focus ring
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                  // Disabled
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <RadioGroupPrimitive.Indicator
                  className="relative flex h-full w-full items-center justify-center after:block after:h-2 after:w-2 after:rounded-full after:bg-brand-500 after:content-['']"
                />
              </RadioGroupPrimitive.Item>
              <div className="flex flex-col">
                <label
                  htmlFor={option.value}
                  className={twMerge(
                    'text-sm text-gray-700 dark:text-gray-200',
                    option.disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </RadioGroupPrimitive.Root>
        {hasError && (
          <span
            id={`${groupId}-error`}
            className="text-sm text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
