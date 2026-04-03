/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/**
 * GanaTrack Service Worker — Serwist-based.
 *
 * Caching strategies:
 * 1. Static assets (/_next/static/*) — StaleWhileRevalidate
 * 2. Images (/icons/*, /images/*) — CacheFirst, 30 days, 100 entries
 * 3. Auth (/api/v1/auth/*) — NetworkOnly (NEVER cached)
 * 4. API images (/api/v1/imagenes/*) — CacheFirst, 7 days, 200 entries
 * 5. Catalogs (/api/v1/configuracion/*, /maestros/*) — StaleWhileRevalidate
 * 6. Dynamic API (/api/v1/* GET) — NetworkFirst, 3s timeout, 1 hour, 50 entries
 * 7. Mutations (POST/PUT /api/v1/*) — NetworkOnly + BackgroundSync, 24h retention
 * 8. Google Fonts — CacheFirst, 1 year
 *
 * Push notification + notificationclick event handlers.
 */

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "serwist";
import { BackgroundSyncPlugin, ExpirationPlugin } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Static assets — StaleWhileRevalidate
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
      }),
    },

    // 2. Images (icons, uploaded images) — CacheFirst
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/"),
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 86400 }),
        ],
      }),
    },

    // 3. Auth — NEVER cache (NetworkOnly)
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/auth/"),
      handler: new NetworkOnly(),
    },

    // 4. API images (animal photos, hierros) — CacheFirst
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/imagenes/"),
      handler: new CacheFirst({
        cacheName: "api-images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 86400 }),
        ],
      }),
    },

    // 5. Catalogs — StaleWhileRevalidate (rarely change)
    {
      urlPattern: ({ url }) =>
        /\/api\/v1\/(configuracion|maestros)\//.test(url.pathname),
      handler: new StaleWhileRevalidate({ cacheName: "api-catalogs" }),
      method: "GET",
    },

    // 6. Dynamic API — NetworkFirst with 3s timeout
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/"),
      handler: new NetworkFirst({
        cacheName: "api-dynamic",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 3600 }),
        ],
      }),
      method: "GET",
    },

    // 7. Mutations POST — NetworkOnly + BackgroundSync (exclude auth)
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith("/api/v1/") &&
        !url.pathname.startsWith("/api/v1/auth/"),
      handler: new NetworkOnly({
        plugins: [
          new BackgroundSyncPlugin("mutation-queue-post", {
            maxRetentionTime: 24 * 60,
          }),
        ],
      }),
      method: "POST",
    },

    // 7b. Mutations PUT — NetworkOnly + BackgroundSync (exclude auth)
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith("/api/v1/") &&
        !url.pathname.startsWith("/api/v1/auth/"),
      handler: new NetworkOnly({
        plugins: [
          new BackgroundSyncPlugin("mutation-queue-put", {
            maxRetentionTime: 24 * 60,
          }),
        ],
      }),
      method: "PUT",
    },

    // 7c. Mutations DELETE — NetworkOnly + BackgroundSync (exclude auth)
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith("/api/v1/") &&
        !url.pathname.startsWith("/api/v1/auth/"),
      handler: new NetworkOnly({
        plugins: [
          new BackgroundSyncPlugin("mutation-queue-delete", {
            maxRetentionTime: 24 * 60,
          }),
        ],
      }),
      method: "DELETE",
    },

    // 8. Google Fonts — CacheFirst, 1 year
    {
      urlPattern: ({ url }) =>
        /^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(url.href),
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 365 * 86400 }),
        ],
      }),
    },
  ],
});

// ============================================================================
// Push Notification Event Handlers
// ============================================================================

self.addEventListener("push", (event) => {
  let data: any = null;
  try {
    data = event.data?.json();
  } catch {
    // Fallback for non-JSON push payloads
    data = { title: "GanaTrack", body: event.data?.text() ?? "" };
  }
  if (!data) return;

  event.waitUntil(
    self.registration.showNotification(data.title ?? "GanaTrack", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      data: { url: data.actionUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data as { url?: string })?.url ?? "/notificaciones";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      return self.clients.openWindow(targetUrl);
    }),
  );
});

serwist.addEventListeners();
