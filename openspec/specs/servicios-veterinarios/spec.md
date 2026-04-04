# Servicios Veterinarios Specification

## Purpose

Complete veterinary services module for GanaTrack frontend — a group event system for veterinary treatments (vitamins, deworming, vaccination, medical treatments). Follows the established Palpaciones/Inseminaciones pattern: event header → animal selection → individual results per animal.

## Requirements

### Requirement: Veterinary Service Types

The system MUST define TypeScript interfaces and DTOs for veterinary service events and their animal-level records in `servicios.types.ts`.

#### Scenario: ServicioVeterinarioAnimal interface defined

- GIVEN an existing `servicios.types.ts` file
- WHEN the veterinary types are added
- THEN `ServicioVeterinarioAnimal` MUST include: `id`, `eventoId`, `animalesId`, `diagnosticosVeterinariosId`, `medicamentos?`, `dosis?`, `proximaAplicacion?`, `observaciones?`, `animalCodigo?`, `diagnosticoNombre?`

#### Scenario: ServicioVeterinarioEvento interface defined

- GIVEN `EventoGrupal` base interface exists
- WHEN the veterinary event type is added
- THEN `ServicioVeterinarioEvento` MUST extend `EventoGrupal` and include `animales: ServicioVeterinarioAnimal[]`

#### Scenario: DTOs for creation defined

- GIVEN the veterinary service types exist
- WHEN DTOs are created
- THEN `CreateServicioVeterinarioEventoDto` MUST include `predioId`, `codigo`, `fecha`, `veterinariosId`, `observaciones?`, and `animales: CreateServicioVeterinarioAnimalDto[]`
- AND `CreateServicioVeterinarioAnimalDto` MUST include `animalesId`, `diagnosticosVeterinariosId`, `medicamentos?`, `dosis?`, `proximaAplicacion?`, `observaciones?`

### Requirement: Service Methods

The system MUST extend the `ServiciosService` interface and both implementations (Mock and Real) with veterinary service CRUD methods.

#### Scenario: getServiciosVeterinarios returns paginated results

- GIVEN a predio with veterinary service events
- WHEN `getServiciosVeterinarios({ predioId, page, limit })` is called
- THEN it MUST return `PaginatedEventos<ServicioVeterinarioEvento>` with filtered, paginated data
- AND the returned events MUST NOT include the `animales` array (light payload for list view)

#### Scenario: getServicioVeterinarioById returns full event

- GIVEN a veterinary service event exists with ID 1
- WHEN `getServicioVeterinarioById(1)` is called
- THEN it MUST return the full `ServicioVeterinarioEvento` including the `animales` array
- AND if no event exists with that ID, it MUST throw `ApiError(404, 'NOT_FOUND', ...)`

#### Scenario: createServicioVeterinario persists new event

- GIVEN valid `CreateServicioVeterinarioEventoDto` data
- WHEN `createServicioVeterinario(data)` is called
- THEN it MUST return the created `ServicioVeterinarioEvento` with generated `id`, `createdAt`, and joined fields (`veterinarioNombre`, `totalAnimales`)
- AND each animal record MUST have generated `id`, `eventoId`, and `animalCodigo`

#### Scenario: Mock seed data is realistic

- GIVEN the mock service is initialized
- WHEN seed data is inspected
- THEN there MUST be at least 3 veterinary service events
- AND each event MUST have 3-5 animal records
- AND diagnosticos MUST include "Desparasitación", "Vacunación", "Vitaminas"
- AND mock data MUST include realistic `medicamentos`, `dosis`, and `proximaAplicacion` values

### Requirement: React Query Hooks

The system MUST provide three React Query hooks for veterinary services: list query, detail query, and create mutation.

#### Scenario: useServiciosVeterinarios fetches paginated list

- GIVEN a valid `predioId`, `page`, and `limit`
- WHEN `useServiciosVeterinarios(predioId, page, limit)` is called
- THEN it MUST use `useQuery` with a unique query key under `queryKeys.servicios.veterinarios`
- AND it MUST return `{ data, isLoading, error, refetch }`
- AND `staleTime` MUST match the LIST stale time constant

#### Scenario: useServicioVeterinario fetches single event

- GIVEN a valid event ID greater than 0
- WHEN `useServicioVeterinario(id)` is called
- THEN it MUST use `useQuery` with a detail query key
- AND `enabled` MUST be `id > 0`
- AND it MUST return the full event with animal records

#### Scenario: useCreateServicioVeterinario mutation invalidates cache

- GIVEN a successful create mutation
- WHEN `useCreateServicioVeterinario().mutateAsync(data)` resolves
- THEN it MUST invalidate all queries under `queryKeys.servicios.veterinarios.all`
- AND it MUST navigate to `/dashboard/servicios/veterinarios`
- AND on error, it MUST log the error to console

### Requirement: Zod Validation Schema

The system MUST define Zod schemas for form validation of the veterinary service wizard.

#### Scenario: Event schema validates required fields

- GIVEN a veterinary service event form
- WHEN validated against `servicioVeterinarioEventoSchema`
- THEN `codigo` MUST be a non-empty string
- AND `fecha` MUST be a non-empty string
- AND `veterinariosId` MUST be a number >= 1
- AND `observaciones` MAY be empty or undefined

#### Scenario: Animal schema validates required and optional fields

- GIVEN a per-animal result form
- WHEN validated against `servicioVeterinarioAnimalSchema`
- THEN `animalesId` MUST be a number >= 1
- AND `diagnosticosVeterinariosId` MUST be a number >= 1
- AND `medicamentos`, `dosis`, `proximaAplicacion`, `observaciones` MAY be undefined

#### Scenario: Wizard schema validates complete form

- GIVEN a full wizard form
- WHEN validated against `servicioVeterinarioWizardSchema`
- THEN `evento` MUST pass the event schema
- AND `animales` MUST be an array with at least 1 element
- AND each animal entry MUST pass the animal schema

### Requirement: Veterinary Services Table

The system MUST render a `servicios-veterinarios-table.tsx` component displaying veterinary service events with server-side pagination.

#### Scenario: Table displays correct columns

- GIVEN paginated veterinary service data
- WHEN the table renders
- THEN columns MUST include: código, fecha, veterinario, # animales, próxima aplicación pendiente, acciones
- AND "próxima aplicación pendiente" MUST show the nearest future `proximaAplicacion` date across all animals, or "-" if none

#### Scenario: Row click navigates to detail

- GIVEN a table row for event ID 5
- WHEN the row or "Ver detalle" button is clicked
- THEN the router MUST navigate to `/dashboard/servicios/veterinarios/5`

#### Scenario: Empty state displays when no data

- GIVEN an empty data array
- WHEN the table renders
- THEN it MUST show "No hay servicios veterinarios registrados" with a hint to create the first service

#### Scenario: Server-side pagination works

- GIVEN 25 total events and page size 10
- WHEN the user navigates to page 3
- THEN `onPaginationChange` MUST fire with `{ pageIndex: 2, pageSize: 10 }`
- AND the parent component MUST refetch with `page: 3, limit: 10`

### Requirement: Veterinary Service Form (Wizard Steps)

The system MUST provide a `servicio-veterinario-form.tsx` with three step components compatible with `ServicioGrupalWizard`.

#### Scenario: Step 1 renders event fields

- GIVEN the wizard is on step 1
- WHEN the event form renders
- THEN it MUST show fields for: código (text input), fecha (date input), veterinario (select from maestros), observaciones (textarea)
- AND the form MUST use `react-hook-form` with `zodResolver` against the event schema
- AND it MUST expose `trigger` and `getValues` via `forwardRef`

#### Scenario: Step 2 reuses AnimalSelector

- GIVEN the wizard is on step 2
- WHEN the animal selection step renders
- THEN it MUST render the existing `AnimalSelector` component
- AND it MUST pass `predioId`, `selected`, and `onChange` props

#### Scenario: Step 3 renders per-animal treatment results

- GIVEN the wizard is on step 3 with 3 selected animals
- WHEN the results step renders
- THEN it MUST render one card per animal
- AND each card MUST include: diagnóstico veterinario (select), medicamentos (text input), dosis (text input), próxima aplicación (date input), observaciones (text input)
- AND the diagnóstico select MUST load from `maestrosService.getAll('diagnosticos')`

#### Scenario: Form initializes defaults for new animals

- GIVEN a new animal is added to the selection
- WHEN the results step re-renders
- THEN it MUST initialize a default result object with `animalesId` and `diagnosticosVeterinariosId: 0`

### Requirement: List Page

The system MUST provide a list page at `/dashboard/servicios/veterinarios` with KPIs, table, and "Nuevo Servicio" button.

#### Scenario: Page loads with KPIs and table

- GIVEN the user navigates to `/dashboard/servicios/veterinarios`
- WHEN the page renders
- THEN it MUST display a header with title "Servicios Veterinarios"
- AND it MUST show at least one KPI card (Total Eventos)
- AND it MUST render the `ServiciosVeterinariosTable` component
- AND it MUST show a "Nuevo Servicio" button linking to `/dashboard/servicios/veterinarios/nuevo`

#### Scenario: KPIs calculate from data

- GIVEN paginated data with `total: 15`
- WHEN the KPI section renders
- THEN "Total Eventos" MUST display 15
- AND during loading, it MUST display "..."

### Requirement: Detail Page

The system MUST provide a detail page at `/dashboard/servicios/veterinarios/[id]` showing event info and animal treatment records.

#### Scenario: Page displays event information

- GIVEN a veterinary service event with ID 1 exists
- WHEN the user navigates to `/dashboard/servicios/veterinarios/1`
- THEN it MUST display: código, fecha, veterinario, # animales, observaciones (if present)
- AND it MUST show a back button to the list page

#### Scenario: Page displays animal treatment records table

- GIVEN the event has 4 animal records
- WHEN the detail page renders
- THEN it MUST show a table with columns: Animal, Diagnóstico, Medicamentos, Dosis, Próxima Aplicación, Observaciones
- AND each row MUST show `animalCodigo` and `animalNombre` in the Animal column

#### Scenario: Invalid ID shows not found

- GIVEN the URL contains a non-numeric ID
- WHEN the page loads
- THEN it MUST call `notFound()`

#### Scenario: Missing event shows error

- GIVEN the API returns a 404 for the requested ID
- WHEN the page renders
- THEN it MUST show an error message and a "Volver" button to the list page

### Requirement: Create Page

The system MUST provide a create page at `/dashboard/servicios/veterinarios/nuevo` that orchestrates the 3-step wizard.

#### Scenario: Page orchestrates wizard flow

- GIVEN the user navigates to `/dashboard/servicios/veterinarios/nuevo`
- WHEN the page renders
- THEN it MUST render `ServicioGrupalWizard` with `type="veterinario"`
- AND step 1 MUST render the veterinary event form
- AND step 2 MUST render the animal selector
- AND step 3 MUST render the per-animal treatment results

#### Scenario: Submission assembles DTO and calls mutation

- GIVEN valid data across all 3 steps
- WHEN the user clicks "Guardar Evento"
- THEN it MUST assemble a `CreateServicioVeterinarioEventoDto` with `predioId`, event fields, and animal records
- AND it MUST call `useCreateServicioVeterinario().mutateAsync(dto)`
- AND on success, the mutation handler MUST redirect to the list page

### Requirement: Barrel Exports

The system MUST update all barrel export files in the servicios module to include the new veterinary service types, hooks, components, and schemas.

#### Scenario: Module index exports veterinary types

- GIVEN the main `servicios/index.ts` barrel file
- WHEN exports are updated
- THEN it MUST export `ServicioVeterinarioAnimal`, `ServicioVeterinarioEvento`, `CreateServicioVeterinarioEventoDto`, `CreateServicioVeterinarioAnimalDto`

#### Scenario: Hooks index exports veterinary hooks

- GIVEN the `servicios/hooks/index.ts` barrel file
- WHEN exports are updated
- THEN it MUST export `useServiciosVeterinarios`, `useServicioVeterinario`, `useCreateServicioVeterinario`

#### Scenario: Components index exports veterinary components

- GIVEN the `servicios/components/index.ts` barrel file
- WHEN exports are updated
- THEN it MUST export `ServiciosVeterinariosTable`, `ServicioVeterinarioForm`, `ServicioVeterinarioEventoForm`, `ServicioVeterinarioResultadosStep`, and `ServicioVeterinarioEventoFormRef` type
