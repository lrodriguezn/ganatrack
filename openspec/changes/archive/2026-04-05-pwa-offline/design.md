# Diseño Técnico: PWA Offline — GanaTrack

## Contexto

El frontend de GanaTrack ya tiene una base PWA implementada con Serwist:
- `sw.ts` con 8 estrategias de caching (static, images, auth, catalogs, dynamic API, mutations, fonts)
- BackgroundSync plugins para POST/PUT/DELETE con retención de 24h
- Push notification handlers
- `manifest.json` con icons
- `useOnlineStatus` hook + `OfflineBanner` component
- `useFailedSync` hook para leer colas de IndexedDB

**Lo que FALTA** (este change):

## 1. Query Persistence — TanStack Query → IndexedDB

### Problema
Cuando el usuario recarga la página offline o la cierra y la reabre, todo el cache de TanStack Query se pierde. Sin persistence, la app offline muestra pantallas vacías.

### Solución
`@tanstack/react-query-persist-client` + `idb-keyval` como backend de storage.

### Archivos a crear/modificar

**`src/shared/lib/idb-persister.ts`** (NUEVO)
```typescript
import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

export function createIDBPersister(key = 'ganatrack-query-cache'): Persister {
  return {
    persistClient: async (client: PersistedClient) => { await set(key, client); },
    restoreClient: async () => { return await get<PersistedClient>(key); },
    removeClient: async () => { await del(key); },
  };
}
```

**`src/shared/providers/app-providers.tsx`** (MODIFICAR)
- Reemplazar `QueryClientProvider` con `PersistQueryClientProvider`
- Configurar persister con `createIDBPersister()`
- maxAge: 24h (mismo que BackgroundSync retention)
- buster: versión de app para invalidar cache en deploy

**`src/shared/lib/query-client.ts`** (MODIFICAR)
- Agregar `gcTime: 24 * 60 * 60 * 1000` (24h) para que el cache persista el mismo tiempo que BackgroundSync

### Dependencias nuevas
- `idb-keyval` (~600B)
- `@tanstack/react-query-persist-client`

## 2. Service Worker — Refresh-Before-Replay

### Problema
BackgroundSync encola mutations cuando la app está offline. El `accessToken` expira en 15 minutos. Si el usuario está offline > 15min, al reconectar las mutations fallan con 401.

### Solución
Custom replay handler en el SW que refresca el token ANTES de reenviar cada mutation encolada.

### Archivos a modificar

**`src/sw.ts`** — Agregar:
1. `replayWithTokenRefresh()` — Intenta `POST /auth/refresh` antes de cada replay
2. `moveToFailedSyncQueue()` — Mueve items fallidos a cola separada en IndexedDB
3. `handleReplayResponse()` — Maneja 404/409/400/5xx responses
4. `notifyClient()` — Envía notificaciones al cliente vía `postMessage`
5. `CLEAR_DYNAMIC_CACHE` message handler — Para cambio de predio
6. Offline fallback en `catch` handler del navigation preload

## 3. Conflict Resolution — Manejo de respuestas en replay

### Estrategia: Server Wins + Notificación

| HTTP Status | Tipo | Acción SW | Acción UI |
|---|---|---|---|
| 404 | Entidad eliminada | Descartar mutation, notificar | Toast: "El recurso fue eliminado" |
| 409 | Conflicto de versión | Mover a conflict queue | Modal lado-a-lado con diff |
| 400 | Validación fallida | Mover a failed-sync queue | Toast + página sincronización |
| 5xx | Error servidor | Reintentar 3x con backoff | Auto-retry silencioso |
| 401 (después de refresh fallido) | Token expirado irrecuperable | Mover a failed-sync queue | Banner: "Sesión expirada" |

## 4. Página de Sincronización — `/sincronizacion`

### Estructura
```
src/app/dashboard/sincronizacion/
├── page.tsx                    # Página principal
└── components/
    ├── sync-queue-list.tsx     # Lista de items pendientes
    ├── conflict-resolver.tsx   # Modal de resolución 409
    └── failed-item-card.tsx    # Card para item fallido
```

### Hook nuevo
**`src/shared/hooks/use-sync-actions.ts`** — Acciones para resolver conflictos:
- `discardItem(url)` — Elimina de la cola
- `retryItem(url)` — Re-intenta el request
- `resolveConflict(url, keepLocal: boolean)` — Para 409: fuerza PUT o descarta

### UI
- Banner en header cuando hay items pendientes (N cambios requieren atención)
- Lista con: timestamp, método, URL (entidad legible), razón del fallo
- Para 409: modal con diff lado-a-lado (offline vs server)

## 5. Offline Fallback Page

**`src/app/offline/page.tsx`** (NUEVO)
- App shell minimal cuando no hay cache de la ruta solicitada
- Mensaje: "Esta página no está disponible offline"
- Botón: "Reintentar" 
- Links a secciones que SÍ funcionan offline (dashboard, animales)

## 6. Manifest Enhancement

**`public/manifest.json`** (MODIFICAR)
- Agregar `shortcuts` para acceso rápido
- Agregar `screenshots` para install prompt
- Agregar `categories`
- Agregar `lang: "es"`

## 7. Lighthouse Validation

Verificar que la configuración de `.lighthouserc.json` cubre PWA score > 90.
Agregar URL de sincronización a las páginas auditadas.

---

## Resumen de Archivos

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/shared/lib/idb-persister.ts` | CREAR | Persister TanStack Query → IndexedDB |
| `src/shared/providers/app-providers.tsx` | MODIFICAR | PersistQueryClientProvider |
| `src/shared/lib/query-client.ts` | MODIFICAR | gcTime 24h |
| `src/sw.ts` | MODIFICAR | Refresh-before-replay, conflict handling, offline fallback |
| `src/app/dashboard/sincronizacion/page.tsx` | CREAR | Página de resolución de conflictos |
| `src/app/dashboard/sincronizacion/components/sync-queue-list.tsx` | CREAR | Lista de cola de sync |
| `src/app/dashboard/sincronizacion/components/conflict-resolver.tsx` | CREAR | Modal de resolución |
| `src/app/dashboard/sincronizacion/components/failed-item-card.tsx` | CREAR | Card de item fallido |
| `src/shared/hooks/use-sync-actions.ts` | CREAR | Acciones de resolución |
| `src/app/offline/page.tsx` | CREAR | Offline fallback page |
| `public/manifest.json` | MODIFICAR | Shortcuts, screenshots, lang |
| `package.json` | MODIFICAR | idb-keyval + persist-client deps |
| Tests unitarios | CREAR | Para cada hook y component nuevo |
| Tests E2E | CREAR | Flujo offline completo |
