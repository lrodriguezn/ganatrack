// apps/web/src/modules/auth/hooks/use-permission.ts
/**
 * usePermission — checks if current user has a specific permission.
 *
 * Reads permissions array from authStore.
 * Supports admin wildcard: "*" or "*:*" grants all permissions.
 * Returns false for empty permissions (unauthenticated state).
 */

import { useAuthStore } from '@/store/auth.store';

/**
 * Check if the current user has the given permission.
 *
 * @param permission - Permission string in "module:action" format
 * @returns true if user has the permission, false otherwise
 *
 * Rules:
 * - Empty permissions array → false (not authenticated)
 * - permissions includes "*" → true (admin wildcard)
 * - permissions includes "*:*" → true (admin wildcard alternative)
 * - permissions includes exact match → true
 * - Otherwise → false
 */
export function usePermission(permission: string): boolean {
  const permissions = useAuthStore((s) => s.permissions);

  // Empty permissions = not authenticated
  if (!permissions || permissions.length === 0) {
    return false;
  }

  // Admin wildcard grants all permissions
  if (permissions.includes('*') || permissions.includes('*:*')) {
    return true;
  }

  return permissions.includes(permission);
}
