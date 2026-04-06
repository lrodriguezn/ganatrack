// apps/web/src/shared/components/ui/label.tsx
/**
 * Label — Radix UI Label wrapper for accessible form field labels.
 *
 * Automatically associates with the nearest form control via htmlFor/id.
 * Improves A11y by ensuring screen readers correctly link labels to inputs.
 *
 * Replaces raw `<label>` elements in form-field.tsx, select.tsx, etc.
 *
 * @example
 * <Label htmlFor="codigo">Código del animal</Label>
 * <Input id="codigo" />
 *
 * @example with required indicator
 * <Label htmlFor="raza" required>Raza</Label>
 */

'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Types
// ============================================================================

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Shows a red asterisk after the label text */
  required?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

// ============================================================================
// Component
// ============================================================================

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
};

/**
 * Accessible label for form controls.
 * Uses Radix Label for automatic htmlFor association.
 */
export const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, size = 'md', children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={twMerge(
      'font-medium text-gray-700 dark:text-gray-200',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      sizeClasses[size],
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-red-500 dark:text-red-400" aria-hidden="true">
        *
      </span>
    )}
  </LabelPrimitive.Root>
));

Label.displayName = LabelPrimitive.Root.displayName;
