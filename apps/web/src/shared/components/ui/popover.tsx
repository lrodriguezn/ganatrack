// apps/web/src/shared/components/ui/popover.tsx
/**
 * Popover — Radix UI Popover wrapper for rich floating content.
 *
 * Use this (NOT DropdownMenu) when you need rich content in a floating panel:
 * - Animal preview on table hover
 * - Advanced filter panels
 * - Inline editing forms
 *
 * DropdownMenu is for action lists. Popover is for arbitrary content.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="ghost">Ver detalles</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <AnimalPreview animal={animal} />
 *   </PopoverContent>
 * </Popover>
 */

'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Sub-components
// ============================================================================

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverPortal = PopoverPrimitive.Portal;
const PopoverAnchor = PopoverPrimitive.Anchor;

// ============================================================================
// PopoverContent
// ============================================================================

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  /** Show a small arrow pointing to the trigger */
  showArrow?: boolean;
}

const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = 'center', sideOffset = 4, showArrow = false, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={twMerge(
        'z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-md outline-none',
        'dark:border-gray-700 dark:bg-gray-800',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <PopoverPrimitive.Arrow className="fill-white dark:fill-gray-800" />
      )}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// ============================================================================
// PopoverClose (convenience close button)
// ============================================================================

const PopoverClose = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <PopoverPrimitive.Close
    ref={ref}
    className={twMerge(
      'absolute right-2 top-2 rounded-md p-1 text-gray-500 transition-colors',
      'hover:bg-gray-100 dark:hover:bg-gray-700',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      className,
    )}
    aria-label="Cerrar"
    {...props}
  >
    {children ?? (
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    )}
  </PopoverPrimitive.Close>
));
PopoverClose.displayName = 'PopoverClose';

// ============================================================================
// Exports
// ============================================================================

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverPortal,
  PopoverAnchor,
};
