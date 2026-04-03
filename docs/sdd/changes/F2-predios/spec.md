# Delta Specs: predios Module

## ADDED Requirements

### Requirement: Predios List Display
The system MUST display a paginated DataTable of farms with name search. The table MUST show columns: Nombre, Departamento, Municipio, Hectáreas, Tipo, and action buttons.

#### Scenario: List predios with pagination
- GIVEN the user navigates to "/dashboard/predios"
- WHEN the page loads
- THEN a DataTable displays with columns: Nombre, Departamento, Municipio, Hectáreas, Tipo
- AND pagination controls show total count and current page
- AND each row has Edit and Delete action buttons

#### Scenario: Search predios by name
- GIVEN the user is on the predios list page
- WHEN the user types in the search input
- THEN the table filters to show only predios whose nombre contains the search term
- AND pagination updates to reflect filtered results

---

### Requirement: Create Predio
The system MUST provide a form to create a new Predio with fields: nombre (required, max 100 chars), departamento (required), municipio (required), vereda (optional), hectáreas (required, positive number), tipo (required, enum: lechería/cría/doble propósito/engorde).

#### Scenario: Create new predio successfully
- GIVEN the user clicks "Nuevo Predio" button
- WHEN the user fills all required fields and submits
- THEN form validates against Zod schema
- AND on success, new Predio appears in the list
- AND user is redirected to the detail page

#### Scenario: Create predio validation error
- GIVEN the user is on the create Predio form
- WHEN user submits with missing required fields
- THEN inline validation errors display below each invalid field
- AND no API call is made until all fields are valid

---

### Requirement: Edit Predio
The system MUST provide a pre-populated form to edit an existing Predio, preserving the Predio ID on submit.

#### Scenario: Edit predio with valid data
- GIVEN the user clicks Edit on a Predio row
- WHEN the user modifies fields and submits
- THEN the form validates and updates the Predio
- AND the user sees the updated data in the list

---

### Requirement: Delete Predio
The system MUST remove a Predio from the list after user confirmation via a modal dialog.

#### Scenario: Delete primario with confirmation
- GIVEN the user clicks Delete on a Predio row
- WHEN the confirmation modal appears and user confirms
- THEN the Predio is removed from the list
- AND a success message displays

#### Scenario: Delete primario cancellation
- GIVEN the user clicks Delete on a Predio row
- WHEN the confirmation modal appears and user cancels
- THEN no changes are made and the modal closes

---

### Requirement: Potreros List per Predio
The system MUST display a list of paddocks belonging to a specific Predio with columns: Nombre, Hectáreas, Tipo Pasto, Capacidad, Estado.

#### Scenario: View potreros for a Predio
- GIVEN the user is on a Predio detail page, Potreros tab
- WHEN the tab loads
- THEN a table displays all potreros for that Predio
- AND each row has Edit and Delete action buttons

---

### Requirement: Create Potrero
The system MUST provide a form to add a Potrero with fields: nombre (required), hectáreas (required, positive number), tipo_pasto (required), capacidad_animales (required, positive integer), estado (required, enum: activo/en_descanso).

#### Scenario: Create potrero successfully
- GIVEN the user is on the Potreros section
- WHEN the user fills the form and submits
- THEN the new Potrero is created and appears in the list

---

### Requirement: Lotes List per Predio
The system MUST display production lots for a Predio with columns: Nombre, Descripción, Tipo (producción/levante/engorde/cría).

#### Scenario: View lotes for a Predio
- GIVEN the user is on a Predio detail page, Lotes tab
- WHEN the tab loads
- THEN a table displays all lotes for that Predio

---

### Requirement: Grupos List per Predio
The system MUST display custom animal groups for a Predio with columns: Nombre, Descripción, Animal Count.

#### Scenario: View grupos for a Predio
- GIVEN the user is on a Predio detail page, Grupos tab
- WHEN the tab loads
- THEN a table displays all grupos for that Predio

---

### Requirement: Assign/Remove Animales from Grupo
The system MUST allow adding and removing animales from a Grupo via a selection interface.

#### Scenario: Add animal to grupo
- GIVEN the user is on a Grupo edit interface
- WHEN the user selects an animal and confirms assignment
- THEN the animal is associated with the Grupo
- AND the group's animal count updates

#### Scenario: Remove animal from grupo
- GIVEN the user is on a Grupo edit interface
- WHEN the user clicks remove on an assigned animal
- THEN the animal is disassociated from the Grupo
- AND the group's animal count updates

---

### Requirement: Predios Service Layer
The system MUST provide a `PrediosService` interface with CRUD methods for predios and sub-recursos. The mock implementation MUST return data after a 300-500ms simulated delay.

#### Scenario: Service returns mock data with delay
- GIVEN the service is called
- WHEN a method is invoked
- THEN the mock implementation returns data after a 300-500ms delay
- AND data matches the expected Zod schema

---

### Requirement: TanStack Query Hooks
The system MUST provide React Query hooks: `usePredios(params)`, `usePredio(id)`, `useCreatePredio()`, `useUpdatePredio()`, `useDeletePredio()`, `usePotreros(predioId)`, `useLotes(predioId)`, `useGrupos(predioId)`.

#### Scenario: usePredios returns query state
- GIVEN the component mounts with `usePredios({ page: 1, search: '' })`
- WHEN the query fetches
- THEN it returns `{ data, isLoading, error, pageCount, totalCount }`

---

## Acceptance Criteria Checklist

- [ ] Listado de predios con DataTable funcional (paginación, búsqueda, filtros)
- [ ] Crear/editar predio con formulario validado (RHF + Zod)
- [ ] Detalle de predio con tabs para sub-recursos
- [ ] CRUD de potreros, lotes, grupos funcional
- [ ] Todos los datos mock con seed realista
- [ ] Dark mode soportado en todas las páginas
- [ ] Strings en español
- [ ] Patrón service/hook consistente con módulo auth
