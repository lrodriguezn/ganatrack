## Exploration: F3-SERVICIOS (Palpaciones, Inseminaciones, Partos)

### Current State
El módulo `servicios/` NO existe aún en `apps/web/src/modules/` ni en `apps/web/src/app/dashboard/servicios/`.
Las rutas ya están definidas en `navigation.config.ts` para palpaciones, inseminaciones, partos y veterinarios.
Los query keys de servicios están documentados en el PRD pero NO implementados en `shared/lib/query-keys.ts`.

### Affected Areas
- `apps/web/src/modules/servicios/` — crear desde cero (no existe)
- `apps/web/src/app/dashboard/servicios/` — crear páginas App Router (no existen)
- `apps/web/src/shared/lib/query-keys.ts` — agregar `servicios` al objeto queryKeys
- `apps/web/src/modules/maestros/` — ya tiene veterinarios, diagnosticos como catálogos
- `apps/web/src/modules/configuracion/` — ya tiene condiciones-corporales (necesario para palpaciones)

### Artefactos a Crear

#### Module structure: `apps/web/src/modules/servicios/`
- `types/servicios.types.ts` — interfaces: EventoGrupal, PalpacionAnimal, InseminacionAnimal, Parto, filtros, paginación
- `schemas/palpacion.schema.ts` — Zod: predioId, codigo, fecha, veterinariosId, animales[]
- `schemas/inseminacion.schema.ts` — Zod: mismo patrón que palpaciones
- `schemas/parto.schema.ts` — Zod: predioId, animalesId, fecha, machos, hembras, muertos, tipo_parto_key
- `services/servicios.service.ts` — interface + factory (mock/real)
- `services/servicios.mock.ts` — seed data: 5 eventos de cada tipo, animales seed (hembras)
- `services/servicios.api.ts` — RealServiciosService (stub conectado a API)
- `services/index.ts` — barrel
- `hooks/use-palpaciones.ts` — useQuery list con predioId+page+limit
- `hooks/use-palpacion.ts` — useQuery detail por id
- `hooks/use-create-palpacion.ts` — useMutation + invalidate
- `hooks/use-inseminaciones.ts` — useQuery list
- `hooks/use-create-inseminacion.ts` — useMutation
- `hooks/use-partos.ts` — useQuery list
- `hooks/use-create-parto.ts` — useMutation
- `hooks/use-wizard-state.ts` — Zustand-like local state para los 3 pasos del wizard
- `hooks/index.ts` — barrel
- `components/servicio-grupal-wizard.tsx` — 3 pasos: crear evento, agregar animales, registrar resultados
- `components/palpacion-form.tsx` — RHF+Zod: campos evento + tabla animales con resultados (diasGestacion, fechaParto condicionales)
- `components/inseminacion-form.tsx` — RHF+Zod: campos evento grupal + selector de hembras
- `components/parto-form.tsx` — RHF+Zod: animalesId, fecha, machos, hembras, muertos, tipo_parto_key
- `components/animal-selector.tsx` — búsqueda de animales filtrado por sexo (hembras para palpación/inseminación), con checkbox multi-select
- `components/palpaciones-table.tsx` — tabla con evento grupal: código, fecha, veterinario, cantidad animales, acciones
- `components/inseminaciones-table.tsx` — similar a palpaciones
- `components/partos-table.tsx` — tabla individual: animal, fecha, crías, tipo parto
- `index.ts` — barrel del módulo

#### App Router pages: `apps/web/src/app/dashboard/servicios/`
- `palpaciones/page.tsx` — listado de eventos grupales + botón "Nueva Palpación"
- `palpaciones/nuevo/page.tsx` — wizard 3 pasos para palpación grupal
- `palpaciones/[id]/page.tsx` — detalle del evento con tabla de animales y resultados
- `inseminaciones/page.tsx` — listado de eventos
- `inseminaciones/nuevo/page.tsx` — wizard para inseminación grupal
- `inseminaciones/[id]/page.tsx` — detalle
- `partos/page.tsx` — listado de partos individuales + KPIs (partos/mes, crías)
- `partos/nuevo/page.tsx` — formulario de parto individual (una sola página, no wizard)

#### Shared lib update
- `apps/web/src/shared/lib/query-keys.ts` — agregar `servicios: { palpaciones: {...}, inseminaciones: {...}, partos: {...} }`

### Patrones a Seguir (basados en módulos existentes)
1. **Service pattern**: Interface + Factory (mock/real) — igual a `animal.service.ts` y `maestros.service.ts`
2. **Mock pattern**: Clase con `delay(300)`, seed data en array en memoria, CRUD completo — igual a `animal.mock.ts`
3. **Hook pattern**: `useQuery` con `queryKeys.servicios.palpaciones.list(params)`, `staleTime: StaleTimes.LIST` — igual a `use-animales.ts`
4. **Mutation pattern**: `useMutation` + `queryClient.invalidateQueries` — igual a `use-create-animal.ts`
5. **Page pattern**: 'use client', `usePredioStore()` para predioId, KPI cards, search/filter, tabla, botón "Nuevo" — igual a `animales/page.tsx`
6. **Form pattern**: RHF + zodResolver + `FormField` + `Input` + `DatePicker` — igual a `animal-form.tsx`
7. **Table pattern**: `ColumnDef<T>[]`, `DataTable` shared component, badges con colores — igual a `animal-table.tsx`
8. **Index barrel**: re-exportar types/services/hooks/components — igual a `modules/animales/index.ts`

### Datos específicos de campos por entidad

**EventoGrupalBase** (palpaciones e inseminaciones):
- predioId: number, codigo: string, fecha: string (ISO), veterinariosId: number, observaciones?: string

**PalpacionAnimalResult** (por animal dentro del evento):
- animalesId: number, veterinariosId: number, diagnosticosVeterinariosId: number
- configCondicionesCorporalesId: number, fecha: string
- diasGestacion?: number (condicional si resultado = positivo)
- fechaParto?: string (condicional si resultado = positivo)
- comentarios?: string

**InseminacionAnimalResult** (mismo patrón):
- animalesId: number, veterinariosId: number, fecha: string
- tipoPadreKey?: number, comentarios?: string

**Parto** (evento individual, no grupal):
- predioId: number, animalesId: number, fecha: string
- machos: number, hembras: number, muertos: number
- tipoParto: 'Normal' | 'Con Ayuda' | 'Distócico' | 'Mortinato'

### Dependencias externas del módulo
- `maestrosService.getAll('veterinarios')` — para selector de veterinario en wizard
- `maestrosService.getAll('diagnosticos')` — para resultados de palpación
- `catalogoService.getAll('condiciones-corporales')` — para condición corporal en palpación
- `animalService.getAll({sexoKey: 1 (hembras), estadoAnimalKey: 0 (activos)})` — para `animal-selector.tsx`
- `usePredioStore().predioActivo.id` — requerido para todas las queries
- `queryKeys` shared lib — necesita extensión para servicios

### Riesgos
1. El wizard de 3 pasos requiere estado persistente entre pasos — usar Zustand store local o useState levantado en el page
2. `animal-selector.tsx` debe reutilizar el mismo `animalService` — no duplicar lógica
3. Los partos son eventos individuales (un animal a la vez) vs palpaciones/inseminaciones grupales — la UI es diferente: no wizard, sino form simple
4. Los catálogos de configCondicionesCorporales ya existen en módulo configuración — importar desde ahí, no duplicar

### Recomendación
Implementar en este orden:
1. Types + Schemas (fundación)
2. Service + Mock (datos)  
3. Query keys update (infraestructura)
4. Hooks (lógica)
5. Componentes compartidos (animal-selector, tablas)
6. Wizard + Formularios
7. Pages App Router

Palpaciones primero (más complejo → patrón establecido), luego inseminaciones (mismo patrón), luego partos (flujo diferente).

### Ready for Proposal
Sí. El scope está completamente claro: 3 sub-módulos, 8+ pages, ~15 artefactos de módulo, 1 update a query-keys. El wizard grupal es la pieza más compleja y requiere atención especial en el diseño de estado.
