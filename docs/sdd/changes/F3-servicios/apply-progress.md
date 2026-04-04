**What**: Implementación completa del módulo F3-SERVICIOS (palpaciones, inseminaciones, partos) en el frontend
**Why**: El módulo estaba especificado en PRDs pero no implementado
**Where**: apps/web/src/modules/servicios/, apps/web/src/app/dashboard/servicios/, apps/web/src/shared/lib/query-keys.ts
**Learned**: 
- Palpaciones e inseminaciones son eventos grupales (wizard 3 pasos), partos son registros individuales (formulario simple)
- PaginationParams necesita cast a Record<string, unknown> para queryKeys
- Wizard state se maneja en page (useState), no en componente wizard
- Mock data con 5 palpaciones, 5 inseminaciones, 10 partos realistas
- 0 errores TypeScript en el módulo al compilar
- Error de tipos: `diagnosticosVeterinariosId` debe ser opcional (`?`) tanto en DTO como en interface
- Event handlers en React necesitan cast con `as unknown as { value: string }` para acceder a `.value`
