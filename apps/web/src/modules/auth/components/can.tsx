// apps/web/src/modules/auth/components/can.tsx
/**
 * Can — RBAC conditional render component.
 *
 * Conditionally renders children based on the user's permission.
 * Uses usePermission internally to check access.
 *
 * Usage:
 *   <Can permission="animales:write">
 *     <button>Crear animal</button>
 *   </Can>
 *
 *   <Can permission="usuarios:delete" fallback={<p>No access</p>}>
 *     <button>Eliminar</button>
 *   </Can>
 */

import type { ReactNode } from 'react';
import { usePermission } from '../hooks/use-permission';

interface CanProps {
  /**
   * Permission string in "module:action" format to check.
   */
  permission: string;

  /**
   * Children to render when user has the permission.
   */
  children: ReactNode;

  /**
   * Fallback to render when user lacks the permission.
   * Defaults to null (renders nothing).
   */
  fallback?: ReactNode;
}

/**
 * Conditional render component based on permission check.
 * Uses admin wildcard from usePermission — if user has "*" or "*:*",
 * they can access any permission.
 */
export function Can({ permission, children, fallback = null }: CanProps): JSX.Element {
  const hasPermission = usePermission(permission);

  return <>{hasPermission ? children : fallback}</>;
}
