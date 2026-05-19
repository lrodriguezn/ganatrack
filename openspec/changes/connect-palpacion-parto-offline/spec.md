# Delta for Servicios Offline Queue

## ADDED Requirements

### Requirement: PartoForm Offline Submission

The PartoForm page (`/dashboard/servicios/partos/nuevo`) MUST route submissions through `submitFormWithOfflineSupport` so that when the device is offline, the form payload is queued to IndexedDB and auto-synced on reconnect.

#### Scenario: Online submission with idempotency header

- GIVEN the device is online
- WHEN the user submits the PartoForm with valid data
- THEN the system MUST generate a unique `X-Idempotency-Key` header
- AND pass it to `createParto()` via the `headers` parameter
- AND redirect to `/dashboard/servicios/partos` on success

#### Scenario: Offline submission queues to IndexedDB

- GIVEN the device is offline (`navigator.onLine === false`)
- WHEN the user submits the PartoForm
- THEN the system MUST store the payload in IndexedDB with `formType: 'parto'`
- AND display a "Guardado offline — se sincronizará cuando haya conexión" message
- AND MUST NOT redirect away from the form

#### Scenario: Queued submission auto-submits on reconnect

- GIVEN a PartoForm submission was queued to IndexedDB while offline
- WHEN the device reconnects and `useOfflineQueue` processes the queue
- THEN each queued item MUST be submitted with its stored `X-Idempotency-Key` header
- AND the backend idempotency middleware MUST deduplicate any replay

### Requirement: PalpacionForm Final Submit Offline

The PalpacionForm wizard page (`/dashboard/servicios/palpaciones/nuevo`) MUST route the final assembled `CreatePalpacionEventoDto` through `submitFormWithOfflineSupport` at step 3 submit only.

#### Scenario: Online final submit with idempotency header

- GIVEN the device is online
- AND the wizard has completed all 3 steps with valid data
- WHEN the user clicks "Guardar Evento"
- THEN the system MUST assemble the complete `CreatePalpacionEventoDto`
- AND generate an `X-Idempotency-Key` header
- AND pass it to `createPalpacionEvento()` via the `headers` parameter
- AND redirect to `/dashboard/servicios/palpaciones` on success

#### Scenario: Offline final submit queues assembled DTO

- GIVEN the device is offline
- AND the wizard has completed all 3 steps
- WHEN the user clicks "Guardar Evento"
- THEN the system MUST queue the complete assembled `CreatePalpacionEventoDto` to IndexedDB
- AND display the offline queued message without redirecting

#### Scenario: Mid-wizard offline does not queue partial data

- GIVEN the device goes offline during step 1 or step 2 of the wizard
- WHEN the user has not yet submitted the final step
- THEN no data MUST be queued to IndexedDB
- AND the user MUST be able to continue filling the wizard steps

### Requirement: Service Layer Header Parameters

The `RealServiciosService.createParto()` and `RealServiciosService.createPalpacion()` methods MUST accept an optional `headers?: Record<string, string>` parameter and forward it to `apiClient.post`.

#### Scenario: createParto accepts headers parameter

- GIVEN `createParto` is called with `CreatePartoDto` and `{ 'X-Idempotency-Key': 'abc' }`
- THEN the underlying `apiClient.post` call MUST include that header in the request
- AND when called without the `headers` parameter, behavior MUST be unchanged

#### Scenario: createPalpacion accepts headers parameter

- GIVEN `createPalpacion` is called with `CreatePalpacionEventoDto` and `{ 'X-Idempotency-Key': 'xyz' }`
- THEN the underlying `apiClient.post` call MUST include that header in the request
- AND when called without the `headers` parameter, behavior MUST be unchanged

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## Error Scenarios

### Scenario: Network error on online submit

- GIVEN the device is online but the API call fails with a network error
- WHEN `submitFormWithOfflineSupport` catches the error
- THEN the system MUST show the error message inline
- AND MUST NOT queue to IndexedDB (network was available)

### Scenario: Backend returns 409 Conflict (idempotency replay)

- GIVEN a queued item is replayed with the same idempotency key
- WHEN the backend returns 409 Conflict
- THEN the queue consumer MUST treat this as success
- AND remove the item from IndexedDB
- AND increment sync success counter

### Scenario: Backend returns non-409 error on replay

- GIVEN a queued item is replayed with a different idempotency key or new data
- WHEN the backend returns 4xx/5xx error
- THEN the queue item MUST remain in IndexedDB for retry
- AND an error counter MUST be incremented