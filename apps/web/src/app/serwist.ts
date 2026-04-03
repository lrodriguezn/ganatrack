// apps/web/src/app/serwist.ts
/**
 * SerwistProvider — client component for service worker registration.
 *
 * Re-exports SerwistProvider from @serwist/turbopack/react.
 * Must be a separate client component because layout.tsx is a server component.
 */

"use client";
export { SerwistProvider } from "@serwist/turbopack/react";
