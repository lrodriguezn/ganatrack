## Task Breakdown: F3-SERVICIOS

35 archivos nuevos, 1 modificado. Orden: Types → QueryKeys → Service+Mock → Hooks → Components → Wizard+Forms → Pages

### Fase 1: Fundación Tipada
- [ ] 1.1 modules/servicios/types/servicios.types.ts
- [ ] 1.2 modules/servicios/schemas/palpacion.schema.ts
- [ ] 1.3 modules/servicios/schemas/inseminacion.schema.ts
- [ ] 1.4 modules/servicios/schemas/parto.schema.ts

### Fase 2: Infraestructura Compartida
- [ ] 2.1 shared/lib/query-keys.ts — agregar namespace servicios

### Fase 3: Services + Mock
- [ ] 3.1 services/servicios.service.ts (interface + factory)
- [ ] 3.2 services/servicios.mock.ts (seed data)
- [ ] 3.3 services/servicios.api.ts (stub)
- [ ] 3.4 services/index.ts

### Fase 4: Hooks
- [ ] 4.1 hooks/use-palpaciones.ts, use-palpacion.ts, use-create-palpacion.ts
- [ ] 4.2 hooks/use-inseminaciones.ts, use-create-inseminacion.ts
- [ ] 4.3 hooks/use-partos.ts, use-create-parto.ts
- [ ] 4.4 hooks/index.ts

### Fase 5: Componentes Compartidos
- [ ] 5.1 components/animal-selector.tsx
- [ ] 5.2 components/palpaciones-table.tsx
- [ ] 5.3 components/inseminaciones-table.tsx
- [ ] 5.4 components/partos-table.tsx
- [ ] 5.5 components/index.ts

### Fase 6: Wizard + Formularios
- [ ] 6.1 components/servicio-grupal-wizard.tsx
- [ ] 6.2 components/palpacion-form.tsx
- [ ] 6.3 components/inseminacion-form.tsx
- [ ] 6.4 components/parto-form.tsx

### Fase 7: Pages App Router
- [ ] 7.1 app/dashboard/servicios/palpaciones/page.tsx
- [ ] 7.2 app/dashboard/servicios/palpaciones/nuevo/page.tsx
- [ ] 7.3 app/dashboard/servicios/palpaciones/[id]/page.tsx
- [ ] 7.4 app/dashboard/servicios/inseminaciones/page.tsx
- [ ] 7.5 app/dashboard/servicios/inseminaciones/nuevo/page.tsx
- [ ] 7.6 app/dashboard/servicios/inseminaciones/[id]/page.tsx
- [ ] 7.7 app/dashboard/servicios/partos/page.tsx
- [ ] 7.8 app/dashboard/servicios/partos/nuevo/page.tsx

### Fase 8: Barrel
- [ ] 8.1 modules/servicios/index.ts

**Total: 24 tareas, ~35 archivos**
