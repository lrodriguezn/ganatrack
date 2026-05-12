# SDD Spec: Fix Palpaciones — Diagnósticos y Condición Corporal

## Cambio

`fix-palpaciones-diagnosticos-condicion-corporal`

## Estado

**SPEC_COMPLETE** — Listo para fase de diseño

## Resumen Ejecutivo

Este documento especifica dos correcciones de infraestructura necesarias para que el formulario de palpaciones funcione correctamente:

1. **Seed data para diagnósticos veterinarios**: La tabla `diagnosticos_veterinarios` está vacía en la base de datos. Se requiere sembrar 6 registros básicos (Positiva, Negativa, Desparasitación, Vacunación, Vitaminas, Tratamiento) para que el dropdown del formulario de palpaciones tenga opciones.

2. **Ruta API para condiciones corporales**: La ruta GET `/api/v1/config/condiciones-corporales` no está registrada en el router de configuración. Se requiere registrar esta ruta para que el frontend pueda consultar las opciones de condición corporal.

Ambas correcciones siguen patrones existentes en el código y son de baja complejidad. TDD obligatorio.

---

## Spec 1: Diagnósticos Seed Data

**Area**: `packages/database/seed.ts`

### GIVEN

- La base de datos tiene las tablas creadas
- La tabla `diagnosticos_veterinarios` existe con la estructura definida (id, nombre, descripcion, categoria, activo, createdAt, updatedAt)

### WHEN

- Se ejecuta el script de seed: `pnpm seed` o equivalente

### THEN

- La tabla `diagnosticos_veterinarios` contiene al menos 6 registros
- Cada registro tiene los campos: id (1-6), nombre, categoria, activo = 1
- Los nombres esperados son: Positiva, Negativa, Desparasitación, Vacunación, Vitaminas, Tratamiento
- El seed es idempotente (al volver a ejecutar no duplica registros usando `ON CONFLICT DO NOTHING`)

### Criteria de Éxito

- [ ] Al ejecutar seed, la tabla tiene exactamente 6 registros de diagnósticos activos
- [ ] Al volver a ejecutar seed, no se duplican los registros (idempotencia verificada)

---

## Spec 2: API Retorna Diagnósticos

**Area**: `apps/api/src/modules/maestros/infrastructure/http/routes/maestros.routes.ts`

### GIVEN

- La base de datos tiene los datos sembrados de diagnósticos (Spec 1)
- El servidor API está en ejecución
- Existe un token de autenticación válido

### WHEN

- Se llama a `GET /api/v1/maestros/diagnosticos` con headers de autenticación válidos

### THEN

- El servidor responde con código HTTP 200
- El response tiene estructura `{ success: true, data: [...], meta: {...} }`
- El array `data` contiene al menos 2 entradas
- Cada entrada tiene: `id`, `nombre`, `categoria`, `activo`

### Criteria de Éxito

- [ ] GET /diagnosticos retorna 200 con datos válidos
- [ ] Los campos id, nombre, categoria están presentes en cada registro

---

## Spec 3: Ruta de Condiciones Corporales — GET All

**Area**: `apps/api/src/modules/configuracion/infrastructure/http/routes/configuracion.routes.ts`

### GIVEN

- La base de datos tiene sembrada la tabla `config_condiciones_corporales` (ya existe en seed.ts líneas 94-101)
- Existe un token de autenticación válido
- El use case `ListConfigCondicionesCorporalesUseCase` está disponible

### WHEN

- Se llama a `GET /api/v1/config/condiciones-corporales` con headers de autenticación válidos

### THEN

- El servidor responde con código HTTP 200
- El response tiene estructura `{ success: true, data: [...], meta: {...} }`
- El array `data` contiene exactamente 5 entradas
- Cada entrada tiene: `id`, `nombre`, `valorMin`, `valorMax`, `descripcion`, `activo`
- Los nombres de las 5 condiciones son: Muy delgado, Delgado, Ideal, Gordo, Muy gordo

### Criteria de Éxito

- [ ] La ruta /condiciones-corporales está registrada en el router de configuración
- [ ] GET retorna las 5 condiciones corporales con datos válidos
- [ ] Cada registro tiene todos los campos requeridos del schema

---

## Spec 4: Ruta de Condiciones Corporales — GET by ID

**Area**: `apps/api/src/modules/configuracion/infrastructure/http/routes/configuracion.routes.ts`

### GIVEN

- Las 5 condiciones corporales existen en la base de datos
- Existe un token de autenticación válido

### WHEN

- Se llama a `GET /api/v1/config/condiciones-corporales/:id` con un ID válido (ej: 3)

### THEN

- El servidor responde con código HTTP 200
- El response tiene estructura `{ success: true, data: {...} }`
- El objeto `data` contiene los campos: id, nombre, valorMin, valorMax, descripcion, activo
- El ID en el response corresponde al ID solicitado

### Criteria de Éxito

- [ ] GET /condiciones-corporales/:id retorna el registro específico
- [ ] Los datos retornados coinciden con el ID solicitado

---

## Spec 5: Frontend Carga Ambos Catálogos

**Area**: `apps/web` — Palpación Wizard / Formulario

### GIVEN

- El servidor API está ejecutándose con los datos sembrados (Specs 1 y 3)
- La aplicación web tiene el formulario de palpaciones configurado

### WHEN

- El usuario avanza al paso 3 del wizard de palpaciones (selección de diagnóstico y condición corporal)

### THEN

- El dropdown de Diagnóstico muestra al menos 2 opciones cargadas desde la API
- El dropdown de Condición Corporal muestra las 5 opciones (Muy delgado a Muy gordo)
- Las opciones se cargan sin errores en consola

### Criteria de Éxito

- [ ] El componente de palpaciones recibe los datos de diagnósticos
- [ ] El componente recibe los datos de condiciones corporales
- [ ] Ambos dropdowns renderizan las opciones correctamente

---

## Spec 6: Regression — Tests Existentes Pasan

**Area**: `apps/api` y `apps/web`

### GIVEN

- Los cambios de Spec 1-4 están aplicados al código
- Existe suite de tests existente

### WHEN

- Se ejecutan los tests: `pnpm test` en ambos paquetes

### THEN

- Todos los tests existentes pasan (código 0)
- No hay nuevos errores de lint
- No hay errores de TypeScript

### Criteria de Éxito

- [ ] `pnpm --filter @ganatrack/api test` pasa sin errores
- [ ] `pnpm --filter @ganatrack/web test` pasa sin errores
- [ ] `pnpm build` compila sin errores

---

## Notas de Implementación

### Diagnósticos Seed

```typescript
// Agregar a packages/database/seed.ts después de las importaciones
await db.insert(diagnosticosVeterinarios).values([
  { id: 1, nombre: 'Positiva', categoria: 'Gestación', activo: 1 },
  { id: 2, nombre: 'Negativa', categoria: 'Gestación', activo: 1 },
  { id: 3, nombre: 'Desparasitación', categoria: 'Tratamiento', activo: 1 },
  { id: 4, nombre: 'Vacunación', categoria: 'Preventivo', activo: 1 },
  { id: 5, nombre: 'Vitaminas', categoria: 'Suplementación', activo: 1 },
  { id: 6, nombre: 'Tratamiento', categoria: 'Médico', activo: 1 },
]).onConflictDoNothing()
```

### Ruta Condiciones Corporales

```typescript
// Agregar a configuracion.routes.ts
// Importar el use case
import { ListConfigCondicionesCorporalesUseCase } from '../../../application/use-cases/list-config-condiciones-corporales.use-case.js'
import { GetConfigCondicionCorporalUseCase } from '../../../application/use-cases/get-config-condicion-corporal.use-case.js'

// En registerConfiguracionRoutes:
const listCondicionesCorpUseCase = new ListConfigCondicionesCorporalesUseCase(condicionCorpRepo)
const getCondicionCorpUseCase = new GetConfigCondicionCorporalUseCase(condicionCorpRepo)

// Agregar rutas
app.get<ListQuery>('/condiciones-corporales', { ... }, async (request, reply) => { ... })
app.get<IdParams>('/condiciones-corporales/:id', { ... }, async (request, reply) => { ... })
```

---

## Artefactos

| Artefacto | Ruta | Estado |
|-----------|-----|--------|
| Proposal | `openspec/changes/fix-palpaciones-diagnosticos-condicion-corporal/proposal.md` | ✅ Existe |
| Spec (este documento) | `openspec/changes/fix-palpaciones-diagnosticos-condicion-corporal/spec.md` | 📝 Creado |
| Design | `openspec/changes/fix-palpaciones-diagnosticos-condicion-corporal/design.md` | ⏳ Pendiente |
| Tasks | `openspec/changes/fix-palpaciones-diagnosticos-condicion-corporal/tasks.md` | ⏳ Pendiente |

---

## Siguiente Paso Recomendado

Pasar a fase de **diseño técnico** (sdd-design):

- Confirmar IDs exactos para los diagnósticos
- Verificar que use case GetConfigCondicionCorporal existe o crear si no existe
- Documentar estructura de respuesta exacta

---

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| ID mismatch con datos mock existentes | Baja | Usar IDs 1-6 siguiendo proposal |
| Use case GET por ID para condiciones no existe | Media | Crear use case siguiendo patrón existente |
| Tests de regresión fallan | Baja | Correr tests antes de implementar |

---

## Dependencias Externas

- `diagnosticosVeterinarios` schema ya existe en `packages/database/src/schema/maestros.ts`
- `configCondicionesCorporales` ya está sembrado en seed.ts líneas 94-101
- `ListConfigCondicionesCorporalesUseCase` ya existe
- Rutas GET /diagnosticos ya registradas en maestros.routes.ts líneas 316-356