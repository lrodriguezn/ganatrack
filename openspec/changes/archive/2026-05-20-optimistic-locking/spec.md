# SDD Spec: Optimistic Locking with Version-Based Conflict Detection

**Issue**: #36  
**Scope**: `animales` entity only. Servicios deferred.  
**Approach**: Use-case level version check with `If-Match` / `X-Resource-Version` header contract.

---

## 1. Requirements

### REQ-1: Schema Version Column
- **ID**: REQ-1
- **Priority**: MUST
- **Description**: Add a `version INTEGER NOT NULL DEFAULT 1` column to the `animales` table.
- **Acceptance Criteria**:
  - [ ] Drizzle migration creates `version INTEGER NOT NULL DEFAULT 1` on `animales`
  - [ ] Existing rows default to version 1
  - [ ] New animal inserts set version = 1 automatically
  - [ ] Migration is reversible (down migration removes column)

### REQ-2: Domain Entity Version Field
- **ID**: REQ-2
- **Priority**: MUST
- **Description**: `AnimalEntity` includes `version: number`.
- **Acceptance Criteria**:
  - [ ] `AnimalEntity` interface has `version: number`
  - [ ] Entity is used throughout domain/application layers without data loss

### REQ-3: Backend DTO Version in Response
- **ID**: REQ-3
- **Priority**: MUST
- **Description**: `AnimalResponseDto` includes `version: number`.
- **Acceptance Criteria**:
  - [ ] `AnimalResponseDto` interface has `version: number`
  - [ ] All animal read operations return version in response body

### REQ-4: GET Returns X-Resource-Version Header
- **ID**: REQ-4
- **Priority**: MUST
- **Description**: `GET /api/v1/animales/:id` responds with `X-Resource-Version: {version}` header.
- **Acceptance Criteria**:
  - [ ] Response header `X-Resource-Version` is present with current animal version
  - [ ] Header value is a positive integer as string

### REQ-5: PUT Requires If-Match Header
- **ID**: REQ-5
- **Priority**: MUST
- **Description**: `PUT /api/v1/animales/:id` requires `If-Match: {expectedVersion}` header.
- **Acceptance Criteria**:
  - [ ] Request without `If-Match` returns 400 with `MISSING_IF_MATCH` error code
  - [ ] Request with `If-Match: *` is NOT accepted (explicit version required)
  - [ ] Request with non-integer `If-Match` returns 400

### REQ-6: Version Conflict Returns 409
- **ID**: REQ-6
- **Priority**: MUST
- **Description**: When `If-Match` version does not match current entity version, return 409 with `VERSION_CONFLICT` code and conflict details.
- **Acceptance Criteria**:
  - [ ] Response status is 409
  - [ ] Error code is `VERSION_CONFLICT`
  - [ ] Error body includes `details.currentVersion` (server's current) and `details.expectedVersion` (client's sent)
  - [ ] Error message is human-readable in Spanish

### REQ-7: Successful PUT Increments Version
- **ID**: REQ-7
- **Priority**: MUST
- **Description**: On successful PUT with correct `If-Match`, entity version increments by 1 and new version is returned in `X-Resource-Version` response header.
- **Acceptance Criteria**:
  - [ ] Version increments atomically on each successful update
  - [ ] Response header `X-Resource-Version` reflects the new version
  - [ ] Response body `AnimalResponseDto.version` reflects the new version

### REQ-8: Create Sets Initial Version
- **ID**: REQ-8
- **Priority**: MUST
- **Description**: `POST /api/v1/animales` creates animal with `version = 1`.
- **Acceptance Criteria**:
  - [ ] Newly created animals have version = 1
  - [ ] GET on newly created animal returns version = 1 in header and body

### REQ-9: Repository Version-Aware Update
- **ID**: REQ-9
- **Priority**: MUST
- **Description**: Repository `update` method increments `version = version + 1` on each update.
- **Acceptance Criteria**:
  - [ ] Repository `update` increments version in the SET clause
  - [ ] Conditional WHERE on `id` only (version check happens in use case)

### REQ-10: Frontend GET Interceptor Captures X-Resource-Version
- **ID**: REQ-10
- **Priority**: MUST
- **Description**: API client interceptor reads `X-Resource-Version` from GET responses and stores version in request metadata for subsequent PUT.
- **Acceptance Criteria**:
  - [ ] ky interceptor reads `X-Resource-Version` header from GET /api/v1/animales/:id
  - [ ] Version is stored (e.g., in request metadata or cache)
  - [ ] On PUT to same endpoint, interceptor attaches version as `If-Match` header

### REQ-11: TanStack Query Cache Meta Integration
- **ID**: REQ-11
- **Priority**: MUST
- **Description**: TanStack Query query cache stores `X-Resource-Version` in query meta.
- **Acceptance Criteria**:
  - [ ] On GET animal query success, `queryClient.setQueryData` stores version in meta
  - [ ] Animal edit mutation reads version from cache meta before executing
  - [ ] Cache is invalidated on successful mutation

### REQ-12: FormQueueItem Supports PUT and Version
- **ID**: REQ-12
- **Priority**: MUST
- **Description**: `FormQueueItem` schema (offline queue types) is extended to support `method: 'PUT'` and `expectedVersion: number`.
- **Acceptance Criteria**:
  - [ ] `formQueueItemSchema.method` accepts `'PUT'` in addition to `'POST'`
  - [ ] New optional field `expectedVersion: z.number().int().positive()` is added
  - [ ] TypeScript type `FormQueueItem` reflects new fields
  - [ ] Existing POST items without version continue to validate (version defaults safe)

### REQ-13: Offline Queue PUT with Version Metadata
- **ID**: REQ-13
- **Priority**: MUST
- **Description**: When a PUT mutation is queued offline, `expectedVersion` is stored alongside the request.
- **Acceptance Criteria**:
  - [ ] `submitFormWithOfflineSupport` for PUT stores the version from cache/options
  - [ ] Queued PUT items include `expectedVersion` in stored payload
  - [ ] Service worker replays with `If-Match: {expectedVersion}` header

### REQ-14: Service Worker Captures Server Version on 409
- **ID**: REQ-14
- **Priority**: MUST
- **Description**: When BackgroundSync replay gets 409, the service worker parses `currentVersion` from the error response body and stores it in the conflict queue.
- **Acceptance Criteria**:
  - [ ] 409 response body is JSON-parsed (contains `error.details.currentVersion`)
  - [ ] Conflict queue item includes `serverVersion: number` field
  - [ ] `SyncQueueItem` interface (sw.ts) extended with `serverVersion` field
  - [ ] `moveToConflictQueue` stores the parsed `serverVersion`

### REQ-15: Conflict Queue Extended with Server Version
- **ID**: REQ-15
- **Priority**: MUST
- **Description**: Conflict queue items store the server's current version for informed conflict resolution.
- **Acceptance Criteria**:
  - [ ] `ganatrack-conflict-queue` IndexedDB stores `serverVersion: number` per item
  - [ ] `useFailedSync` hook reads and displays server version from conflict items
  - [ ] Frontend UI can show "Server has version N, your edit was based on version M"

### REQ-16: Resolve Conflict Uses If-Match with Latest Version
- **ID**: REQ-16
- **Priority**: MUST
- **Description**: `resolveConflict(item, keepLocal)` sends PUT with `If-Match: {serverVersion}` when keeping local, or discards if accepting server.
- **Acceptance Criteria**:
  - [ ] When `keepLocal=true`, fetch sends `If-Match: {serverVersion}` (not `X-Force-Update`) for version-aware force
  - [ ] When `keepLocal=false`, item is removed from conflict queue (accepts server)
  - [ ] `X-Force-Update: true` header is removed from `resolveConflict` flow (deprecated for animales)

### REQ-17: Backward Compatibility — Missing If-Match
- **ID**: REQ-17
- **Priority**: MUST
- **Description**: Existing clients without `If-Match` header receive a clear 400 error (not a silent 409 or server error).
- **Acceptance Criteria**:
  - [ ] Requests without `If-Match` get 400 `MISSING_IF_MATCH` error
  - [ ] Error message: "Se requiere el header If-Match para actualizar este recurso"
  - [ ] Existing `X-Force-Update` clients do NOT bypass version check (they must be updated to use `If-Match`)

### REQ-18: Backward Compatibility — Existing POST Queue Items
- **ID**: REQ-18
- **Priority**: MUST
- **Description**: Existing offline queue items with `method: 'POST'` continue to work without modification.
- **Acceptance Criteria**:
  - [ ] FormQueueItem schema treats `method: 'POST'` as before (no version required)
  - [ ] POST queue items replay without `If-Match` header
  - [ ] Service worker POST handling unchanged for non-conflict paths

### REQ-19: Migration Default for Existing Data
- **ID**: REQ-19
- **Priority**: MUST
- **Description**: Migration sets `version = 1` for all existing animals (no null versions allowed).
- **Acceptance Criteria**:
  - [ ] Migration SQL sets `version = 1` for all rows in `animales`
  - [ ] No migration needed for new inserts (DB default handles it)
  - [ ] Rollback migration drops column without data loss concern

### REQ-20: Error Response Format
- **ID**: REQ-20
- **Priority**: MUST
- **Description**: All error responses from the API follow a consistent structure.
- **Acceptance Criteria**:
  - [ ] Non-validation errors: `{ success: false, error: { code: string, message: string, details?: Record<string, any> } }`
  - [ ] `VERSION_CONFLICT` error includes `details: { currentVersion: number, expectedVersion: number }`
  - [ ] `MISSING_IF_MATCH` error includes `details: { field: 'If-Match' }`

---

## 2. API Contract

### 2.1 GET /api/v1/animales/:id

**Request**: No special headers required (standard auth applies).

**Response Headers**:
```
HTTP/1.1 200 OK
X-Resource-Version: 3
Content-Type: application/json
```

**Response Body**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "predioId": 1,
    "codigo": "VACA001",
    "nombre": "Luna",
    "version": 3,
    ...other fields
  }
}
```

### 2.2 PUT /api/v1/animales/:id

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
If-Match: 2
```

**Request Body** (partial update supported):
```json
{
  "nombre": "Luna Actualizada"
}
```

**Success Response Headers**:
```
HTTP/1.1 200 OK
X-Resource-Version: 3
Content-Type: application/json
```

**Success Response Body**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "version": 3,
    ...full animal
  }
}
```

**409 Conflict Response**:
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "El recurso fue modificado por otro usuario. Se requiere la versión actual para actualizar.",
    "details": {
      "currentVersion": 4,
      "expectedVersion": 2
    }
  }
}
```

**400 Missing If-Match Response**:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_IF_MATCH",
    "message": "Se requiere el header If-Match para actualizar este recurso.",
    "details": {
      "field": "If-Match"
    }
  }
}
```

### 2.3 Error Schema

```typescript
// All API errors conform to this structure
interface ErrorResponse {
  success: false
  error: {
    code: string           // e.g., "VERSION_CONFLICT", "MISSING_IF_MATCH", "NOT_FOUND"
    message: string        // Human-readable Spanish message
    details?: {
      currentVersion?: number  // For VERSION_CONFLICT
      expectedVersion?: number // For VERSION_CONFLICT
      field?: string           // For validation errors
    }
  }
}
```

---

## 3. Scenarios

### Scenario 1: Happy Path — Edit Animal with Correct Version

**Given**: User A fetches animal #42, receives `X-Resource-Version: 5`  
**And**: Animal #42 has `version = 5` in database  

**When**: User A submits PUT to `/api/v1/animales/42` with `If-Match: 5` and `{ nombre: "Nuevo Nombre" }`  

**Then**: Response is 200 with `X-Resource-Version: 6`  
**And**: Animal #42 `version` in database is 6  
**And**: `AnimalResponseDto.version` is 6  

---

### Scenario 2: Conflict Path — Edit Animal with Stale Version

**Given**: Animal #42 has `version = 3`  
**And**: User A fetches animal #42 (gets version 3)  
**And**: User B fetches animal #42 (gets version 3)  
**And**: User A submits PUT with `If-Match: 3`, succeeds → version becomes 4  

**When**: User B submits PUT with `If-Match: 3` (stale)  

**Then**: Response is 409 with code `VERSION_CONFLICT`  
**And**: Error body is:
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "El recurso fue modificado por otro usuario. Se requiere la versión actual para actualizar.",
    "details": { "currentVersion": 4, "expectedVersion": 3 }
  }
}
```
**And**: User B sees conflict resolution UI showing current version 4 vs their base version 3  

---

### Scenario 3: Offline Path — Queue PUT with Version, Reconnect, Conflict, Resolve

**Given**: User is offline  
**And**: Animal #42 has `version = 2`  
**And**: User fetched animal #42 before going offline (version stored locally)  

**When**: User edits animal #42 offline, mutation is queued with `expectedVersion: 2`  

**Then**: Item is stored in IndexedDB form queue with method `PUT` and `expectedVersion: 2`  

---

**Given**: User comes back online, BackgroundSync replays the queued PUT  
**And**: Server-side animal #42 now has `version = 5` (another user updated)  

**When**: Service worker replays PUT with `If-Match: 2`  

**Then**: Server returns 409 `VERSION_CONFLICT` with `currentVersion: 5, expectedVersion: 2`  
**And**: Service worker moves item to `ganatrack-conflict-queue` with `serverVersion: 5`  
**And**: User is notified of conflict  

---

**Given**: Conflict queue has item for animal #42 with `serverVersion: 5`  

**When**: User chooses "keep my version" (`keepLocal: true`)  

**Then**: `resolveConflict` sends PUT with `If-Match: 5` (server's current)  
**And**: Server accepts and increments version to 6  
**And**: Conflict item is removed from queue  

---

**Given**: Conflict queue has item for animal #42 with `serverVersion: 5`  

**When**: User chooses "accept server version" (`keepLocal: false`)  

**Then**: Conflict item is removed from queue  
**And**: Local changes are discarded  
**And**: User sees updated animal #42 data  

---

### Scenario 4: Backward Compatibility — Existing POST Queue Items

**Given**: IndexedDB has existing queue item from before this feature:
```json
{
  "id": "uuid-1",
  "formType": "animal",
  "method": "POST",
  "endpoint": "/api/v1/animales",
  "payload": { "codigo": "NEW001" },
  "status": "pending"
}
```

**When**: Service worker replays the item  

**Then**: POST request is sent without `If-Match` header  
**And**: Server creates animal with `version = 1`  
**And**: Item is removed from queue (no conflict possible on POST)  

---

### Scenario 5: Missing If-Match on PUT

**Given**: Client sends PUT without `If-Match` header  

**When**: Request arrives at server  

**Then**: Response is 400 with code `MISSING_IF_MATCH`  
**And**: Error message: "Se requiere el header If-Match para actualizar este recurso."  

---

## 4. Data Model Changes

### 4.1 Schema Diff — `packages/database/src/schema/animales.ts`

```diff
 export const animales = sqliteTable('animales', {
   id: integer('id').primaryKey({ autoIncrement: true }),
   predioId: integer('predio_id').notNull(),
   codigo: text('codigo', { length: 20 }).notNull(),
   ...
   activo: integer('activo').notNull().default(1),
   createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
   updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
+  version: integer('version').notNull().default(1),
 }, (table) => [
```

### 4.2 Domain Entity — `AnimalEntity`

```diff
 export interface AnimalEntity {
+  version: number
   id: number
   ...
 }
```

### 4.3 DTO Changes

**AnimalResponseDto** — add `version: number` to response interface.

**UpdateAnimalDto** — unchanged (version is in header, not body).

### 4.4 Migration File

Generated by drizzle-kit. SQL equivalent:
```sql
ALTER TABLE animales ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
UPDATE animales SET version = 1 WHERE version IS NULL;
```

---

## 5. State Machine — Offline Conflict Resolution

```
┌──────────┐   queue PUT    ┌───────────┐   sync replays   ┌────────────┐
│  QUEUED  │ ─────────────▶│  FLUSHING │ ───────────────▶ │    409     │
└──────────┘               └───────────┘                  │ -CONFLICT  │
                                                             └─────┬────┘
                                                                   │
                       ┌─────────────────────────────────────────────┘
                       ▼
              ┌────────────────┐
              │   RESOLVED     │◀────────────────────────────┐
              │ (overwrite)    │                             │
              └────────────────┘                             │
                       │                                     │ resolveConflict(keepLocal=true)
                       │ resolveConflict(keepLocal=false)    │
                       ▼                                     │
              ┌────────────────┐                             │
              │   RESOLVED     │                             │
              │  (discard)     │────────────────────────────┘
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  COMPLETED     │
              └────────────────┘
```

### States

| State | Description |
|-------|-------------|
| `queued` | Item stored in IndexedDB form queue with `expectedVersion` |
| `flushing` | BackgroundSync picked up item, replay in progress |
| `409-conflict` | Server returned 409 VERSION_CONFLICT, item in `ganatrack-conflict-queue` with `serverVersion` |
| `resolved-overwrite` | User chose to overwrite server; PUT sent with `If-Match: serverVersion` |
| `resolved-discard` | User chose to accept server; conflict item removed, local changes discarded |
| `completed` | Conflict resolved, queues clean |

### Transitions

| From | Event | To |
|------|-------|-----|
| `queued` | BackgroundSync tag fires | `flushing` |
| `flushing` | 409 response received | `409-conflict` |
| `flushing` | 2xx/4xx non-409 response | `completed` |
| `flushing` | Network error / 5xx | stays `flushing` (BackgroundSync retries) |
| `409-conflict` | `resolveConflict(item, true)` | `resolved-overwrite` |
| `409-conflict` | `resolveConflict(item, false)` | `resolved-discard` |
| `resolved-overwrite` | Server accepts (2xx) | `completed` |
| `resolved-overwrite` | Server rejects (409 again) | `409-conflict` (new version conflict) |
| `resolved-discard` | Item removed from queue | `completed` |

---

## 6. Test Strategy

### 6.1 Unit Tests (Backend)

**UpdateAnimalUseCase**:
- Throws `NotFoundError` when animal does not exist
- Throws `ConflictError` with `VERSION_CONFLICT` when `expectedVersion` != current version
- Increments version and returns updated entity when version matches
- Does NOT increment version when `expectedVersion` matches but update fails

**AnimalMapper**:
- Maps `version` from entity to response DTO

**DrizzleAnimalRepository**:
- `create` sets `version = 1`
- `update` increments `version = version + 1` in SET clause

**Route Handler** (inline test or route-level):
- Returns 400 `MISSING_IF_MATCH` when `If-Match` header absent
- Returns 400 for non-integer `If-Match` values
- Passes `expectedVersion` to use case
- Sets `X-Resource-Version` header on 200 response

### 6.2 Integration Tests (API Contract)

**GET /api/v1/animales/:id**:
- Returns `X-Resource-Version` header with correct version
- Response body includes `version` field
- Version increments after subsequent PUT

**PUT /api/v1/animales/:id**:
- 200 with correct `If-Match`, version incremented in header and body
- 409 `VERSION_CONFLICT` with stale `If-Match`, includes `currentVersion` and `expectedVersion` in details
- 400 `MISSING_IF_MATCH` when header absent
- 404 when animal not found (separate error code, not `VERSION_CONFLICT`)

**Offline conflict flow** (mock BackgroundSync):
- Queued PUT with version replays with correct `If-Match`
- 409 response moves item to conflict queue with `serverVersion`

### 6.3 Frontend Unit Tests

**apiClient interceptor**:
- Reads `X-Resource-Version` from GET response
- Attaches `If-Match` on subsequent PUT to same resource
- Does not attach `If-Match` to POST or DELETE

**FormQueueItem schema**:
- Validates `method: 'POST'` (existing behavior)
- Validates `method: 'PUT'` with `expectedVersion`
- Validates `method: 'PUT'` without `expectedVersion` (graceful degradation for older queued items)

**resolveConflict**:
- Sends `If-Match` with `serverVersion` when `keepLocal=true`
- Does NOT send `X-Force-Update` header
- Removes item from conflict queue when `keepLocal=false`

### 6.4 E2E Tests (Playwright)

**Conflict Resolution Flow**:
1. Open two browser tabs with same animal
2. Tab A fetches animal (version N)
3. Tab B fetches animal (version N)
4. Tab A edits and saves (version N+1)
5. Tab B edits and saves → 409 shown
6. Conflict toast appears with version info
7. User resolves with "keep mine" → success, version N+2
8. Verify tab A shows updated data

**Offline Conflict Flow**:
1. Enable offline mode
2. Fetch animal (version captured in cache)
3. Edit animal → queued locally with version
4. Simulate server-side update (direct DB or second request)
5. Go online → sync replays → 409
6. Verify conflict queue shows item with `serverVersion`
7. Resolve conflict → verify final state

### 6.5 Testing Tools

- **Backend unit/integration**: Vitest (already in use per project context)
- **Frontend unit**: Vitest + React Testing Library
- **E2E**: Playwright (per project setup)

---

## 7. Backward Compatibility

### 7.1 Existing Clients Without `If-Match`

**Behavior**: Clients that send PUT without `If-Match` receive `400 MISSING_IF_MATCH`. This is intentional — explicit versioning is required for conflict safety.

**Migration path**: Clients must be updated to:
1. Read `X-Resource-Version` from GET response
2. Attach `If-Match` on PUT requests

**No silent fallback** — old clients will get a clear error rather than silently overwriting or causing undetected conflicts.

### 7.2 Existing Offline Queue POST Items

**Behavior**: `FormQueueItem` schema treats `method: 'POST'` as a special case — version is optional. Service worker replays POST without `If-Match`.

**Existing items** in IndexedDB (pre-migration):
- Schema migration: default `version` to 1 for new field
- Existing POST items don't include `expectedVersion` — this is fine because POST doesn't have the same conflict semantics as PUT

**Graceful degradation**: If an old POST item is replayed and gets 409, it's treated as a normal conflict (not version-specific).

### 7.3 Migration Strategy for Existing Data

```sql
-- Migration: add version column with default
ALTER TABLE animales ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- Backfill: set version = 1 for all existing rows
UPDATE animales SET version = 1 WHERE version IS NULL;
```

**Rollback**: `ALTER TABLE animales DROP COLUMN version` — safe because all data is preserved (dropping the column loses only the version tracking, not user data).

---

## 8. File Inventory

| File | Change | Notes |
|------|--------|-------|
| `packages/database/src/schema/animales.ts` | Add `version` column | Drizzle schema |
| `packages/database/src/schema/index.ts` | Auto-update types | Type exports |
| `drizzle.config.ts` + migrations | New migration | `version` column |
| `apps/api/src/modules/animales/domain/entities/animal.entity.ts` | Add `version: number` | Domain entity |
| `apps/api/src/modules/animales/application/dtos/animal.dto.ts` | Add `version` to `AnimalResponseDto` | Response DTO |
| `apps/api/src/modules/animales/application/use-cases/update-animal.use-case.ts` | Accept `expectedVersion`, version check | Use case |
| `apps/api/src/modules/animales/infrastructure/persistence/drizzle-animal.repository.ts` | Increment version on update | Repository |
| `apps/api/src/modules/animales/infrastructure/mappers/animal.mapper.ts` | Map version field | Mapper |
| `apps/api/src/modules/animales/infrastructure/http/routes/animales.routes.ts` | Read `If-Match`, set `X-Resource-Version` | Route |
| `apps/api/src/shared/errors/conflict.error.ts` | Add `VERSION_CONFLICT` code option | ConflictError |
| `apps/web/src/shared/lib/api-client.ts` | Interceptor for version headers | Ky interceptor |
| `apps/web/src/shared/lib/offline/types.ts` | Extend `FormQueueItem` for PUT + version | Offline types |
| `apps/web/src/sw.ts` | Capture `serverVersion` in conflict queue | Service worker |
| `apps/web/src/shared/hooks/use-sync-actions.ts` | `resolveConflict` with `If-Match` | Sync actions |
| `apps/web/src/shared/hooks/use-failed-sync.ts` | Read `serverVersion` from conflict items | Hook |

---

## 9. Summary of Test Coverage Needed

| Layer | What to Test | Tool |
|-------|-------------|------|
| **Backend unit** | `UpdateAnimalUseCase` version check logic | Vitest |
| **Backend unit** | `DrizzleAnimalRepository` create/update version handling | Vitest |
| **Backend unit** | `AnimalMapper` version mapping | Vitest |
| **Backend integration** | GET returns `X-Resource-Version` header | Vitest + Fastify inject |
| **Backend integration** | PUT with correct `If-Match` → 200, version incremented | Vitest |
| **Backend integration** | PUT with stale `If-Match` → 409 `VERSION_CONFLICT` | Vitest |
| **Backend integration** | PUT without `If-Match` → 400 `MISSING_IF_MATCH` | Vitest |
| **Frontend unit** | `apiClient` interceptor reads/sets version headers | Vitest |
| **Frontend unit** | `FormQueueItem` schema validates PUT + version | Vitest |
| **Frontend unit** | `resolveConflict` sends correct `If-Match` | Vitest |
| **E2E** | Two-tab concurrent edit conflict flow | Playwright |
| **E2E** | Offline queue → sync → conflict → resolve | Playwright |