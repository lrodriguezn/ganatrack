# Fase 4 Reportes Backend — Delta Specifications

## Reportes Module Specification

### Requirement: REP-01 — Inventario Report JSON Endpoint

The system MUST provide a GET endpoint at `/api/v1/reportes/inventario` that returns livestock inventory aggregated data.

#### Scenario: Successful inventory report generation

- GIVEN a predio with animals, potreros, razas, and estados
- WHEN GET `/api/v1/reportes/inventario?predioId=1&fecha=2026-04-05`
- THEN response MUST include `totalAnimales`, `porEstado[]`, `porRaza[]`, `porPotrero[]`, `porSexo[]`
- AND all data MUST be filtered by `predioId` and `fecha`

#### Scenario: Optional filters narrow results

- GIVEN optional query parameters `potreroId`, `razaId`
- WHEN GET `/api/v1/reportes/inventario?predioId=1&fecha=2026-04-05&potreroId=2&razaId=3`
- THEN response aggregates only animals matching the filters

### Requirement: REP-02 — Reproductivo Report JSON Endpoint

The system MUST provide a GET endpoint at `/api/v1/reportes/reproductivo` that returns reproductive performance metrics.

#### Scenario: Successful reproductive report generation

- GIVEN a predio with palpaciones, inseminaciones, and partos records
- WHEN GET `/api/v1/reportes/reproductivo?predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31`
- THEN response MUST include `tasaConcepcion`, `serviciosPorMes[]`, `intervaloPartos`, `tasaPreniez`

### Requirement: REP-03 — Mortalidad Report JSON Endpoint

The system MUST provide a GET endpoint at `/api/v1/reportes/mortalidad` that returns mortality statistics.

#### Scenario: Successful mortality report generation

- GIVEN a predio with animal mortality records
- WHEN GET `/api/v1/reportes/mortalidad?predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31`
- THEN response MUST include `totalMuertes`, `porCausa[]`, `porEdad[]`, `tendenciaMensual[]`

#### Scenario: Optional causa filter narrows results

- GIVEN optional `causaId` parameter
- WHEN GET `/api/v1/reportes/mortalidad?predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31&causaId=2`
- THEN response aggregates only deaths matching the specified cause

### Requirement: REP-04 — Movimiento Report JSON Endpoint

The system MUST provide a GET endpoint at `/api/v1/reportes/movimiento` that returns livestock movement summary.

#### Scenario: Successful movement report generation

- GIVEN a predio with compras and ventas records
- WHEN GET `/api/v1/reportes/movimiento?predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31`
- THEN response MUST include `compras`, `ventas`, `saldoNeto`, `porMes[]`

### Requirement: REP-05 — Sanitario Report JSON Endpoint

The system MUST provide a GET endpoint at `/api/v1/reportes/sanitario` that returns sanitary event summary.

#### Scenario: Successful sanitary report generation

- GIVEN a predio with veterinary services and treatments
- WHEN GET `/api/v1/reportes/sanitario?predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31`
- THEN response MUST include `eventosPorTipo[]`, `vacunacionesPendientes[]`, `tratamientos[]`

#### Scenario: Optional veterinario filter narrows results

- GIVEN optional `veterinarioId` parameter
- WHEN GET `/api/v1/reportes/sanitario?predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31&veterinarioId=5`
- THEN response aggregates only events handled by the specified veterinarian

## Export Trigger Specification

### Requirement: EXP-01 — Inventario Export Trigger

The system MUST provide a GET endpoint at `/api/v1/reportes/inventario/export` that triggers export generation.

#### Scenario: Sync export for small dataset

- GIVEN inventory report with <1000 records
- WHEN GET `/api/v1/reportes/inventario/export?formato=pdf&predioId=1&fecha=2026-04-05`
- THEN response MUST return the file directly for immediate download
- AND content-type MUST match the requested format

#### Scenario: Async export for large dataset

- GIVEN inventory report with >=1000 records
- WHEN GET `/api/v1/reportes/inventario/export?formato=xlsx&predioId=1&fecha=2026-04-05`
- THEN response MUST return `{ jobId: "uuid" }` with HTTP 202
- AND a background job MUST be enqueued for processing

### Requirement: EXP-02 — Reproductivo Export Trigger

The system MUST provide a GET endpoint at `/api/v1/reportes/reproductivo/export` that triggers export generation.

#### Scenario: CSV export request

- WHEN GET `/api/v1/reportes/reproductivo/export?formato=csv&predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31`
- THEN the system generates CSV file with reproductive data
- AND returns file or jobId based on record count threshold

### Requirement: EXP-03 — Mortalidad Export Trigger

The system MUST provide a GET endpoint at `/api/v1/reportes/mortalidad/export` that triggers export generation.

#### Scenario: PDF export with filters

- WHEN GET `/api/v1/reportes/mortalidad/export?formato=pdf&predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31&causaId=2`
- THEN the system generates PDF including only deaths matching the cause filter

### Requirement: EXP-04 — Movimiento Export Trigger

The system MUST provide a GET endpoint at `/api/v1/reportes/movimiento/export` that triggers export generation.

#### Scenario: XLSX export request

- WHEN GET `/api/v1/reportes/movimiento/export?formato=xlsx&predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31`
- THEN the system generates Excel file with movement data

### Requirement: EXP-05 — Sanitario Export Trigger

The system MUST provide a GET endpoint at `/api/v1/reportes/sanitario/export` that triggers export generation.

#### Scenario: PDF export with veterinarian filter

- WHEN GET `/api/v1/reportes/sanitario/export?formato=pdf&predioId=1&fechaInicio=2026-01-01&fechaFin=2026-03-31&veterinarioId=5`
- THEN the system generates PDF with events handled by the specified veterinarian

## Export Management Specification

### Requirement: EXP-06 — List User Exports

The system MUST provide a GET endpoint at `/api/v1/reportes/exportaciones` that lists user's export jobs.

#### Scenario: Paginated export list

- GIVEN a user with 25 export jobs
- WHEN GET `/api/v1/reportes/exportaciones?page=2&limit=10`
- THEN response MUST return paginated list with `data[]`, `meta: { page, limit, total }`
- AND only exports belonging to the authenticated user and predio MUST be returned

### Requirement: EXP-07 — Get Export Job Status

The system MUST provide a GET endpoint at `/api/v1/reportes/exportaciones/:id` that returns job status.

#### Scenario: Job status transitions

- GIVEN a job with ID "abc123"
- WHEN GET `/api/v1/reportes/exportaciones/abc123`
- THEN response MUST include `estado` (pendiente|procesando|completado|fallido)
- AND if `estado` is "completado", MUST include `rutaArchivo`
- AND if `estado` is "fallido", MUST include error details

### Requirement: EXP-08 — Download Export File

The system MUST provide a GET endpoint at `/api/v1/reportes/exportaciones/:id/download` that downloads the generated file.

#### Scenario: Download completed export

- GIVEN a completed export job with `rutaArchivo`
- WHEN GET `/api/v1/reportes/exportaciones/abc123/download`
- THEN the system streams the file with appropriate content-type
- AND the file MUST be deleted after 30 days (enforced by cleanup cron)

### Requirement: EXP-09 — Delete Export Job

The system MUST provide a DELETE endpoint at `/api/v1/reportes/exportaciones/:id` that soft-deletes an export job.

#### Scenario: Soft delete with file removal

- GIVEN an export job with ID "abc123"
- WHEN DELETE `/api/v1/reportes/exportaciones/abc123`
- THEN `activo` field MUST be set to 0
- AND if file exists, it MUST be deleted from disk
- AND subsequent GET requests MUST NOT return the deleted job

## Database Schema Modification

### Requirement: DB-01 — Add Foreign Keys to reportes_exportaciones

The system MUST modify the `reportes_exportaciones` table to include `predioId` and `usuarioId` foreign key columns.

#### Scenario: Schema includes required foreign keys

- GIVEN the `reportesExportaciones` table definition
- WHEN the schema is generated
- THEN it MUST include `predioId: integer('predio_id').notNull().references(() => predios.id)`
- AND it MUST include `usuarioId: integer('usuario_id').notNull().references(() => usuarios.id)`
- AND both columns MUST have `ON DELETE RESTRICT` constraint

#### Scenario: Existing data migration

- GIVEN existing rows without predioId and usuarioId
- WHEN migration runs
- THEN columns MUST be added as nullable first
- AND application logic MUST populate them before adding NOT NULL constraint

## Security Specification

### Requirement: SEC-01 — Report Read Permission

The system MUST enforce `reportes:read` permission for all JSON report endpoints.

#### Scenario: Authorized access to report endpoints

- GIVEN a user with `reportes:read` permission
- WHEN accessing any GET `/api/v1/reportes/{tipo}` endpoint
- THEN the request MUST succeed with aggregated data

#### Scenario: Unauthorized access denied

- GIVEN a user without `reportes:read` permission
- WHEN accessing any GET `/api/v1/reportes/{tipo}` endpoint
- THEN response MUST return 403 Forbidden with error code `FORBIDDEN`

### Requirement: SEC-02 — Export Permission

The system MUST enforce `reportes:export` permission for all export trigger and management endpoints.

#### Scenario: Authorized export access

- GIVEN a user with `reportes:export` permission
- WHEN accessing any export endpoint
- THEN the request MUST succeed

#### Scenario: Export permission required for management

- GIVEN a user without `reportes:export` permission
- WHEN accessing GET `/api/v1/reportes/exportaciones`
- THEN response MUST return 403 Forbidden

## Job Queue Specification

### Requirement: JOB-01 — Job Enqueue and Processing

The system MUST implement an in-memory job queue for async export processing.

#### Scenario: Job enqueue on threshold

- GIVEN an export request with >=1000 records
- WHEN the export trigger is called
- THEN a job MUST be enqueued with `estado: 'pendiente'`
- AND the job MUST transition to `procesando` when picked up by worker
- AND upon completion, `estado` MUST be `completado` with `rutaArchivo` set

#### Scenario: Job failure handling

- GIVEN a job that fails during processing
- WHEN an error occurs during file generation
- THEN `estado` MUST be set to `fallido`
- AND error details MUST be stored in the job record

### Requirement: JOB-02 — Job Status Polling

The system MUST provide real-time job status updates via the export management endpoints.

#### Scenario: Status polling for async job

- GIVEN an async job with ID "abc123"
- WHEN client polls GET `/api/v1/reportes/exportaciones/abc123`
- THEN response MUST reflect current `estado`
- AND when `estado` is "completado", `rutaArchivo` MUST be available for download
- AND when `estado` is "fallido", error details MUST be included