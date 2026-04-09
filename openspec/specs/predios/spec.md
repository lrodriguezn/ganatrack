# Delta Spec: Completar CRUD Sub-recursos del Predio

## Overview

Completar el frontend CRUD para los 4 sub-recursos del Predio (Potreros, Sectores, Lotes, Grupos) replicando el patrón funcional del módulo de Predios. Backend, shared types y componentes base ya existen.

---

## Functional Requirements

### Potreros

| ID | Requirement | Priority |
|----|-------------|----------|
| SR-001 | Tabla de Potreros con acciones: botón "Nuevo Potrero", onRowClick a detalle, onEdit, onDelete | Must |
| SR-002 | Detalle de Potrero: header con nombre, grid de campos (nombre, hectáreas, capacidad, estado), botones Editar/Eliminar | Must |
| SR-003 | Formulario crear/editar Potrero: RHF + Zod, campos según `CreatePotreroSchema`/`UpdatePotreroSchema`, redirect on success | Must |
| SR-004 | Hooks de mutación: `useCreatePotrero`, `useUpdatePotrero`, `useDeletePotrero` con cache invalidation de queryKey `['potreros', predioId]` | Must |

### Sectores

| ID | Requirement | Priority |
|----|-------------|----------|
| SR-005 | Tabla de Sectores con acciones: botón "Nuevo Sector", onRowClick, onEdit, onDelete | Must |
| SR-006 | Detalle de Sector: header, campos, botones Editar/Eliminar | Must |
| SR-007 | Formulario crear/editar Sector: RHF + Zod, redirect on success | Must |
| SR-008 | Hooks de mutación: `useCreateSector`, `useUpdateSector`, `useDeleteSector` con cache invalidation | Must |

### Lotes

| ID | Requirement | Priority |
|----|-------------|----------|
| SR-009 | Tabla de Lotes con acciones: botón "Nuevo Lote", onRowClick, onEdit, onDelete | Must |
| SR-010 | Detalle de Lote: header, campos, botones Editar/Eliminar | Must |
| SR-011 | Formulario crear/editar Lote: RHF + Zod, redirect on success | Must |
| SR-012 | Hooks de mutación: `useCreateLote`, `useUpdateLote`, `useDeleteLote` con cache invalidation | Must |

### Grupos

| ID | Requirement | Priority |
|----|-------------|----------|
| SR-013 | Tabla de Grupos con acciones: botón "Nuevo Grupo", onRowClick, onEdit, onDelete | Must |
| SR-014 | Detalle de Grupo: header, campos, botones Editar/Eliminar | Must |
| SR-015 | Formulario crear/editar Grupo: RHF + Zod, redirect on success | Must |
| SR-016 | Hooks de mutación: `useCreateGrupo`, `useUpdateGrupo`, `useDeleteGrupo` con cache invalidation | Must |

### Cross-cutting

| ID | Requirement | Priority |
|----|-------------|----------|
| SR-017 | Barrel export actualizado: `hooks/index.ts` exporta los 16 nuevos hooks | Must |
| SR-018 | Components index actualizado: exporta los 4 nuevos detail components | Must |
| SR-019 | Breadcrumbs correctos en todas las páginas: Predios > [Predio] > [Sub-recurso] > [Detalle] | Should |
| SR-020 | DeleteModal reutilizado para confirmación de eliminación en todas las vistas | Must |

---

## Scenarios

### Potreros

#### Scenario: Crear nuevo Potrero desde la lista del Predio

```gherkin
Given el usuario está en /dashboard/predios/1/potreros
And la tabla muestra 3 potreros existentes
When hace click en "Nuevo Potrero"
Then se navega a /dashboard/predios/1/potreros/nuevo
And se muestra el formulario vacío de Potrero
When completa "nombre" con "Potrero Norte"
And completa "hectareas" con "50"
And completa "capacidadMaxima" con "100"
And hace click en "Guardar"
Then se ejecuta useCreatePotrero con {nombre: "Potrero Norte", hectareas: 50, capacidadMaxima: 100}
And la queryKey ['potreros', 1] se invalida
And se redirige a /dashboard/predios/1/potreros
And el nuevo Potrero aparece en la tabla
```

#### Scenario: Ver detalle de Potrero

```gherkin
Given el usuario está en /dashboard/predios/1/potreros
And la tabla muestra el Potrero "Potrero Norte" con id=5
When hace click en la fila del Potrero "Potrero Norte"
Then se navega a /dashboard/predios/1/potreros/5
And se muestra el componente PotreroDetail con:
  | Campo       | Valor           |
  | Nombre      | Potrero Norte   |
  | Hectáreas   | 50              |
  | Capacidad   | 100             |
  | Estado      | Activo          |
And se muestran botones "Editar" y "Eliminar"
```

#### Scenario: Editar Potrero existente

```gherkin
Given el usuario está en /dashboard/predios/1/potreros/5 (detalle)
When hace click en "Editar"
Then se navega a /dashboard/predios/1/potreros/5/edit
And el formulario muestra los datos actuales del Potrero
When cambia "nombre" a "Potrero Sur"
And hace click en "Guardar"
Then se ejecuta useUpdatePotrero(5, {nombre: "Potrero Sur"})
And la queryKey ['potreros', 1] se invalida
And se redirige a /dashboard/predios/1/potreros/5
And el detalle muestra "Potrero Sur"
```

#### Scenario: Eliminar Potrero con confirmación

```gherkin
Given el usuario está en /dashboard/predios/1/potreros/5 (detalle)
When hace click en "Eliminar"
Then aparece DeleteModal con mensaje "¿Eliminar Potrero 'Potrero Norte'?"
When confirma la eliminación
Then se ejecuta useDeletePotrero(5)
And la queryKey ['potreros', 1] se invalida
And se redirige a /dashboard/predios/1/potreros
And el Potrero "Potrero Norte" ya no aparece en la tabla
```

#### Scenario: Eliminar Potrero desde la tabla

```gherkin
Given el usuario está en /dashboard/predios/1/potreros (lista)
When hace click en el icono de eliminar de la fila "Potrero Norte"
Then aparece DeleteModal
When confirma
Then se ejecuta useDeletePotrero(5)
And la tabla se actualiza sin "Potrero Norte"
```

### Sectores, Lotes, Grupos

> Los escenarios para Sectores, Lotes y Grupos son idénticos a los de Potreros,
> sustituyendo "Potrero" por "Sector"/"Lote"/"Grupo" y las rutas correspondientes:
> - Sectores: `/dashboard/predios/[id]/sectores/...`
> - Lotes: `/dashboard/predios/[id]/lotes/...`
> - Grupos: `/dashboard/predios/[id]/grupos/...`

---

## Non-Functional Requirements

### Performance
- Mutation hooks usan `staleTime: 5 * 60 * 1000` (5 minutos) consistente con hooks de query existentes
- No optimistic updates (simplicidad > performance para operaciones infrecuentes)

### UX
- Confirmación antes de eliminar en TODAS las vistas (tabla y detalle)
- Breadcrumbs navegables en todas las páginas
- Botón "Volver" en páginas de detalle y edición
- Loading states durante mutaciones
- Error handling con toast/notificación

### Navigation
- Desde lista: onRowClick → detalle, onEdit → edit, onDelete → modal
- Desde detalle: Editar → edit, Eliminar → modal, Volver → lista
- Desde edit: Guardar → detalle, Cancelar → detalle
- Desde nuevo: Guardar → lista, Cancelar → lista

### Code Quality
- TypeScript estricto, sin `any`
- Props interfaces explícitas
- Barrel exports actualizados
- Patrón consistente con módulo de Predios

---

## Acceptance Criteria

- [ ] AC-001: Los 4 sub-recursos tienen flujo Tabla → Crear → Detalle → Editar → Eliminar funcionando
- [ ] AC-002: Las 4 tablas de lista global tienen botón "Nuevo" y handlers onEdit/onDelete/onRowClick
- [ ] AC-003: Los 12 hooks de mutación invalidan correctamente la cache después de operaciones CRUD
- [ ] AC-004: Los 4 componentes de detalle muestran campos y botones de acción
- [ ] AC-005: Las 12 páginas de routing navegan correctamente (crear/detalle/editar)
- [ ] AC-006: DeleteModal aparece antes de eliminar en todas las vistas
- [ ] AC-007: Barrel exports actualizados en hooks/index.ts y components/index.ts
- [ ] AC-008: Navegación consistente: lista → detalle → editar → lista funciona para los 4 sub-recursos
