# GanaTrack Frontend — Análisis de Faltantes

> **Fecha:** 2026-04-03
> **Alcance:** 11 módulos, 6 fases del roadmap
> **Fuente:** PRD Frontend v1.0.0 §22 (Roadmap) vs. código implementado

---

## Resumen Ejecutivo por Fase

| Fase | Descripción | Avance | Estado |
|------|-------------|--------|--------|
| **Fase 1** | Fundación (monorepo, auth, stores, infra) | ~85% | ✅ Casi completa |
| **Fase 2** | Núcleo (UI components, predios, maestros, config, animales) | ~90% | ✅ Casi completa |
| **Fase 3** | Servicios y Media (wizard, imágenes, productos) | ~85% | ✅ Casi completa |
| **Fase 4** | Reportes (dashboard, 5 reportes, export) | ~80% | ✅ Casi completa |
| **Fase 5** | Notificaciones + PWA | ~75% | ⚠️ Parcial |
| **Fase 6** | Calidad + Producción (usuarios, testing, a11y, dark mode) | ~80% | ⚠️ Parcial |

---

## Números Rápidos

| Métrica | Implementado | Requerido | Gap |
|---------|-------------|-----------|-----|
| Archivos de módulos | 162 | ~200 | ~38 archivos |
| Páginas de rutas | 42 | ~50 | ~8 rutas |
| Shared components UI | 13 | 18 | 5 componentes |
| Shared components feedback | 0 | 5 | **5 componentes** |
| Shared hooks | 3 | 7+ | **4+ hooks** |
| Stores Zustand | 8 | 8 | ✅ Completo |
| Tests unitarios | ~15 | ~40 | ~25 tests |
| Tests E2E (Playwright) | **0** | 10 | **10 flujos** |
| MSW handlers | 2 | 10+ | **8+ handlers** |
| i18n (next-intl) | **0%** | 100% | **Completo** |
| PWA funcional | ~30% | 100% | ~70% |
| Dark mode | ~60% | 100% | ~40% |

---

## 🔴 Crítico — Bloquea funcionalidad

### 1. Shared Components: Feedback (directorio completo vacío)

| Componente | Uso |
|------------|-----|
| `toast-provider.tsx` | Notificaciones globales de éxito/error/warning |
| `error-boundary.tsx` | Error boundaries jerárquicos por módulo |
| `loading-spinner.tsx` | Indicadores de carga reutilizables |
| `offline-banner.tsx` | Aviso visual de pérdida de conexión |
| `empty-state.tsx` | Estados vacíos para tablas y listados |

### 2. Shared Hooks Faltantes

| Hook | Propósito |
|------|-----------|
| `use-pagination.ts` | Paginación server-side sincronizada con URL |
| `use-url-state.ts` | Filtros/paginación/orden en search params |
| `use-permission.ts` | RBAC genérico (existe solo en `modules/auth/`) |
| `use-media-query.ts` | Breakpoints responsive para componentes |

### 3. UI Primitives Faltantes

| Componente | Reemplazo de |
|------------|-------------|
| `checkbox.tsx` | Radix Checkbox |
| `select.tsx` | Radix Select |
| `switch.tsx` | Radix Switch |
| `radio-group.tsx` | Radix RadioGroup |
| `tabs.tsx` | Radix Tabs |

### 4. i18n — Ausente por completo

| Archivo | Contenido |
|---------|-----------|
| `src/i18n/request.ts` | Config next-intl |
| `src/i18n/messages/es.json` | Traducciones español |
| `src/i18n/messages/en.json` | Traducciones inglés |

> **Impacto:** Todos los strings están hardcodeados en los componentes. Cada componente deberá refactorizarse para usar `useTranslations()`.

### 5. Rutas Faltantes

| Ruta | Módulo | Detalle |
|------|--------|---------|
| `/servicios/veterinarios` | Servicios | Listado de eventos veterinarios |
| `/animales/loading.tsx` | Animales | Skeleton de listado |
| `/animales/error.tsx` | Animales | Error boundary del módulo |
| `/predios/[id]/potreros` | Predios | Sub-ruta anidada (actualmente plana) |
| `/predios/[id]/lotes` | Predios | Sub-ruta anidada (actualmente plana) |
| `/predios/[id]/grupos` | Predios | Sub-ruta anidada (actualmente plana) |
| `/predios/[id]/sectores` | Predios | Sub-ruta anidada (actualmente plana) |

---

## 🟡 Importante — Funcionalidad parcial

### 6. Testing — Cobertura insuficiente

#### Tests E2E (0 de 10 flujos)

| # | Flujo | Estado |
|---|-------|--------|
| 1 | Login completo → dashboard | ❌ |
| 2 | Login + 2FA → dashboard | ❌ |
| 3 | CRUD animal completo | ❌ |
| 4 | Wizard palpación grupal (3 pasos) | ❌ |
| 5 | Registro parto con cría | ❌ |
| 6 | Cambio de predio → datos recargan | ❌ |
| 7 | Exportación reporte (polling) | ❌ |
| 8 | Operación en lote (5 animales → mover) | ❌ |
| 9 | Navegación responsive mobile | ❌ |
| 10 | Modo offline → datos en cache | ❌ |

#### MSW Handlers Faltantes

| Handler | Módulo |
|---------|--------|
| `animales.handlers.ts` | Animales |
| `servicios.handlers.ts` | Servicios |
| `usuarios.handlers.ts` | Usuarios |
| `productos.handlers.ts` | Productos |
| `reportes.handlers.ts` | Reportes |
| `notificaciones.handlers.ts` | Notificaciones |
| `imagenes.handlers.ts` | Imágenes |
| `maestros.handlers.ts` | Maestros |
| `configuracion.handlers.ts` | Configuración |

> **Existentes:** `auth.handlers.ts`, `predios.handlers.ts`

#### Tests Unitarios Faltantes

- ❌ Servicios: hooks (palpaciones, inseminaciones, partos)
- ❌ Productos: hooks y services
- ❌ Reportes: hooks y services
- ❌ Notificaciones: hooks y services
- ❌ Imágenes: hooks y services
- ❌ Predios: hooks

### 7. PWA / Service Worker — Incompleto

| Componente | Estado | Detalle |
|------------|--------|---------|
| `sw.ts` | ⚠️ Parcial | Entry existe, sin estrategias de cache configuradas |
| `serwist.config.ts` | ⚠️ Parcial | Verificar configuración completa |
| Background Sync | ❌ Ausente | Cola offline en IndexedDB |
| Firebase Push | ❌ Ausente | Config FCM no integrada |
| Cache por recurso | ❌ Ausente | NetworkFirst, CacheFirst, StaleWhileRevalidate |
| Invalidación predio | ❌ Ausente | `CLEAR_DYNAMIC_CACHE` no implementado |
| SW Update Lifecycle | ❌ Ausente | skipWaiting + clientsClaim + notificación |

### 8. Módulo Servicios — Incompleto

| Elemento | Detalle |
|----------|---------|
| Veterinarios | Sin página, sin componentes, sin hooks |
| Wizard state | Sin store Zustand dedicado para persistencia |
| `servicios.service.ts` | Solo API layer, falta lógica de negocio |

### 9. Módulo Animales — Faltantes

| Elemento | Detalle |
|----------|---------|
| `use-animal-estado.ts` | Hook para cambio de estado (vendido/muerto) |
| `use-bulk-actions.ts` | Operaciones en lote |
| `animal-filters.tsx` | Componente de filtros con sync URL |
| `animal-card.tsx` | Vista card alternativa |
| `animal.schema.ts` | Schema Zod en módulo |
| `animal-filters.schema.ts` | Schema de filtros |

---

## 🟢 Menor — Polish y calidad

### 10. Dark Mode

| Elemento | Estado |
|----------|--------|
| `theme.store.ts` | ✅ Implementado con tests |
| `theme-toggle.tsx` | ✅ Implementado con tests |
| `dark:` classes en componentes | ⚠️ Verificar cobertura completa |

### 11. Accessibility

| Elemento | Estado |
|----------|--------|
| Audit realizado | ❌ No |
| `aria-labels` | ⚠️ Faltan en muchos componentes |
| Keyboard navigation | ❌ No verificada |
| Focus management | ❌ No implementado |

### 12. Lighthouse / Performance

| Elemento | Estado |
|----------|--------|
| Lighthouse CI config | ❌ No existe |
| GitHub Actions quality workflow | ❌ No existe |
| Métricas documentadas | ❌ No |

### 13. Configuración

| Elemento | Estado |
|----------|--------|
| `.env.example` | ❌ No existe |
| `NEXT_PUBLIC_FEATURE_PUSH_NOTIFICATIONS` | ❌ No configurada |
| `manifest.json` | ✅ Existe |
| Iconos PWA | ✅ Existen (192/512) |

---

## 📋 Plan de Acción Priorizado

### Prioridad 1 — Bloqueantes funcionales

1. Crear `shared/components/feedback/` (5 componentes)
2. Crear hooks shared faltantes (4 hooks)
3. Crear UI primitives faltantes (5 componentes Radix)
4. Integrar i18n con `es.json` base

### Prioridad 2 — Calidad mínima

5. Completar MSW handlers (8 handlers)
6. Implementar 3 flujos E2E críticos (login, CRUD animal, cambio predio)
7. Crear `/servicios/veterinarios`
8. Agregar `loading.tsx` y `error.tsx` por módulo

### Prioridad 3 — PWA

9. Configurar Serwist con estrategias de cache
10. Implementar Background Sync básico
11. Offline banner funcional

### Prioridad 4 — Polish

12. Dark mode completo en todos los componentes
13. Accessibility audit
14. Lighthouse CI config
15. `.env.example` y documentación

---

## Estructura Actual vs. Esperada

### Lo que SÍ existe

```
apps/web/src/
├── modules/
│   ├── animales/       ✅ components, hooks, services, types
│   ├── auth/           ✅ components, hooks, schemas, services
│   ├── configuracion/  ✅ components, hooks, services, types
│   ├── imagenes/       ✅ components, hooks, services, types
│   ├── maestros/       ✅ components, hooks, services, types
│   ├── notificaciones/ ✅ components, hooks, services, types
│   ├── predios/        ✅ components, hooks, services
│   ├── productos/      ✅ components, hooks, services, types
│   ├── reportes/       ✅ components, hooks, services, types
│   ├── servicios/      ✅ components, hooks, services, types, schemas
│   └── usuarios/       ✅ components, hooks, services, types, tests
├── store/              ✅ 8 stores (auth, predio, ui, theme, etc.)
├── shared/
│   ├── components/
│   │   ├── layout/     ✅ admin-layout, sidebar, header, breadcrumbs, etc.
│   │   └── ui/         ✅ 13 componentes base
│   ├── hooks/          ⚠️ Solo 3 (debounce, online-status, failed-sync)
│   ├── lib/            ✅ api-client, errors, query-client, query-keys
│   └── providers/      ✅ app-providers, auth-provider
├── app/                ✅ 42 páginas de rutas
└── tests/              ⚠️ Solo unitarios básicos, 0 E2E
```

### Lo que NO existe

```
apps/web/src/
├── i18n/               ❌ Directorio completo ausente
├── shared/
│   ├── components/
│   │   └── feedback/   ❌ Directorio completo vacío
│   └── hooks/
│       ├── use-pagination.ts      ❌
│       ├── use-url-state.ts       ❌
│       ├── use-permission.ts      ❌ (solo en modules/auth)
│       └── use-media-query.ts     ❌
├── shared/components/ui/
│   ├── checkbox.tsx    ❌
│   ├── select.tsx      ❌
│   ├── switch.tsx      ❌
│   ├── radio-group.tsx ❌
│   └── tabs.tsx        ❌
├── tests/
│   ├── e2e/            ❌ Directorio vacío (0 specs)
│   └── mocks/handlers/ ⚠️ Solo 2 de ~10 necesarios
├── servicios/
│   └── veterinarios/   ❌ Sin página ni componentes
└── .env.example        ❌
```

---

*Documento generado automáticamente a partir del análisis del código vs. PRD Frontend v1.0.0*
