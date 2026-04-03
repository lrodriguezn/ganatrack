# Proposal: F3-SERVICIOS (Palpaciones, Inseminaciones, Partos)

## Intent

Implementar el módulo completo de servicios reproductivos en el frontend GanaTrack. El módulo `servicios/` no existe aún — las rutas están definidas en `navigation.config.ts` pero las páginas y lógica están ausentes. El negocio necesita registrar eventos grupales (palpaciones, inseminaciones) y eventos individuales (partos) con sus animales y resultados asociados.

## Scope

### In Scope
- Módulo `apps/web/src/modules/servicios/` completo (types, schemas, services, hooks, components)
- 8 páginas App Router en `apps/web/src/app/dashboard/servicios/`
- Wizard de 3 pasos para palpaciones e inseminaciones grupales
- Formulario individual para partos (no wizard)
- `AnimalSelector` reutilizable con filtro por sexo/estado
- Tablas con `DataTable` shared component para las 3 entidades
- Extensión de `queryKeys` en `shared/lib/query-keys.ts`
- Mock service con seed data + delay(300) (sin backend real)

### Out of Scope
- Backend / API real — solo mock
- Módulo veterinarios (ya existe en maestros)
- Edición/eliminación de eventos (solo crear + ver detalle)
- Exportación PDF/Excel
- Notificaciones o alertas de gestación

## Capabilities

### New Capabilities
- `servicios-palpaciones`: Registro y listado de eventos grupales de palpación con resultados por animal
- `servicios-inseminaciones`: Registro y listado de eventos grupales de inseminación
- `servicios-partos`: Registro y listado de partos individuales con crías

### Modified Capabilities
- `shared-query-keys`: Agregar namespace `servicios.*` al objeto queryKeys existente

## Approach

1. **Types + Schemas** — Definir `EventoGrupalBase`, `PalpacionAnimalResult`, `InseminacionAnimalResult`, `Parto` + Zod schemas por formulario
2. **Service + Mock** — Interface + Factory pattern (igual a `animal.service.ts`). Mock con 5 seed events por entidad, delay(300)
3. **Query keys** — Extender `shared/lib/query-keys.ts` con `servicios: { palpaciones, inseminaciones, partos }`
4. **Hooks** — `useQuery` list/detail + `useMutation` create por entidad (9 hooks total)
5. **Componentes compartidos** — `AnimalSelector` (reutiliza `animalService`, filtra hembras activas), tablas x3
6. **Wizard + Forms** — `ServicioGrupalWizard` con useState local en page (3 pasos), `PalpacionForm`, `InseminacionForm`, `PartoForm`
7. **Pages** — 8 páginas App Router con `usePredioStore()` para predioId

Orden de entidades: Palpaciones (más complejo, establece patrón) → Inseminaciones (mismo patrón) → Partos (flujo diferente, form simple).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/servicios/` | New | Módulo completo (~30 archivos) |
| `apps/web/src/app/dashboard/servicios/` | New | 8 páginas App Router |
| `apps/web/src/shared/lib/query-keys.ts` | Modified | Agregar namespace servicios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Estado del wizard perdido al navegar entre pasos | Med | useState levantado en page (no router), sin redirección entre pasos |
| Duplicación de lógica de animales | Low | AnimalSelector usa `animalService` existente sin copiar |
| Confusión grupal vs individual en UI | Med | Dos flujos claramente separados: wizard (grupal) vs form simple (partos) |
| condiciones-corporales acoplado a configuración | Low | Importar `catalogoService` directamente, sin duplicar |

## Rollback Plan

El módulo es completamente nuevo y aislado. No modifica funcionalidad existente excepto `query-keys.ts`. Para revertir:
1. Eliminar `apps/web/src/modules/servicios/`
2. Eliminar `apps/web/src/app/dashboard/servicios/`
3. Revertir el diff en `shared/lib/query-keys.ts`

Las rutas en `navigation.config.ts` ya existen y apuntarán a 404 — sin impacto en otras secciones.

## Dependencies

- `maestrosService.getAll('veterinarios')` ✅ existente
- `maestrosService.getAll('diagnosticos')` ✅ existente
- `catalogoService.getAll('condiciones-corporales')` ✅ existente
- `animalService` ✅ existente
- `usePredioStore().predioActivo` ✅ existente
- `queryKeys.servicios.*` ❌ pendiente (parte de este cambio)

## Success Criteria

- [ ] Las 3 rutas de listado cargan con datos mock sin errores de consola
- [ ] Wizard de palpación completa los 3 pasos y persiste el evento en el mock
- [ ] AnimalSelector filtra solo hembras activas correctamente
- [ ] Formulario de parto valida y crea el registro
- [ ] TypeScript sin errores (`tsc --noEmit` clean)
- [ ] Patrones de service/hook/page idénticos a módulo animales
