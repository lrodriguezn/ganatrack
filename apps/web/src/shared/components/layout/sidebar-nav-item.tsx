// apps/web/src/shared/components/layout/sidebar-nav-item.tsx
/**
 * SidebarNavItem — single navigation item with accordion support.
 *
 * Props:
 * - item: NavItem from navigation.config.ts
 * - isCollapsed: boolean — collapsed mode (icon only + tooltip)
 * - depth: number — nesting depth (0 for root items)
 *
 * Features:
 * - Active state highlighting (exact + prefix match via usePathname)
 * - Accordion for items with children
 * - RBAC filtering via <Can> wrapper
 * - Collapsed mode shows icon only with Tooltip
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon as ChevronRightIconSolid } from '@heroicons/react/24/solid';
import { twMerge } from 'tailwind-merge';

import type { NavItem } from '@/shared/lib/navigation.config';
import { Can } from '@/modules/auth/components/can';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/shared/components/ui/tooltip';

/**
 * Check if a nav item href matches the current pathname.
 * - Exact match for /dashboard
 * - Prefix match for other routes (pathname.startsWith(href + '/'))
 */
function isActiveRoute(itemHref: string | undefined, pathname: string): boolean {
  if (!itemHref) return false;

  // Root dashboard exact match
  if (itemHref === '/dashboard') {
    return pathname === '/dashboard';
  }

  // Prefix match for nested routes
  return pathname === itemHref || pathname.startsWith(itemHref + '/');
}

/**
 * Check if any child of a nav item is active (for accordion auto-expand).
 */
function isChildActive(item: NavItem, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => isActiveRoute(child.href, pathname) || isChildActive(child, pathname),
  );
}

interface SidebarNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  depth?: number;
}

function SidebarNavItemInner({ item, isCollapsed, depth = 0 }: SidebarNavItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const childIsActive = hasChildren ? isChildActive(item, pathname) : false;
  const itemIsActive = isActiveRoute(item.href, pathname);

  const [isExpanded, setIsExpanded] = useState(childIsActive);

  // Auto-expand if a child becomes active
  useEffect(() => {
    if (childIsActive) {
      setIsExpanded(true);
    }
  }, [childIsActive]);

  const Icon = itemIsActive && item.iconActive ? item.iconActive : item.icon;
  const ChevronIcon = isExpanded ? ChevronRightIconSolid : ChevronRightIcon;

  // Item classes for menu-item
  const itemClasses = twMerge(
    'group relative flex items-center w-full gap-3 px-3 py-2 rounded-lg font-medium text-sm',
    'transition-colors cursor-pointer',
    itemIsActive
      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5',
  );

  // Icon classes
  const iconClasses = twMerge(
    'h-5 w-5 flex-shrink-0',
    itemIsActive
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300',
  );

  // Collapsed mode: show only icon with tooltip
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {item.href && !hasChildren ? (
              <Link href={item.href} className={itemClasses}>
                <Icon className={iconClasses} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                className={itemClasses}
              >
                <Icon className={iconClasses} />
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Normal mode: icon + label + optional chevron
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        {item.href && !hasChildren ? (
          <Link href={item.href} className={itemClasses}>
            <Icon className={iconClasses} />
            <span className="flex-1 truncate">{item.label}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            className={itemClasses}
          >
            <Icon className={iconClasses} />
            <span className="flex-1 truncate text-left">{item.label}</span>
            {hasChildren && (
              <ChevronIcon
                className={twMerge(
                  'h-4 w-4 text-gray-500 transition-transform duration-200',
                  isExpanded && 'rotate-90',
                )}
              />
            )}
          </button>
        )}
      </div>

      {/* Children accordion - hidden when collapsed */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div
          className="ml-4 space-y-1 border-l border-gray-200 pl-4 dark:border-gray-700"
        >
          {item.children!.map((child) => (
            <SidebarNavItemInner
              key={child.label}
              item={child}
              isCollapsed={isCollapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SidebarNavItem — wrapped with RBAC check.
 */
export function SidebarNavItem({ item, isCollapsed, depth }: SidebarNavItemProps) {
  if (item.permission) {
    return (
      <Can permission={item.permission}>
        <SidebarNavItemInner item={item} isCollapsed={isCollapsed} depth={depth} />
      </Can>
    );
  }

  return <SidebarNavItemInner item={item} isCollapsed={isCollapsed} depth={depth} />;
}
