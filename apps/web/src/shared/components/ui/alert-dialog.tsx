// apps/web/src/shared/components/ui/alert-dialog.tsx
/**
 * AlertDialog — Radix UI AlertDialog wrapper for destructive confirmations.
 *
 * Use this (NOT Modal) when the user must confirm an irreversible action
 * like deleting an animal, removing a predio, or deactivating a user.
 *
 * Key differences from Modal:
 * - Focus auto-traps to Cancel (safe default)
 * - Does NOT close on backdrop click (prevents accidental dismiss)
 * - Confirm button has built-in danger styling
 *
 * @example
 * <AlertDialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Eliminar animal"
 *   description="Esta acción no se puede deshacer. El animal será eliminado permanentemente."
 *   confirmLabel="Eliminar"
 * />
 */

'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Types
// ============================================================================

interface AlertDialogProps {
  /** Controls visibility */
  open: boolean;
  /** Called when dialog should close (cancel, Escape key) */
  onClose: () => void;
  /** Called when user confirms the destructive action */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Descriptive text explaining the consequence */
  description?: string;
  /** Confirm button text. Default: "Confirmar" */
  confirmLabel?: string;
  /** Cancel button text. Default: "Cancelar" */
  cancelLabel?: string;
  /** Loading state for the confirm button */
  isLoading?: boolean;
  /** Visual severity of the confirm button */
  severity?: 'danger' | 'warning';
  /** Custom trigger element (optional — omit when controlling via open prop) */
  children?: React.ReactNode;
}

// ============================================================================
// Styles
// ============================================================================

const overlayClasses =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

const contentClasses =
  'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]';

const severityClasses = {
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  warning:
    'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500',
};

// ============================================================================
// Sub-components (re-exported for advanced usage)
// ============================================================================

const AlertDialogRoot = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

// ============================================================================
// Main Component
// ============================================================================

/**
 * AlertDialog for destructive or irreversible actions.
 * Focus defaults to Cancel button for safety.
 */
export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  severity = 'danger',
  children,
}: AlertDialogProps): JSX.Element {
  return (
    <AlertDialogRoot
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      {/* Optional trigger */}
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}

      <AlertDialogPortal>
        <AlertDialogPrimitive.Overlay className={overlayClasses} />
        <AlertDialogPrimitive.Content className={contentClasses}>
          {/* Header */}
          <AlertDialogPrimitive.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </AlertDialogPrimitive.Title>

          {description && (
            <AlertDialogPrimitive.Description className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </AlertDialogPrimitive.Description>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogPrimitive.Cancel
              className={twMerge(
                'inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors',
                'dark:border-gray-600 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-white/5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
              disabled={isLoading}
            >
              {cancelLabel}
            </AlertDialogPrimitive.Cancel>

            <AlertDialogAction
              onClick={onConfirm}
              isLoading={isLoading}
              severity={severity}
            >
              {confirmLabel}
            </AlertDialogAction>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialogRoot>
  );
}

// ============================================================================
// Internal: Confirm action button
// ============================================================================

interface AlertDialogActionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  isLoading?: boolean;
  severity?: 'danger' | 'warning';
}

const AlertDialogAction = forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  AlertDialogActionProps
>(({ className, isLoading, severity = 'danger', children, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={twMerge(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      severityClasses[severity],
      className,
    )}
    disabled={isLoading}
    {...props}
  >
    {isLoading && (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    )}
    {children}
  </AlertDialogPrimitive.Action>
));
AlertDialogAction.displayName = 'AlertDialogAction';

// ============================================================================
// Exports
// ============================================================================

export {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogCancel,
};
