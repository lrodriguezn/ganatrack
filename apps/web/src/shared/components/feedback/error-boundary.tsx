// apps/web/src/shared/components/feedback/error-boundary.tsx
/**
 * ErrorBoundary — Catches render errors and shows a fallback UI.
 *
 * Props:
 * - fallback?: ReactNode — custom fallback instead of default
 * - onReset?: () => void — callback when user clicks retry
 *
 * Default fallback shows:
 * - Warning icon
 * - "Algo salió mal" heading
 * - Error message (dev: full error, prod: error ID only)
 * - "Reintentar" button
 *
 * @example
 * <ErrorBoundary>
 *   <AnimalTable />
 * </ErrorBoundary>
 */

'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  onReset?: () => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * Generate a short error ID for production logging.
 */
function generateErrorId(): string {
  return `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Default fallback UI shown when an error is caught.
 */
function DefaultFallback({
  error,
  errorId,
  onReset,
}: {
  error: Error | null;
  errorId: string;
  onReset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Algo salió mal
        </h3>

        <p className="mt-1 max-w-sm text-sm text-gray-600 dark:text-gray-400">
          {isDev
            ? error?.message ?? 'Error desconocido'
            : `Ha ocurrido un error inesperado. ID: ${errorId}`}
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
      >
        <RotateCcw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
}

/**
 * Error boundary class component — catches render errors in children.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorId: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    } else {
      // Production: log only error ID for correlation
      console.error(
        `[ErrorBoundary] ${this.state.errorId}`,
      );
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorId: '' });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
