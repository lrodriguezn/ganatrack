# Proposal: Módulo Predios (F2-PREDIOS)

## Intent

Implementar el módulo completo de Predios con CRUD para predios y sus sub-recursos (potreros, sectores, lotes, grupos). Este módulo es core del sistema ganadero — sin predios no hay contexto para animales, servicios ni reportes. Actualmente solo existe el store Zustand (`predio.store.ts`) y el selector en el header, pero no hay páginas, formularios ni capa de servicios.

## Scope

### In Scope
- **Predios CRUD completo**: listado con DataTable, formulario (crear/editar), detalle con tabs
- **Sub-recursos CRUD**: Potreros, Sectores, Lotes, Grupos — cada uno con tabla y formulario (inline o modal)
- **Service layer**: `predios.service.ts` (interface + factory), `predios.mock.ts`, `predios.api.ts` — siguiendo patrón auth
- **Hooks TanStack Query**: `usePredios`, `usePredio`, `useCreatePredio`, `useUpdatePredio`, `useDeletePredio`, `usePotreros`, `useLotes`, `useGrupos`, `useSectores`
- **Páginas App Router**: listado, detalle, crear nuevo, sub-recursos
- **Schemas Zod**: potrero, lote, grupo, sector — extender `@ganatrack/shared-types`
- **Todo con datos mock** — sin backend real

### Out of Scope
- Integración con API real (backend Fastify no existe aún)
- Permisos granulares por predio (se asume acceso completo)
- Mapas/visualización geográfica de predios
- Importación/exportación masiva de datos
- Notificaciones relacionadas a predios

## Capabilities

### New Capabilities
- `predios-crud`: CRUD completo de predios (listado, detalle, crear, editar, eliminar)
- `predios-potreros`: CRUD de potreros dentro de un predio
- `predios-sectores`: CRUD de sectores dentro de un predio
- `predios-lotes`: CRUD de lotes dentro de un predio
- `predios-grupos`: CRUD de grupos dentro de un predio

### Modified Capabilities
- None — todas las capabilities son nuevas

## Approach

Arquitectura modular siguiendo el patrón establecido en `modules/auth/`:

```
modules/predios/
├── components/
│   ├── predio-table.tsx        # DataTable wrapper con columnas
│   ├── predio-form.tsx         # RHF + Zod (crear/editar)
│   ├── predio-detail.tsx       # Vista detalle con tabs
│   ├── potreros-table.tsx      # Sub-recurso tabla
│   ├── potrero-form.tsx        # Sub-recurso formulario
│   ├── lotes-table.tsx
│   ├── lote-form.tsx
│   ├── grupos-table.tsx
│   └── grupo-form.tsx
├── hooks/
│   ├── use-predios.ts          # TanStack Query list
│   ├── use-predio.ts           # TanStack Query detail
│   ├── use-create-predio.ts
│   ├── use-update-predio.ts
│   ├── use-delete-predio.ts
│   ├── use-potreros.ts
│   ├── use-lotes.ts
│   └── use-grupos.ts
├── services/
│   ├── predios.service.ts      # Interface + factory
│   ├── predios.mock.ts         # Mock data + MockPrediosService
│   └── predios.api.ts          # Real API (placeholder)
└── schemas/
    └── index.ts                # Re-export de shared-types schemas

app/dashboard/predios/
├── page.tsx                    # Listado de predios
├── [id]/
│   └── page.tsx                # Detalle con tabs (info, potreros, lotes, grupos)
├── nuevo/
│   └── page.tsx                # Crear nuevo predio
├── potreros/
│   └── page.tsx                # Listado global potreros
├── sectores/
│   └── page.tsx
├── lotes/
│   └── page.tsx
└── grupos/
    └── page.tsx
```

**Decisiones clave:**
- Sub-recursos se renderizan como tabs en página de detalle del predio (UX coherente)
- Cada sub-recurso también tiene su propia ruta para acceso directo desde sidebar
- Mock service almacena datos en memoria con seed data realista
- Integración con `predio.store.ts` existente — al crear/eliminar predios, actualizar store

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/shared-types/src/` | New | Schemas Zod para Potrero, Lote, Grupo, Sector |
| `apps/web/src/modules/predios/` | New | Módulo completo (components, hooks, services) |
| `apps/web/src/app/dashboard/predios/` | New | Páginas App Router |
| `apps/web/src/store/predio.store.ts` | Modified | Integrar actualizaciones de CRUD |
| `apps/web/src/shared/lib/query-keys.ts` | Modified | Agregar key factories para sub-recursos |
| `apps/web/src/shared/lib/navigation.config.ts` | None | Ya configurado con rutas predios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Schemas de sub-recursos no definidos en PRD | High | Derivar de estructura típica ganadera + feedback del usuario |
| Mock data inconsistente entre sesiones | Med | Seed data con IDs fijos, reset en cada carga |
| Complejidad de tabs en detalle de predio | Med | Empezar con tabs simples, iterar |

## Rollback Plan

Eliminar el directorio `apps/web/src/modules/predios/` y las páginas en `apps/web/src/app/dashboard/predios/`. Los schemas nuevos en `shared-types` son aditivos — no rompen nada existente. Revertir cambios en `predio.store.ts` y `query-keys.ts` si se modificaron.

## Dependencies

- `@ganatrack/shared-types` (PredioSchema ya existe)
- `predio.store.ts` (Zustand store existente)
- `query-keys.ts` con predios factory (ya existe)
- Componentes UI: DataTable, Modal, FormField, Input, Pagination (todos listos)
- RHF + Zod (dependencias ya instaladas en template)

## Success Criteria

- [ ] Listado de predios con DataTable funcional (paginación, búsqueda, filtros)
- [ ] Crear/editar predio con formulario validado (RHF + Zod)
- [ ] Detalle de predio con tabs para sub-recursos
- [ ] CRUD de potreros, lotes, grupos funcional
- [ ] Todos los datos mock con seed realista
- [ ] Dark mode soportado en todas las páginas
- [ ] Strings en español
- [ ] Patrón service/hook consistente con módulo auth
