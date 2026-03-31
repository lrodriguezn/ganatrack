# PRD — Frontend GanaTrack
**Product Requirements Document**
**Versión:** 1.0.0
**Fecha:** 2026-03-30
**Estado:** Borrador — Pendiente de revisión

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura Frontend (Screaming Architecture)](#3-arquitectura-frontend-screaming-architecture)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Integración Monorepo (Turborepo)](#5-integración-monorepo-turborepo)
6. [Cliente HTTP y Capa de Datos](#6-cliente-http-y-capa-de-datos)
7. [Gestión de Estado (Zustand)](#7-gestión-de-estado-zustand)
8. [Autenticación y Autorización](#8-autenticación-y-autorización)
9. [Arquitectura de Formularios](#9-arquitectura-de-formularios)
10. [Arquitectura de Tablas](#10-arquitectura-de-tablas)
11. [Arquitectura de Componentes](#11-arquitectura-de-componentes)
12. [Sistema de Navegación y Layout](#12-sistema-de-navegación-y-layout)
13. [Módulos del Sistema](#13-módulos-del-sistema)
14. [PWA y Estrategia Offline](#14-pwa-y-estrategia-offline)
15. [Routing y Navegación](#15-routing-y-navegación)
16. [Manejo de Errores](#16-manejo-de-errores)
17. [Estrategia de Testing](#17-estrategia-de-testing)
18. [Internacionalización](#18-internacionalización)
19. [Convenciones y Estándares](#19-convenciones-y-estándares)
20. [Variables de Entorno](#20-variables-de-entorno)
21. [Especificaciones por Módulo](#21-especificaciones-por-módulo)
22. [Roadmap de Implementación](#22-roadmap-de-implementación)

---

## 1. Visión General

### 1.1 Objetivos del Frontend

**GanaTrack Frontend** es una aplicación web Progressive Web App (PWA) multi-tenant para la gestión ganadera bovina completa. El frontend consume la API REST del backend (PRD Backend v1.5.0 aprobado) y debe funcionar en zonas rurales con conectividad intermitente, ofrecer experiencia nativa-like en dispositivos móviles, y escalar a 11 módulos funcionales con arquitectura mantenible.

### 1.2 Relación con el Backend

El frontend es un consumidor puro de la API REST del backend. Todas las decisiones de negocio, validación de permisos, y lógica de datos reside en el backend. El frontend actúa como:

- **Renderer**: renderiza la UI según los datos recibidos
- **Validador de UX**: validación前端 de formularios antes de enviar
- **Orquestador de estado**: gestión de cache, optimizaciones de rendering, offline
- **Presenter**: formatea datos para visualización (fechas, números, monedas)

**Referencia del contrato API**: Ver [PRD Backend GanaTrack v1.5.0](PRD_GanaTrack_Backend_1.5.0.md) §7 para definición completa de endpoints.

### 1.3 Modelo Multi-Tenant en Frontend

El frontend recibe el `predio_id` activo del contexto de tenant del backend (header `X-Predio-Id`). Cada request de datos operacionaless incluye automáticamente este header. El cambio de predio en el frontend:

1. Actualiza el `predioActivo` en `predio.store.ts`
2. Invalida todo el cache de TanStack Query
3. Envía mensaje al Service Worker para limpiar cache dinámico
4. Refresca todos los datos visibles con el nuevo contexto

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Framework | Next.js | 16.x | App Router, RSC, template base |
| UI Library | React | 19.x | Concurrent features, use() hook |
| Lenguaje | TypeScript | 5.9.x | Strict mode |
| Estilos | Tailwind CSS | 4.x | Template base, CSS-first config |
| Server State | TanStack Query | 5.x | Cache, paginación, offline |
| Client State | Zustand | 5.x | Auth tokens, predio activo, UI |
| Context API | React Context | (built-in) | Sidebar/theme del template |
| Forms | React Hook Form | 7.x | Performance, validación |
| Validación | Zod | 3.x | Schemas compartidos con backend |
| Tablas | TanStack Table | 8.x | Headless, server-side |
| HTTP Client | ky | latest | Fetch-based, interceptors |
| Auth Cookies | — | — | httpOnly cookie vía API |
| i18n | next-intl | 3.x | App Router nativo |
| PWA | Serwist | latest | Service Worker, Background Sync |
| Charts | ApexCharts | (template) | Reportes visuales |
| Calendar | FullCalendar | (template) | Eventos reproductivos |
| UI Primitives | Radix UI | latest | Accesibles, Tailwind v4 compatible |
| Drag & Drop | react-dnd | (template) | Reordenamiento |
| File Upload | react-dropzone | (template) | Imágenes |
| Icons | Heroicons / template SVGs | — | Consistencia |
| Test Runner | Vitest | 1.x | Unit + integration |
| Test UI | React Testing Library | latest | Component testing |
| Test E2E | Playwright | latest | Flujos críticos |
| Mock API | MSW | 2.x | Interceptor fetch/SW |
| Monorepo | Turborepo | 2.x | Build orchestration |
| Package Manager | pnpm | latest | Workspaces |
| Linting | ESLint 9 | flat config | Template base |
| Formatting | Prettier | + tailwind plugin | Template base |

---

## 3. Arquitectura Frontend (Screaming Architecture)

### 3.1 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Router (src/app/)                     │
│  Route Groups: (auth) | (dashboard) | (public)                   │
│  Solo routing + page.tsx/layout.tsx/loading.tsx/error.tsx         │
├─────────────────────────────────────────────────────────────────┤
│                    Modules (src/modules/)                         │
│  Screaming Architecture: auth/ animales/ servicios/ predios/     │
│  Cada módulo: components/ hooks/ services/ schemas/ types/       │
├─────────────────────────────────────────────────────────────────┤
│                    Shared (src/shared/)                           │
│  components/ui/ | components/layout/ | components/feedback/      │
│  hooks/ | lib/ | providers/ | constants/                         │
├─────────────────────────────────────────────────────────────────┤
│                    Store (src/store/)                             │
│  Zustand: auth.store | predio.store | ui.store                   │
├─────────────────────────────────────────────────────────────────┤
│                    API Layer (shared/lib/)                        │
│  api-client.ts (ky) → interceptors → Backend REST                │
├─────────────────────────────────────────────────────────────────┤
│                    Packages (packages/)                            │
│  shared-types/ (Zod schemas + DTOs + enums)                     │
│  tsconfig/ (configs compartidos)                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos (Component → Hook → Service → API)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│Component │───>│TanStack Query│───>│Service Layer │───>│ky client │
│(React)   │    │Hook          │    │(module/svc)  │    │          │
└──────────┘    └──────────────┘    └──────────────┘    └──────────┘
     ▲               │                                       │
     │               ▼                                       ▼
     │          ┌──────────┐                           ┌──────────┐
     │          │Query     │                           │Backend   │
     │          │Cache     │                           │REST API  │
     │          └──────────┘                           └──────────┘
     │               │
     │               ▼
     └──────── Render con datos cacheados
```

### 3.3 Reglas de Dependencia

| Desde | Puede importar de |
|-------|-------------------|
| `app/` (pages) | `modules/*`, `shared/*`, `store/*` |
| `modules/X/components/` | `modules/X/hooks/`, `modules/X/types/`, `shared/*`, `store/*` |
| `modules/X/hooks/` | `modules/X/services/`, `modules/X/types/`, `shared/lib/*`, `store/*` |
| `modules/X/services/` | `shared/lib/api-client`, `modules/X/types/`, `packages/shared-types` |
| `shared/*` | `store/*`, `packages/shared-types` |
| `store/*` | `packages/shared-types` |
| `packages/shared-types` | Solo dependencias externas (Zod) |

**PROHIBIDO**: `modules/A` importa directamente de `modules/B`. La comunicación cross-module se hace via `shared/` o `store/`.

### 3.4 Principios Obligatorios

- **Screaming Architecture**: `app/` solo para routing. Toda la lógica de negocio vive en `modules/`
- **Seguridad de tokens**: accessToken NUNCA en localStorage ni sessionStorage — solo en memoria Zustand
- **URL como source of truth**: filtros, paginación y ordenamiento en search params
- **Tipado estricto**: TypeScript strict mode, sin `any`
- **Shadcn/ui prohibido**: Tailwind v4 es incompatible — usar Radix UI directamente
- **Zod schemas compartidos**: Definidos en `packages/shared-types`, consumidos por frontend y backend

---

## 4. Estructura del Proyecto

### 4.1 Árbol de directorios completo de `apps/web/src/`

```
ganatrack/
├── apps/
│   └── web/                                    # App Next.js 16
│       ├── public/
│       │   ├── manifest.json                   # PWA manifest
│       │   ├── sw.ts                          # Serwist SW entry
│       │   └── icons/                         # PWA icons 192/512
│       ├── src/
│       │   ├── app/                            # SOLO ROUTING
│       │   │   ├── (auth)/                     # Login, 2FA, forgot
│       │   │   │   ├── login/page.tsx
│       │   │   │   ├── verificar-2fa/page.tsx
│       │   │   │   └── layout.tsx              # Full-width sin sidebar
│       │   │   ├── (dashboard)/               # App autenticada
│       │   │   │   ├── layout.tsx              # AdminLayout: sidebar+header
│       │   │   │   ├── page.tsx                # Dashboard home
│       │   │   │   ├── animales/
│       │   │   │   │   ├── page.tsx            # Listado
│       │   │   │   │   ├── nuevo/page.tsx       # Crear
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   ├── page.tsx        # Detalle con tabs
│       │   │   │   │   │   └── editar/page.tsx
│       │   │   │   │   ├── loading.tsx         # Skeleton listado
│       │   │   │   │   └── error.tsx           # Error boundary módulo
│       │   │   │   ├── servicios/
│       │   │   │   │   ├── palpaciones/
│       │   │   │   │   │   ├── page.tsx        # Listado eventos
│       │   │   │   │   │   └── nuevo/page.tsx  # Wizard grupal
│       │   │   │   │   ├── inseminaciones/
│       │   │   │   │   ├── partos/
│       │   │   │   │   └── veterinarios/
│       │   │   │   ├── predios/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── page.tsx
│       │   │   │   │       ├── potreros/page.tsx
│       │   │   │   │       ├── sectores/page.tsx
│       │   │   │   │       ├── lotes/page.tsx
│       │   │   │   │       └── grupos/page.tsx
│       │   │   │   ├── usuarios/
│       │   │   │   ├── maestros/
│       │   │   │   │   ├── veterinarios/page.tsx
│       │   │   │   │   ├── propietarios/page.tsx
│       │   │   │   │   ├── hierros/page.tsx
│       │   │   │   │   ├── diagnosticos/page.tsx
│       │   │   │   │   ├── motivos-ventas/page.tsx
│       │   │   │   │   ├── causas-muerte/page.tsx
│       │   │   │   │   ├── lugares-compras/page.tsx
│       │   │   │   │   └── lugares-ventas/page.tsx
│       │   │   │   ├── configuracion/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── productos/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── nuevo/page.tsx
│       │   │   │   │   └── [id]/page.tsx
│       │   │   │   ├── reportes/
│       │   │   │   │   ├── inventario/page.tsx
│       │   │   │   │   ├── reproductivo/page.tsx
│       │   │   │   │   ├── mortalidad/page.tsx
│       │   │   │   │   ├── movimiento/page.tsx
│       │   │   │   │   └── sanitario/page.tsx
│       │   │   │   └── notificaciones/
│       │   │   │       ├── page.tsx
│       │   │   │       └── preferencias/page.tsx
│       │   │   ├── not-found.tsx
│       │   │   ├── error.tsx
│       │   │   ├── globals.css
│       │   │   └── layout.tsx
│       │   │
│       │   ├── modules/                        # SCREAMING ARCHITECTURE
│       │   │   ├── auth/
│       │   │   │   ├── components/
│       │   │   │   │   ├── login-form.tsx
│       │   │   │   │   ├── two-factor-form.tsx
│       │   │   │   │   └── can.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── use-login.ts
│       │   │   │   │   ├── use-logout.ts
│       │   │   │   │   ├── use-refresh-token.ts
│       │   │   │   │   └── use-permission.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── auth.service.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── login.schema.ts
│       │   │   │   └── types/
│       │   │   │       └── auth.types.ts
│       │   │   │
│       │   │   ├── animales/
│       │   │   │   ├── components/
│       │   │   │   │   ├── animal-table.tsx
│       │   │   │   │   ├── animal-form.tsx
│       │   │   │   │   ├── animal-detail-tabs.tsx
│       │   │   │   │   ├── genealogia-tree.tsx
│       │   │   │   │   ├── animal-card.tsx
│       │   │   │   │   ├── animal-filters.tsx
│       │   │   │   │   ├── estado-change-modal.tsx
│       │   │   │   │   └── bulk-actions-bar.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── use-animales.ts
│       │   │   │   │   ├── use-animal.ts
│       │   │   │   │   ├── use-create-animal.ts
│       │   │   │   │   ├── use-update-animal.ts
│       │   │   │   │   ├── use-animal-estado.ts
│       │   │   │   │   ├── use-genealogia.ts
│       │   │   │   │   └── use-bulk-actions.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── animales.service.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   ├── animal.schema.ts
│       │   │   │   │   └── animal-filters.schema.ts
│       │   │   │   └── types/
│       │   │   │       └── animales.types.ts
│       │   │   │
│       │   │   ├── servicios/
│       │   │   │   ├── components/
│       │   │   │   │   ├── servicio-grupal-wizard.tsx
│       │   │   │   │   ├── palpacion-form.tsx
│       │   │   │   │   ├── inseminacion-form.tsx
│       │   │   │   │   ├── parto-form.tsx
│       │   │   │   │   └── animal-selector.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── use-palpaciones.ts
│       │   │   │   │   ├── use-inseminaciones.ts
│       │   │   │   │   ├── use-partos.ts
│       │   │   │   │   └── use-wizard-state.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── servicios.service.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   ├── palpacion.schema.ts
│       │   │   │   │   ├── inseminacion.schema.ts
│       │   │   │   │   └── parto.schema.ts
│       │   │   │   └── types/
│       │   │   │       └── servicios.types.ts
│       │   │   │
│       │   │   ├── predios/
│       │   │   │   ├── components/
│       │   │   │   │   ├── predio-selector.tsx
│       │   │   │   │   ├── predio-form.tsx
│       │   │   │   │   ├── potreros-table.tsx
│       │   │   │   │   ├── lotes-table.tsx
│       │   │   │   │   └── grupos-table.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── use-predios.ts
│       │   │   │   │   ├── use-predio-activo.ts
│       │   │   │   │   ├── use-potreros.ts
│       │   │   │   │   ├── use-lotes.ts
│       │   │   │   │   └── use-grupos.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── predios.service.ts
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   │
│       │   │   ├── usuarios/
│       │   │   │   ├── components/
│       │   │   │   │   ├── usuario-table.tsx
│       │   │   │   │   ├── usuario-form.tsx
│       │   │   │   │   └── permisos-matrix.tsx
│       │   │   │   ├── hooks/
│       │   │   │   ├── services/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   │
│       │   │   ├── maestros/
│       │   │   │   ├── components/
│       │   │   │   │   ├── maestro-table.tsx
│       │   │   │   │   ├── maestro-form.tsx
│       │   │   │   │   └── hierro-upload.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   └── use-maestro.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── maestros.service.ts
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   │
│       │   │   ├── configuracion/
│       │   │   │   ├── components/
│       │   │   │   │   ├── catalogo-table.tsx
│       │   │   │   │   └── catalogo-form.tsx
│       │   │   │   ├── hooks/
│       │   │   │   ├── services/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   │
│       │   │   ├── imagenes/
│       │   │   │   ├── components/
│       │   │   │   │   ├── image-uploader.tsx
│       │   │   │   │   └── image-gallery.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── use-upload-image.ts
│       │   │   │   │   └── use-imagenes.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── imagenes.service.ts
│       │   │   │   └── types/
│       │   │   │
│       │   │   ├── productos/
│       │   │   │   ├── components/
│       │   │   │   │   ├── producto-table.tsx
│       │   │   │   │   └── producto-form.tsx
│       │   │   │   ├── hooks/
│       │   │   │   ├── services/
│       │   │   │   ├── schemas/
│       │   │   │   └── types/
│       │   │   │
│       │   │   ├── reportes/
│       │   │   │   ├── components/
│       │   │   │   │   ├── kpi-card.tsx
│       │   │   │   │   ├── reporte-chart.tsx
│       │   │   │   │   ├── reporte-filters.tsx
│       │   │   │   │   ├── export-button.tsx
│       │   │   │   │   └── export-status.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── use-reporte-inventario.ts
│       │   │   │   │   ├── use-reporte-reproductivo.ts
│       │   │   │   │   ├── use-dashboard-kpis.ts
│       │   │   │   │   └── use-exportacion.ts
│       │   │   │   ├── services/
│       │   │   │   │   └── reportes.service.ts
│       │   │   │   └── types/
│       │   │   │
│       │   │   └── notificaciones/
│       │   │       ├── components/
│       │   │       │   ├── notification-bell.tsx
│       │   │       │   ├── notification-list.tsx
│       │   │       │   ├── notification-item.tsx
│       │   │       │   └── preferencias-form.tsx
│       │   │       ├── hooks/
│       │   │       │   ├── use-notificaciones.ts
│       │   │       │   ├── use-notificaciones-resumen.ts
│       │   │       │   └── use-push-registration.ts
│       │   │       ├── services/
│       │   │       │   └── notificaciones.service.ts
│       │   │       └── types/
│       │   │
│       │   ├── shared/                             # Cross-module
│       │   │   ├── components/
│       │   │   │   ├── ui/
│       │   │   │   │   ├── button.tsx
│       │   │   │   │   ├── input.tsx
│       │   │   │   │   ├── select.tsx
│       │   │   │   │   ├── checkbox.tsx
│       │   │   │   │   ├── radio-group.tsx
│       │   │   │   │   ├── switch.tsx
│       │   │   │   │   ├── badge.tsx
│       │   │   │   │   ├── modal.tsx
│       │   │   │   │   ├── dropdown-menu.tsx
│       │   │   │   │   ├── tabs.tsx
│       │   │   │   │   ├── tooltip.tsx
│       │   │   │   │   ├── skeleton.tsx
│       │   │   │   │   ├── data-table.tsx
│       │   │   │   │   ├── form-field.tsx
│       │   │   │   │   ├── date-picker.tsx
│       │   │   │   │   └── pagination.tsx
│       │   │   │   ├── layout/
│       │   │   │   │   ├── admin-sidebar.tsx
│       │   │   │   │   ├── admin-header.tsx
│       │   │   │   │   ├── breadcrumbs.tsx
│       │   │   │   │   └── page-header.tsx
│       │   │   │   └── feedback/
│       │   │   │       ├── toast-provider.tsx
│       │   │   │       ├── error-boundary.tsx
│       │   │   │       ├── loading-spinner.tsx
│       │   │   │       ├── offline-banner.tsx
│       │   │   │       └── empty-state.tsx
│       │   │   ├── hooks/
│       │   │   │   ├── use-pagination.ts
│       │   │   │   ├── use-debounce.ts
│       │   │   │   ├── use-permission.ts
│       │   │   │   ├── use-online-status.ts
│       │   │   │   ├── use-url-state.ts
│       │   │   │   └── use-media-query.ts
│       │   │   ├── lib/
│       │   │   │   ├── api-client.ts
│       │   │   │   ├── query-client.ts
│       │   │   │   ├── query-keys.ts
│       │   │   │   ├── format.ts
│       │   │   │   └── errors.ts
│       │   │   ├── providers/
│       │   │   │   ├── app-providers.tsx
│       │   │   │   ├── auth-provider.tsx
│       │   │   │   └── intl-provider.tsx
│       │   │   └── constants/
│       │   │       ├── routes.ts
│       │   │       └── permissions.ts
│       │   │
│       │   ├── store/
│       │   │   ├── auth.store.ts
│       │   │   ├── predio.store.ts
│       │   │   └── ui.store.ts
│       │   │
│       │   ├── i18n/
│       │   │   ├── request.ts
│       │   │   └── messages/
│       │   │       ├── es.json
│       │   │       └── en.json
│       │   │
│       │   └── middleware.ts
│       │
│       ├── tests/
│       │   ├── e2e/
│       │   │   ├── auth.spec.ts
│       │   │   ├── animales.spec.ts
│       │   │   ├── servicios.spec.ts
│       │   │   └── fixtures/
│       │   ├── mocks/
│       │   │   ├── handlers/
│       │   │   │   ├── auth.handlers.ts
│       │   │   │   ├── animales.handlers.ts
│       │   │   │   ├── predios.handlers.ts
│       │   │   │   └── index.ts
│       │   │   ├── server.ts
│       │   │   └── browser.ts
│       │   └── setup.ts
│       │
│       ├── next.config.ts
│       ├── serwist.config.ts
│       ├── vitest.config.ts
│       ├── playwright.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── animal.schema.ts
│   │   │   │   ├── palpacion.schema.ts
│   │   │   │   ├── parto.schema.ts
│   │   │   │   ├── predio.schema.ts
│   │   │   │   ├── usuario.schema.ts
│   │   │   │   └── common.schema.ts
│   │   │   ├── dtos/
│   │   │   │   └── index.ts
│   │   │   ├── enums/
│   │   │   │   ├── sexo.enum.ts
│   │   │   │   ├── estado-animal.enum.ts
│   │   │   │   └── index.ts
│   │   │   └── api-response.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── tsconfig/
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 4.2 Convenciones de Nombrado de Archivos

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente | `kebab-case.tsx` | `animal-table.tsx` |
| Hook | `use-{nombre}.ts` | `use-animales.ts` |
| Service | `{módulo}.service.ts` | `animales.service.ts` |
| Schema (Zod) | `{entidad}.schema.ts` | `animal.schema.ts` |
| Store (Zustand) | `{dominio}.store.ts` | `auth.store.ts` |
| Tipos | `{módulo}.types.ts` | `animales.types.ts` |
| Página | `page.tsx` | (Next.js convención) |
| Test unitario | `{archivo}.test.ts(x)` | `use-animales.test.ts` |
| Test E2E | `{flujo}.spec.ts` | `auth.spec.ts` |
| MSW handler | `{módulo}.handlers.ts` | `animales.handlers.ts` |

---

## 5. Integración Monorepo (Turborepo)

### 5.1 Estructura de Packages

```
ganatrack/
├── apps/web/                  # Aplicación Next.js
├── packages/shared-types/    # Zod schemas + DTOs + enums
├── packages/tsconfig/         # Configs TypeScript compartidos
├── turbo.json                 # Pipeline de tareas
├── pnpm-workspace.yaml        # workspaces: ['apps/*', 'packages/*']
└── package.json
```

### 5.2 Shared Types (Zod Schemas)

Los Zod schemas viven en `packages/shared-types/src/schemas/` y se consumen desde:
- Frontend: `modules/*/schemas/` re-exportan y extienden
- Backend: importación directa para validación

**Ejemplo: Schema de Animal (compartido)**

```typescript
// packages/shared-types/src/schemas/animal.schema.ts
import { z } from 'zod';
import { SexoEnum, EstadoAnimalEnum, OrigenAnimalEnum } from '../enums';

export const createAnimalSchema = z.object({
  codigo: z.string().min(1, 'Código requerido').max(50),
  nombre: z.string().max(100).optional(),
  sexo: z.nativeEnum(SexoEnum, { required_error: 'Sexo requerido' }),
  fecha_nacimiento: z.coerce.date({ required_error: 'Fecha de nacimiento requerida' }),
  raza_id: z.string().uuid('Raza requerida'),
  color_id: z.string().uuid().optional(),
  condicion_corporal_id: z.string().uuid().optional(),
  potrero_id: z.string().uuid().optional(),
  grupo_id: z.string().uuid().optional(),
  lote_id: z.string().uuid().optional(),
  origen: z.nativeEnum(OrigenAnimalEnum).default(OrigenAnimalEnum.NACIDO),
  peso_nacimiento: z.coerce.number().positive().optional(),
  observaciones: z.string().max(500).optional(),
  lugar_compra_id: z.string().uuid().optional(),
  fecha_compra: z.coerce.date().optional(),
  precio_compra: z.coerce.number().positive().optional(),
  madre_id: z.string().uuid().optional(),
  padre_id: z.string().uuid().optional(),
  codigo_arete_padre: z.string().max(50).optional(),
  codigo_arete_madre: z.string().max(50).optional(),
}).superRefine((data, ctx) => {
  if (data.origen === OrigenAnimalEnum.COMPRADO && !data.lugar_compra_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Lugar de compra requerido para animales comprados',
      path: ['lugar_compra_id'],
    });
  }
});

export type CreateAnimalDto = z.infer<typeof createAnimalSchema>;
```

### 5.3 Pipeline Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["playwright-report/**"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 5.4 Import Aliases

```json
// apps/web/tsconfig.json (paths)
{
  "paths": {
    "@/*": ["./src/*"],
    "@ganatrack/shared-types": ["../../packages/shared-types/src"]
  }
}
```

---

## 6. Cliente HTTP y Capa de Datos

### 6.1 Configuración de ky

```typescript
// shared/lib/api-client.ts
import ky, { type BeforeRequestHook, type AfterResponseHook } from 'ky';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';
import { ApiError, normalizeApiError } from './errors';

// --- Interceptor: Agregar headers de autenticación y tenant ---
const addHeaders: BeforeRequestHook = (request) => {
  const { accessToken } = useAuthStore.getState();
  const { predioActivo } = usePredioStore.getState();

  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (predioActivo) {
    request.headers.set('X-Predio-Id', String(predioActivo.id));
  }
  request.headers.set('Accept-Language', 'es');
};

// --- Interceptor: Refresh token en 401 ---
let refreshPromise: Promise<string> | null = null;

const handle401: AfterResponseHook = async (request, _options, response) => {
  if (response.status !== 401) return;

  const { logout } = useAuthStore.getState();

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken();
  }

  try {
    const newToken = await refreshPromise;
    useAuthStore.getState().setAccessToken(newToken);
    request.headers.set('Authorization', `Bearer ${newToken}`);
    return ky(request);
  } catch {
    logout();
    window.location.href = '/login';
    throw new ApiError('SESSION_EXPIRED', 'Sesión expirada', 401);
  } finally {
    refreshPromise = null;
  }
};

async function refreshAccessToken(): Promise<string> {
  const response = await ky.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
    { credentials: 'include' }
  ).json<{ data: { accessToken: string } }>();
  return response.data.accessToken;
}

// --- Interceptor: Normalizar errores ---
const normalizeErrors: AfterResponseHook = async (_request, _options, response) => {
  if (response.ok) return;
  if (response.status === 401) return;

  const body = await response.json().catch(() => null);
  throw normalizeApiError(response.status, body);
};

// --- Instancia ky principal ---
export const apiClient = ky.create({
  prefixUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  credentials: 'include',
  retry: 0,
  timeout: 30_000,
  hooks: {
    beforeRequest: [addHeaders],
    afterResponse: [handle401, normalizeErrors],
  },
});
```

### 6.2 Interceptores (Auth, Tenant, Errores)

| Interceptor | Trigger | Acción |
|------------|--------|--------|
| `addHeaders` | Toda request | Agrega `Authorization`, `X-Predio-Id`, `Accept-Language` |
| `handle401` | Response 401 | Refresca token, reintenta request original |
| `normalizeErrors` | Response no-ok | Lanza `ApiError` tipado con code, message, details |

### 6.3 Tipo ApiError

```typescript
// shared/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  getFieldError(field: string): string | undefined {
    return this.details?.[field]?.[0];
  }
}

export function normalizeApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'error' in body) {
    const { code, message, details } = (body as { error: { code: string; message: string; details?: Record<string, string[]> } }).error;
    return new ApiError(code, message, status, details);
  }
  return new ApiError('UNKNOWN_ERROR', 'Error inesperado del servidor', status);
}
```

### 6.4 TanStack Query — Configuración Global

```typescript
// shared/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './errors';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        throwOnError: (error) => {
          return error instanceof ApiError && error.status >= 500;
        },
      },
      mutations: {
        retry: 0,
        throwOnError: false,
      },
    },
  });
}

export const QUERY_STALE_TIMES = {
  list: 30 * 1000,           // 30s - listados dinámicos
  detail: 5 * 60 * 1000,    // 5min - detalle entidad
  catalog: Infinity,          // Infinity - catálogos/config
  dashboard: 60 * 1000,      // 1min - KPIs dashboard
} as const;
```

### 6.5 Query Key Factory

```typescript
// shared/lib/query-keys.ts
export const queryKeys = {
  animales: {
    all: ['animales'] as const,
    lists: () => [...queryKeys.animales.all, 'list'] as const,
    list: (params: AnimalListParams) =>
      [...queryKeys.animales.lists(), params] as const,
    details: () => [...queryKeys.animales.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.animales.details(), id] as const,
    genealogia: (id: string) =>
      [...queryKeys.animales.all, 'genealogia', id] as const,
  },
  predios: {
    all: ['predios'] as const,
    lists: () => [...queryKeys.predios.all, 'list'] as const,
    list: (params?: PredioListParams) =>
      [...queryKeys.predios.lists(), params] as const,
    detail: (id: string) =>
      [...queryKeys.predios.all, 'detail', id] as const,
    potreros: (predioId: string) =>
      [...queryKeys.predios.all, predioId, 'potreros'] as const,
    lotes: (predioId: string) =>
      [...queryKeys.predios.all, predioId, 'lotes'] as const,
    grupos: (predioId: string) =>
      [...queryKeys.predios.all, predioId, 'grupos'] as const,
  },
  servicios: {
    all: ['servicios'] as const,
    palpaciones: {
      all: ['servicios', 'palpaciones'] as const,
      list: (params: PaginationParams) =>
        ['servicios', 'palpaciones', 'list', params] as const,
      detail: (id: string) =>
        ['servicios', 'palpaciones', 'detail', id] as const,
    },
    inseminaciones: {
      all: ['servicios', 'inseminaciones'] as const,
      list: (params: PaginationParams) =>
        ['servicios', 'inseminaciones', 'list', params] as const,
    },
    partos: {
      all: ['servicios', 'partos'] as const,
      list: (params: PaginationParams) =>
        ['servicios', 'partos', 'list', params] as const,
    },
  },
  reportes: {
    all: ['reportes'] as const,
    inventario: (params?: ReporteParams) =>
      [...queryKeys.reportes.all, 'inventario', params] as const,
    reproductivo: (params?: ReporteParams) =>
      [...queryKeys.reportes.all, 'reproductivo', params] as const,
    mortalidad: (params?: ReporteParams) =>
      [...queryKeys.reportes.all, 'mortalidad', params] as const,
    movimiento: (params?: ReporteParams) =>
      [...queryKeys.reportes.all, 'movimiento', params] as const,
    sanitario: (params?: ReporteParams) =>
      [...queryKeys.reportes.all, 'sanitario', params] as const,
    dashboard: () => [...queryKeys.reportes.all, 'dashboard'] as const,
  },
  notificaciones: {
    all: ['notificaciones'] as const,
    list: (params?: PaginationParams) =>
      [...queryKeys.notificaciones.all, 'list', params] as const,
    resumen: () =>
      [...queryKeys.notificaciones.all, 'resumen'] as const,
    preferencias: () =>
      [...queryKeys.notificaciones.all, 'preferencias'] as const,
  },
} as const;
```

### 6.6 Patrones de Hooks

```typescript
// modules/animales/hooks/use-animales.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/query-keys';
import { QUERY_STALE_TIMES } from '@/shared/lib/query-client';
import { animalesService } from '../services/animales.service';
import type { AnimalListParams } from '../types/animales.types';

export function useAnimales(params: AnimalListParams) {
  return useQuery({
    queryKey: queryKeys.animales.list(params),
    queryFn: () => animalesService.list(params),
    staleTime: QUERY_STALE_TIMES.list,
    placeholderData: keepPreviousData,
  });
}

// modules/animales/hooks/use-create-animal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { queryKeys } from '@/shared/lib/query-keys';
import { animalesService } from '../services/animales.service';
import { useToast } from '@/shared/hooks/use-toast';
import type { CreateAnimalDto } from '@ganatrack/shared-types';

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateAnimalDto) => animalesService.create(data),
    onSuccess: (animal) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animales.lists() });
      toast({ type: 'success', message: 'Animal registrado exitosamente' });
      router.push(`/animales/${animal.data.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status !== 400) {
        toast({ type: 'error', message: error.message });
      }
    },
  });
}
```

---

## 7. Gestión de Estado (Zustand)

### 7.1 Auth Store

```typescript
// store/auth.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  permissions: string[];
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  setAuth: (token: string, user: User, permissions: string[]) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      accessToken: null,
      user: null,
      permissions: [],
      isAuthenticated: () => get().accessToken !== null,
      hasPermission: (permission: string) => get().permissions.includes(permission),
      setAuth: (accessToken, user, permissions) =>
        set({ accessToken, user, permissions }, false, 'setAuth'),
      setAccessToken: (accessToken) =>
        set({ accessToken }, false, 'setAccessToken'),
      logout: () =>
        set({ accessToken: null, user: null, permissions: [] }, false, 'logout'),
    }),
    { name: 'auth-store' }
  )
);
```

### 7.2 Predio Store

```typescript
// store/predio.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Predio {
  id: string;
  nombre: string;
  ubicacion?: string;
}

interface PredioState {
  predioActivo: Predio | null;
  prediosList: Predio[];
  setPredios: (predios: Predio[]) => void;
  switchPredio: (predioId: string) => void;
  reset: () => void;
}

export const usePredioStore = create<PredioState>()(
  devtools(
    (set, get) => ({
      predioActivo: null,
      prediosList: [],
      setPredios: (predios) => {
        const saved = sessionStorage.getItem('ganatrack_predio_id');
        const activo = predios.find((p) => p.id === saved) ?? predios[0] ?? null;
        set({ prediosList: predios, predioActivo: activo }, false, 'setPredios');
      },
      switchPredio: (predioId) => {
        const predio = get().prediosList.find((p) => p.id === predicId);
        if (!predio) return;
        sessionStorage.setItem('ganatrack_predio_id', predicId);
        set({ predioActivo: predic }, false, 'switchPredio');
      },
      reset: () => {
        sessionStorage.removeItem('ganatrack_predio_id');
        set({ predioActivo: null, prediosList: [] }, false, 'reset');
      },
    }),
    { name: 'predio-store' }
  )
);
```

### 7.3 UI Store

```typescript
// store/ui.store.ts
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UIState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration ?? 5000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

### 7.4 Integración con TanStack Query

```typescript
// hooks/use-switch-predio.ts
export function useSwitchPredio() {
  const queryClient = useQueryClient();
  const switchPredio = usePredioStore((s) => s.switchPredio);

  return (predioId: string) => {
    switchPredio(predioId);
    queryClient.invalidateQueries();
    navigator.serviceWorker?.controller?.postMessage({
      type: 'CLEAR_DYNAMIC_CACHE',
    });
  };
}
```

---

## 8. Autenticación y Autorización

### 8.1 Flujo de Login (normal + 2FA)

```
POST /auth/login (email, password)
    │
    ├─► Sin 2FA: { accessToken, refreshToken, usuario, predios[] }
    │   ├─► refreshToken → httpOnly cookie (Set-Cookie desde API)
    │   ├─► accessToken → Zustand store (MEMORIA, nunca localStorage)
    │   ├─► setPredios(predios) → PredioStore
    │   └─► Redirect → /(dashboard)
    │
    └─► Con 2FA: { requires2FA: true, tempToken }
        └─► Redirect → /verificar-2fa?temp=tempToken
            └─► POST /auth/2fa/verify → tokens → misma lógica
```

### 8.2 Gestión de Tokens (httpOnly cookie + memoria)

- **accessToken**: almacenado en `authStore` (memoria JavaScript). Nunca en localStorage ni sessionStorage
- **refreshToken**: almacenado en cookie httpOnly (enviado automáticamente por el browser en cada request)
- **tempToken** (2FA): JWT opaco de corta duración (5 min), codifica el `usuarioId` internamente

### 8.3 Auto-refresh de Token

El interceptor `handle401` de ky captura respuestas 401 y ejecuta refresh transparente. Las peticiones paralelas durante un refresh en progreso se encolan y procesan tras el refresh exitoso.

### 8.4 Protección de Rutas (middleware.ts)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (pathname.startsWith('/login') || pathname.startsWith('/verificar-2fa')) {
    // Si ya está autenticado (cookie presente), redirigir al dashboard
    if (request.cookies.has('refreshToken')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas: verificar cookie de refresh
  if (!request.cookies.has('refreshToken')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 8.5 RBAC Frontend (componente Can, hook usePermission)

```typescript
// modules/auth/components/can.tsx
'use client';
import { usePermission } from '../hooks/use-permission';

interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = usePermission(permission);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// modules/auth/hooks/use-permission.ts
export function usePermission(permission: string): boolean {
  return useAuthStore((s) => s.hasPermission(permission));
}
```

### 8.6 Multi-Predio y Cambio de Contexto

```typescript
// PredioSelector en AdminHeader
export function PredioSelector() {
  const { prediosList, predioActivo, switchPredio } = usePredioStore();
  const switchTo = useSwitchPredio();

  if (prediosList.length === 1) {
    return <span className="font-medium">{predioActivo?.nombre}</span>;
  }

  return (
    <select
      value={predioActivo?.id}
      onChange={(e) => switchTo(e.target.value)}
      className="rounded border px-2 py-1"
    >
      {prediosList.map((p) => (
        <option key={p.id} value={p.id}>{p.nombre}</option>
      ))}
    </select>
  );
}
```

---

## 9. Arquitectura de Formularios

### 9.1 React Hook Form + Zod

```typescript
// shared/components/ui/form-field.tsx
'use client';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
}

export function FormField<T extends FieldValues>({
  name, label, type = 'text', placeholder, required, disabled, options,
}: FormFieldProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {type === 'select' ? (
        <select
          id={name}
          {...register(name)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                     focus:border-brand-500 focus:ring-1 focus:ring-brand-500
                     dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">{placeholder ?? 'Seleccionar...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm..."
        />
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm..."
        />
      )}

      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  );
}
```

### 9.2 Validación de Errores de API

```typescript
// hooks/use-animal-form.ts
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await createMutation.mutateAsync(data);
  } catch (error) {
    if (error instanceof ApiError && error.details) {
      Object.entries(error.details).forEach(([field, messages]) => {
        form.setError(field as keyof CreateAnimalDto, {
          type: 'server',
          message: messages[0],
        });
      });
    }
  }
});
```

---

## 10. Arquitectura de Tablas

### 10.1 TanStack Table v8 — DataTable Genérico

```typescript
// shared/components/ui/data-table.tsx
'use client';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table';
import { usePagination } from '@/shared/hooks/use-pagination';
import { Pagination } from './pagination';
import { useUrlState } from '@/shared/hooks/use-url-state';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  onPaginationChange?: (pagination: PaginationState) => void;
}

export function DataTable<T>({
  data, columns, totalCount, page, pageSize, isLoading,
}: DataTableProps<T>) {
  const pagination = useUrlState<PaginationState>('pagination', {
    pageIndex: page - 1,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length}><Skeleton rows={5} /></td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={pagination.pageIndex + 1}
        pageCount={table.getPageCount()}
        totalCount={totalCount}
        pageSize={pagination.pageSize}
        onPageChange={(p) => table.setPageIndex(p - 1)}
        onPageSizeChange={(s) => table.setPageSize(s)}
      />
    </div>
  );
}
```

### 10.2 Sincronización Filtros ↔ URL

```typescript
// shared/hooks/use-url-state.ts
export function useUrlState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValue = useMemo(() => {
    const param = searchParams.get(key);
    if (!param) return defaultValue;
    try { return JSON.parse(param) as T; }
    catch { return defaultValue; }
  }, [searchParams, key, defaultValue]);

  const setValue = (value: T) => {
    const next = new URLSearchParams(searchParams.toString());
    if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
      next.delete(key);
    } else {
      next.set(key, JSON.stringify(value));
    }
    router.push(`?${next.toString()}`, { scroll: false });
  };

  return [currentValue, setValue];
}
```

---

## 11. Arquitectura de Componentes

### 11.1 Atomic Design Adaptado

| Nivel | Ubicación | Ejemplos |
|-------|-----------|---------|
| Átomos | `shared/components/ui/` | button, input, badge, skeleton, tooltip |
| Moléculas | `shared/components/ui/` | form-field (label+input+error), date-picker, pagination |
| Organismos | `shared/components/ui/` + `modules/*/` | data-table, modal con form embebido |
| Templates | `app/` layouts | admin-layout, auth-layout |
| Páginas | `app/` pages | Composición de organismos + hooks |

### 11.2 TailAdmin: Mantener/Extender/Reemplazar

| Categoría | Acción | Ejemplos |
|-----------|--------|---------|
| **Mantener** | No modificar | SidebarContext, ThemeContext, ApexCharts, FullCalendar |
| **Extender** | Agregar funcionalidad | Button (+loading+danger), AppSidebar (+PredioSelector), AppHeader (+NotificationBell) |
| **Reemplazar** | Usar Radix | Modal → Radix Dialog, Table → TanStack Table |

### 11.3 Integración Radix UI + Tailwind v4

```typescript
// shared/components/ui/modal.tsx
import * as Dialog from '@radix-ui/react-dialog';

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 ${sizeClasses[size]}`}>
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <div className="mt-4">{children}</div>
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4" aria-label="Cerrar">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

## 12. Sistema de Navegación y Layout

### 12.1 Estructura del Sidebar

El sidebar muestra los 11 módulos organizados jerárquicamente. Los ítems sin permiso del usuario logueado se ocultan del DOM.

```
Dashboard
Animales
Servicios
  ├── Palpaciones
  ├── Inseminaciones
  ├── Partos
  └── Veterinarios
Predios
  ├── Potreros
  ├── Sectores
  ├── Lotes
  └── Grupos
Maestros
  ├── Veterinarios
  ├── Propietarios
  ├── Hierros
  ├── Diagnósticos
  ├── Motivos de Venta
  ├── Causas de Muerte
  ├── Lugares de Compra
  └── Lugares de Venta
Configuración
Productos
Reportes
Notificaciones
Usuarios (solo admin)
```

### 12.2 Breadcrumbs Automáticos

Generados desde `usePathname()`, usando mapa de labels y overrides para entidades (UUID → nombre legible).

### 12.3 Comportamiento Responsive

| Breakpoint | Sidebar | Layout |
|------------|---------|--------|
| Mobile (<768px) | Oculto, hamburger toggle | 1 columna, tablas scroll horizontal |
| Tablet (768-1279px) | Collapsed (iconos) | 2 columnas en forms |
| Desktop (≥1280px) | Expanded (iconos + texto) | Full layout |

---

## 13. Módulos del Sistema

### 13.1 Tabla de Mapping Backend → Frontend

| Backend Module | Frontend Module | Páginas Principales | Componentes Clave |
|---------------|----------------|--------------------|--------------------|
| `auth` | `modules/auth` | Login, 2FA | LoginForm, TwoFactorForm, Can |
| `usuarios` | `modules/usuarios` | CRUD usuarios, Roles | UsuarioTable, PermisosMatrix |
| `predios` | `modules/predios` | CRUD predios + sub-recursos | PredioSelector, PotrerosTable |
| `animales` | `modules/animales` | Listado, Registro, Detalle, Genealogía | AnimalTable, AnimalForm, GenealogiaTree |
| `servicios` | `modules/servicios` | Palpaciones, Inseminaciones, Partos, Veterinarios | ServicioGrupalWizard |
| `configuracion` | `modules/configuracion` | Catálogos | CatalogoTable |
| `maestros` | `modules/maestros` | CRUD 8 entidades | MaestroTable (genérico) |
| `imagenes` | `modules/imagenes` | (integrado) | ImageUploader |
| `productos` | `modules/productos` | CRUD productos | ProductoTable |
| `reportes` | `modules/reportes` | 5 dashboards + exportación | ReporteChart, ExportButton |
| `notificaciones` | `modules/notificaciones` | Centro, Preferencias | NotificationBell |

### 13.2 Módulo Animales (detalle completo)

- **Listado**: TanStack Table con paginación server-side, filtros URL-sync, búsqueda debounced, prefetch
- **Registro**: Form con 20+ campos, validación Zod condicional por sexo/origen, selects de catálogos cacheados
- **Detalle con tabs**: Información General, Genealogía (3 generaciones), Historial Salud, Servicios
- **Estado change**: Modal con campos condicionales (venta: +precio/lugar; muerte: +causa)
- **Bulk operations**: Selección múltiple, mover a potrero/grupo/lote

### 13.3 Módulo Servicios (patrón wizard master-detail)

Wizard de 3 pasos:
1. **Crear evento**: fecha, veterinario, observaciones específicas
2. **Agregar animales**: búsqueda con filtros (solo hembras activas para palpación/inseminación)
3. **Registrar resultados**: resultado por animal, campos condicionales (días gestión si positivo)

Estado del wizard persiste en Zustand para recuperación ante navegación accidental.

### 13.4 Módulo Reportes y Dashboard

- **Dashboard KPIs**: total animales, nacimientos/mes, muertes/mes, partos/mes, tasa preñez
- **Gráficos**: ApexCharts (inventario por categoría, evolución mensual)
- **5 páginas de reporte**: filtros sync URL, datos JSON → charts
- **Exportación**: dropdown PDF/Excel/CSV, polling para jobs grandes (≥1000 registros)

### 13.5 Módulo Notificaciones

- **Bell badge**: polling `/notificaciones/resumen` cada 60s
- **Panel**: últimas 20 notificaciones, marcar leída individual y masiva
- **Preferencias**: toggles por tipo (PARTO_PROXIMO, CELO_ESTIMADO, VACUNA_PENDIENTE, ANIMAL_ENFERMO)
- **Push**: registro FCM al primer login,抗拒 no vuelve a preguntar por 7 días

---

## 14. PWA y Estrategia Offline

### 14.1 Serwist — Configuración

```typescript
// src/sw.ts
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'serwist';
import { ExpirationPlugin, BackgroundSyncPlugin } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // App Shell → StaleWhileRevalidate
    { urlPattern: /\/_next\/static\/.*/, handler: new StaleWhileRevalidate({ cacheName: 'static-resources' }) },
    // Imágenes estáticas → CacheFirst 30d, max 100
    { urlPattern: /\/icons\/.*|\/images\/.*/, handler: new CacheFirst({ cacheName: 'static-images', plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30*24*60*60 })] }) },
    // Imágenes API → CacheFirst 7d, max 200
    { urlPattern: /\/api\/v1\/imagenes\/.*/, handler: new CacheFirst({ cacheName: 'api-images', plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7*24*60*60 })] }) },
    // Auth → NUNCA cachear
    { urlPattern: /\/api\/v1\/auth\/.*/, handler: new NetworkOnly() },
    // Catálogos → StaleWhileRevalidate
    { urlPattern: /\/api\/v1\/(configuracion|maestros)\/.*/, handler: new StaleWhileRevalidate({ cacheName: 'api-catalogs' }), method: 'GET' },
    // API GET dinámico → NetworkFirst 3s timeout
    { urlPattern: /\/api\/v1\/.*/, handler: new NetworkFirst({ cacheName: 'api-dynamic', networkTimeoutSeconds: 3 }), method: 'GET' },
    // POST/PUT → NetworkOnly + BackgroundSync (excepto auth)
    { urlPattern: /\/api\/v1\/(?!auth).*/, handler: new NetworkOnly({ plugins: [new BackgroundSyncPlugin('mutation-queue', { maxRetentionTime: 24*60 })] }), method: 'POST' },
    { urlPattern: /\/api\/v1\/(?!auth).*/, handler: new NetworkOnly({ plugins: [new BackgroundSyncPlugin('mutation-queue', { maxRetentionTime: 24*60 })] }), method: 'PUT' },
    // Fonts → CacheFirst 1 año
    { urlPattern: /^https?:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/, handler: new CacheFirst({ cacheName: 'google-fonts', plugins: [new ExpirationPlugin({ maxAgeSeconds: 365*24*60*60 })] }) },
  ],
});

// Invalidación por cambio de predio
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_DYNAMIC_CACHE') {
    caches.delete('api-dynamic');
    caches.delete('api-catalogs');
  }
});
serwist.addEventListeners();
```

### 14.2 Estrategias de Cache por Tipo de Recurso

| Recurso | Estrategia | TTL | Max Entries |
|---------|-----------|-----|------------|
| App Shell (HTML, JS, CSS) | StaleWhileRevalidate | — | — |
| Imágenes estáticas | CacheFirst | 30 días | 100 |
| Imágenes de animales/productos | CacheFirst | 7 días | 200 |
| API GET listados | NetworkFirst | — | — |
| API GET catálogos | StaleWhileRevalidate | — | — |
| API POST/PUT/DELETE | NetworkOnly + BackgroundSync | — | — |
| Auth endpoints | NetworkOnly | — | — |
| Fonts | CacheFirst | 1 año | — |

### 14.3 Background Sync para Formularios

Los formularios de registro de animal, palpación y parto se encolan en IndexedDB cuando no hay conexión. Al reconectar, el service worker procesa la cola FIFO. UI muestra badge "X elementos pendientes de sincronización".

### 14.4 Detección Offline y UI Feedback

```typescript
// shared/hooks/use-online-status.ts
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,
    () => true
  );
}

// shared/components/feedback/offline-banner.tsx
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center text-sm">
      Sin conexión — modo lectura
    </div>
  );
}
```

### 14.5 Invalidación de Cache por Cambio de Predio

Al ejecutar `switchPredio()`:
1. `queryClient.invalidateQueries()` — limpia todo el cache TanStack Query
2. Mensaje al Service Worker: `{ type: 'CLEAR_DYNAMIC_CACHE' }` — limpia caches dinámicos

---

## 15. Routing y Navegación

### 15.1 Route Groups

- `(auth)/`: login, 2fa — layout fullscreen sin sidebar
- `(dashboard)/`: toda la app autenticada — layout con AdminLayout (sidebar+header)

### 15.2 Patterns: loading.tsx, error.tsx, not-found.tsx

Cada página y módulo tiene sus propios archivos de loading y error para granularidad en UX:
- `loading.tsx`: skeleton que coincide visualmente con el contenido
- `error.tsx`: error boundary específico del módulo
- `not-found.tsx`: página 404 con CTA

### 15.3 Mapeo Ruta → Permiso

```typescript
// shared/constants/routes.ts
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/animales': 'animales:ver',
  '/animales/nuevo': 'animales:crear',
  '/servicios/palpaciones': 'servicios:ver',
  '/usuarios': 'usuarios:ver',
  '/reportes': 'reportes:ver',
  '/configuracion': 'configuracion:ver',
};
```

---

## 16. Manejo de Errores

### 16.1 Jerarquía de Error Boundaries

```
app/error.tsx                    ← Raíz global (500)
└── (dashboard)/
    └── animales/error.tsx       ← Módulo (aislado)
        └── [id]/error.tsx       ← Página (opcional)
```

### 16.2 Tipos de Error de API

| Status | Manejo |
|--------|--------|
| 400 | `setError()` en RHF → mensaje bajo campo |
| 401 | Interceptor refresh → retry o logout |
| 403 | Toast "No tienes permiso" |
| 404 | not-found.tsx de Next.js |
| 422 | Toast warning con mensaje del server |
| 429 | Toast "Demasiadas solicitudes" |
| 500 | Error boundary → UI retry + toast genérico |
| Offline | OfflineBanner + cache SW |

### 16.3 Sistema de Toasts

```typescript
// store/ui.store.ts — toasts con auto-dismiss 5s
addToast: (toast) => {
  const id = crypto.randomUUID();
  set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  setTimeout(() => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }, toast.duration ?? 5000);
},
```

---

## 17. Estrategia de Testing

### 17.1 Stack de Testing

| Nivel | Herramienta | Target |
|-------|------------|--------|
| Unit | Vitest + RTL | Hooks, services, utils, stores |
| Component | Vitest + RTL | Formularios, tablas, componentes complejos |
| Integration | Vitest + MSW | Flujos module completos |
| E2E | Playwright | 10 flujos críticos |

### 17.2 Convenciones de Archivos de Test

- Tests co-located: `__tests__/` junto al archivo fuente o `{archivo}.test.ts(x)`
- MSW handlers: `tests/mocks/handlers/{módulo}.handlers.ts`
- E2E: `tests/e2e/{flujo}.spec.ts`

### 17.3 MSW v2 — Mock de API

```typescript
// tests/mocks/handlers/animales.handlers.ts
import { http, HttpResponse } from 'msw';

export const animalesHandlers = [
  http.get('/api/v1/animales', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    return HttpResponse.json({
      success: true,
      data: mockAnimales.slice((page-1)*20, page*20),
      meta: { page, limit: 20, total: mockAnimales.length },
    });
  }),
];
```

### 17.4 Cobertura Objetivo

| Capa | Target |
|------|--------|
| Stores (Zustand) | 90% |
| Schemas (Zod) | 95% |
| Hooks (TanStack Query) | 80% |
| Services (ky) | 80% |
| Components | 70% |
| Pages | 50% |
| E2E | 10 flujos |

### 17.5 10 Flujos E2E Críticos

1. Login completo → dashboard
2. Login + 2FA → dashboard
3. CRUD animal completo
4. Wizard palpación grupal (3 pasos)
5. Registro parto con cría
6. Cambio de predio → datos recargan
7. Exportación reporte (polling)
8. Operación en lote (5 animales → mover)
9. Navegación responsive mobile
10. Modo offline → datos en cache

---

## 18. Internacionalización

### 18.1 next-intl v3 — Configuración

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  return { messages: (await import('./messages/es.json')).default };
});
```

### 18.2 Idiomas Soportados

- **Español (es)** — idioma primario
- **Inglés (en)** — preparado para futuro

### 18.3 Formateo de Fechas y Números (es-LA)

```typescript
// shared/lib/format.ts
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-LA', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-LA').format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-LA', { style: 'currency', currency: 'COP' }).format(n);
}
```

---

## 19. Convenciones y Estándares

### 19.1 Naming Conventions

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Archivos | `kebab-case` | `animal-repository.ts` |
| Clases | `PascalCase` | `AnimalRepository` |
| Interfaces | prefijo `I` | `IAnimalRepository` |
| Variables/funciones | `camelCase` | `useAnimales` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_FILE_SIZE` |
| Rutas URL | `kebab-case` plural | `/animales`, `/servicios/palpaciones` |
| Env vars | `SCREAMING_SNAKE_CASE` | `NEXT_PUBLIC_API_URL` |

### 19.2 Import Rules

- Imports siempre con aliases: `@/store/auth.store` no `../store/auth.store`
- `packages/shared-types` importado como `@ganatrack/shared-types`
- Barrel exports (`index.ts`) para módulos públicos
- No barrel exports para utilities internos

### 19.3 Tailwind v4 Conventions

- Configuración CSS-first: `@theme` en `globals.css`, no `tailwind.config.js`
- Clases custom con `--color-*` en el theme
- Dark mode: `dark:` prefix, clase `dark` en `html`

### 19.4 TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 20. Variables de Entorno

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# PWA
NEXT_PUBLIC_APP_NAME=GanaTrack
NEXT_PUBLIC_APP_DESCRIPTION=Gestión ganadera bovina
NEXT_PUBLIC_THEME_COLOR=#1C2434

# Feature Flags
NEXT_PUBLIC_FEATURE_PUSH_NOTIFICATIONS=true
```

---

## 21. Especificaciones por Módulo

### AUTH-01: Flujo de Login Normal

El sistema DEBE autenticar al usuario mediante credenciales email/password enviadas a `POST /api/v1/auth/login`.

- **RF-01.1**: Formulario valida email (RFC 5322) y password (mínimo 8 caracteres) antes de la petición
- **RF-01.2**: accessToken almacenado en Zustand (memoria), NO en localStorage ni sessionStorage
- **RF-01.3**: refreshToken llega vía `Set-Cookie` httpOnly
- **RF-01.4**: Redirect a `/(dashboard)` tras login exitoso

**Escenario: Login exitoso sin 2FA**
- DADO que el usuario tiene credenciales válidas y sin 2FA activado
- CUANDO envía el formulario de login
- ENTONCES el sistema almacena el accessToken en Zustand, no en localStorage
- Y redirige al dashboard principal

**Escenario: Credenciales inválidas**
- DADO que el usuario ingresa email o contraseña incorrectos
- CUANDO el servidor responde con error 401
- ENTONCES el sistema muestra mensaje "Credenciales inválidas"
- Y el campo password se limpia

### AUTH-02: Flujo de Login con 2FA

- **RF-02.1**: Al recibir `requires2FA: true`, redirige a `/verificar-2fa?temp={tempToken}`
- **RF-02.2**: Formulario 2FA acepta código OTP de 6 dígitos numéricos
- **RF-02.3**: Opción "Reenviar código" llama a `POST /api/v1/auth/2fa/resend`

### AUTH-03: Refresh de Token Automático

- **RF-03.1**: Interceptor `afterResponse` de ky captura 401 y ejecuta refresh
- **RF-03.2**: Refresh exitoso: nuevo token en Zustand, reintento transparente
- **RF-03.3**: Refresh fallido: `authStore.logout()` + redirect `/login`

### AUTH-04: Protección de Rutas

- **RF-04.1**: `middleware.ts` verifica cookie de refresh para sesión activa
- **RF-04.2**: Redirige a `/login?redirect={ruta_original}` si no hay sesión
- **RF-04.3**: Rutas auth con sesión activa redirigen al dashboard

### AUTH-05: RBAC Frontend

- **RF-05.1**: Permisos almacenados en `authStore` como `string[]`
- **RF-05.2**: `usePermission(permiso)` verifica si el usuario tiene el permiso
- **RF-05.3**: Botones sin permiso se ocultan del DOM

### AUTH-06: Multi-predio y Cambio de Predio

- **RF-06.1**: `predio.store.ts` almacena `predioActivo` y `prediosList`
- **RF-06.2**: `X-Predio-Id` enviado en cada petición API
- **RF-06.3**: `switchPredio(id)` ejecuta `queryClient.invalidateQueries()` completo

### NAV-01: Estructura del Sidebar

- **RF-NAV-01.1**: 11 módulos organizados jerárquicamente
- **RF-NAV-01.2**: Ítems sin permiso ocultos del DOM
- **RF-NAV-01.3**: Ítem activo resaltado con clase `active`

### NAV-02: Breadcrumbs

- **RF-NAV-02.1**: Reflect hierarchy de rutas (ej. Dashboard > Animales > Nombre Animal > Editar)
- **RF-NAV-02.2**: Todos los segmentos excepto el último son enlaces
- **RF-NAV-02.3**: Nombres de entidades (no IDs) en breadcrumbs

### ANIM-01: Listado con Paginación Server-Side

- **RF-ANIM-01.1**: TanStack Table v8 headless con datos del servidor
- **RF-ANIM-01.2**: Filtros sincronizados con URL query params
- **RF-ANIM-01.3**: Prefetch de siguiente página
- **RF-ANIM-01.4**: Columnas: código, nombre, sexo, raza, estado, potrero, fecha nacimiento, acciones

### ANIM-02: Formulario de Registro de Animal

- **RF-ANIM-02.1**: React Hook Form v7 + Zod schema
- **RF-ANIM-02.2**: Campos obligatorios: código, sexo, fecha nacimiento, raza_id
- **RF-ANIM-02.3**: Campos condicionales por sexo y origen
- **RF-ANIM-02.4**: Selects de catálogos cacheados con TanStack Query

### ANIM-03: Vista de Detalle con Tabs

- **RF-ANIM-03.1**: Pestañas: Información General, Genealogía, Historial Salud, Servicios
- **RF-ANIM-03.2**: Pestaña activa sincronizada con `?tab=`
- **RF-ANIM-03.3**: Datos cargados lazy por pestaña

### ANIM-04: Árbol Genealógico

- **RF-ANIM-04.1**: Hasta 3 generaciones desde `GET /animales/{id}/genealogia`
- **RF-ANIM-04.2**: Ancestros registrados son links, externos solo texto

### ANIM-05: Cambio de Estado

- **RF-ANIM-05.1**: Estados: ACTIVO, VENDIDO, MUERTO, DADO_DE_BAJA
- **RF-ANIM-05.2**: Venta requiere: fecha, motivo, lugar; Muerte requiere: fecha, causa
- **RF-ANIM-05.3**: Modal de confirmación con formulario embebido

### ANIM-06: Operaciones en Lote

- **RF-ANIM-06.1**: Checkboxes para selección múltiple
- **RF-ANIM-06.2**: Operaciones: mover a potrero, cambiar grupo, cambiar lote

### SERV-01: Patrón Grupal Compartido

- **RF-SERV-01.1**: Wizard 3 pasos: crear evento, agregar animales, registrar resultados
- **RF-SERV-01.2**: Paso 1 crea evento master via POST; pasos 2 y 3 usan ID creado
- **RF-SERV-01.3**: Estado persiste en Zustand para recuperación

### SERV-02 a SERV-04: Palpaciones, Inseminaciones, Partos

- Palpación: solo hembras activas seleccionables, días gestión si positivo
- Inseminación: datos de semen y técnica
- Parto: vinculación madre, pre-poblar cría con datos heredados

### RPT-01: Dashboard KPIs

- **RF-RPT-01.1**: Tarjetas: total animales, nacimientos/mes, muertes/mes, partos/mes, tasa preñez
- **RF-RPT-01.2**: Gráficos ApexCharts: inventario por categoría, evolución mensual
- **RF-RPT-01.3**: Skeleton mientras cargan, error boundary si fallan

### RPT-02: Reportes con Filtros

- **RF-RPT-02.1**: Panel de filtros: rango de fechas, estado, sexo, raza
- **RF-RPT-02.2**: Filtros sincronizados con URL
- **RF-RPT-02.3**: Datos JSON alimentan gráficos ApexCharts

### RPT-03: Exportación de Reportes

- **RF-RPT-03.1**: Dropdown: PDF, Excel, CSV
- **RF-RPT-03.2**: < 1000 registros: descarga directa; ≥ 1000: polling async
- **RF-RPT-03.3**: Polling cada 3s, spinner durante espera

### NOTIF-01: Centro de Notificaciones

- **RF-NOTIF-01.1**: Dropdown/panel con últimas 20 notificaciones
- **RF-NOTIF-01.2**: Badge rojo con conteo no leídas (99+ si > 99)
- **RF-NOTIF-01.3**: Polling `/notificaciones/resumen` cada 60s

### NOTIF-02: Preferencias

- **RF-NOTIF-02.1**: Toggles por tipo: partos próximos, vacunas, animales enfermos

### NOTIF-03: Push Notifications

- **RF-NOTIF-03.1**: Solicitar permiso FCM al primer login
- **RF-NOTIF-03.2**: Si rechaza, no preguntar por 7 días

### PWA-01: Service Worker y Estrategias de Cache

- **RF-PWA-01.1** a **RF-PWA-01.7**: Ver tabla en §14.2

### PWA-02: Background Sync

- **RF-PWA-02.1**: Formularios de animal, palpación, parto detectan offline y encolan
- **RF-PWA-02.2**: Cola procesada FIFO al reconectar
- **RF-PWA-02.3**: Badge "X elementos pendientes de sincronización"

### PWA-03: Invalidación por Cambio de Predio

- **RF-PWA-03.1**: Mensaje al SW `CLEAR_DYNAMIC_CACHE` en `switchPredio()`

### INFRA-01: Cliente HTTP (ky)

- **RF-INFRA-01.1**: Instancia centralizada con interceptores
- **RF-INFRA-01.2**: Headers: Authorization, X-Predio-Id, Accept-Language
- **RF-INFRA-01.3**: Error normalization a `ApiError` tipado

### INFRA-02: TanStack Query — Configuración Global

- **RF-INFRA-02.1**: staleTime por tipo: list=30s, detail=5min, catalog=Infinity
- **RF-INFRA-02.2**: Query keys factory centralizado
- **RF-INFRA-02.3**: retry=1 para queries

### INFRA-03: Zustand Stores

- **RF-INFRA-03.1**: `auth.store.ts`: accessToken en memoria, NO persistido
- **RF-INFRA-03.2**: `predio.store.ts`: sessionStorage solo para `predioId` seleccionado
- **RF-INFRA-03.3**: `ui.store.ts`: toast queue

### INFRA-04: Error Boundaries y Feedback

- **RF-INFRA-04.1**: Error boundary en `app/layout.tsx`
- **RF-INFRA-04.2**: Toasts: success, error, warning, info con auto-dismiss 5s

---

## 22. Roadmap de Implementación

### Fase 1 — Fundación (Semanas 1–2)

- Configurar monorepo Turborepo + pnpm workspaces
- Migrar template TailAdmin a `apps/web/`
- Crear `packages/shared-types` con Zod schemas base
- Configurar `packages/tsconfig/` y aliases
- Instalar stack core: TanStack Query, Zustand, ky, React Hook Form, Zod, next-intl, Serwist
- Implementar cliente HTTP (ky) con interceptores
- Implementar 3 Zustand stores (auth, predio, ui)
- Implementar `middleware.ts` (auth + intl compose)
- Módulo auth: Login, 2FA, logout, token refresh
- Setup Vitest + RTL + MSW v2 + Playwright
- Testing: stores 90% coverage, MSW handlers auth

### Fase 2 — Núcleo (Semanas 3–4)

- Crear átomos y moléculas UI (Button, Input, Badge, FormField, DataTable, Modal)
- Implementar `shared/lib/query-client.ts` y `query-keys.ts`
- Hooks compartidos: usePermission, useDebounce, useOnlineStatus, useUrlState
- AdminLayout: sidebar dinámico, header con PredioSelector y NotificationBell
- Breadcrumbs automáticos, responsive (mobile/tablet/desktop)
- Error boundaries jerárquicos
- Módulo predios: CRUD + sub-recursos (potreros, sectores, lotes, grupos)
- Módulo maestros: tabla y form genéricos para 8 entidades
- Módulo configuración: catálogos CRUD
- Módulo animales: listado, registro, detalle con tabs, genealogía, bulk operations
- Testing: Vitest AnimalForm 100%, E2E CRUD animal

### Fase 3 — Servicios y Media (Semanas 5–6)

- Módulo servicios: wizard grupal compartido (3 pasos)
- Palpaciones grupales: wizard + AnimalSelector (solo hembras activas)
- Inseminaciones grupales: wizard específico
- Partos: vinculación madre, pre-poblar cría
- Veterinarios: listado de eventos
- Módulo imágenes: upload con react-dropzone, galería
- Módulo productos: CRUD con imágenes
- Testing: Vitest wizard state, E2E palpación grupal, E2E parto

### Fase 4 — Reportes (Semanas 7–8)

- Dashboard KPIs: tarjetas + gráficos ApexCharts
- 5 páginas de reportes: inventario, reproductivo, mortalidad, movimiento, sanitario
- ReporteFilters con sync a URL
- ExportButton con polling para jobs grandes
- Testing: Vitest KPIs, E2E polling, E2E exportación

### Fase 5 — Notificaciones y PWA (Semanas 9–10)

- NotificationBell con badge polling 60s
- Centro de notificaciones: panel, marcar leída
- Preferencias: toggles por tipo
- Push notifications: FCM registration
- Serwist: estrategias de cache por recurso
- Background Sync para formularios offline
- OfflineBanner, install prompt
- Testing: E2E offline sync, E2E modo lectura

### Fase 6 — Calidad y Producción (Semanas 11–12)

- Módulo usuarios: CRUD + PermisosMatrix
- Coverage push: hooks 80%, services 80%, stores 90%, schemas 95%, components 70%
- Completar 10 flujos E2E
- Lighthouse PWA score > 90, Performance > 90 en /animales
- Audit accessibility: aria-labels, focus management, keyboard nav
- Dark mode polish
- Documentación: README.md actualizado

---

## Criterios de Éxito del Proyecto

- [ ] Monorepo configurado con `apps/web` + `packages/shared-types`
- [ ] 11 módulos frontend implementados con CRUD completo
- [ ] Auth flow completo: login → 2FA → refresh → logout
- [ ] PWA instalable con Lighthouse PWA score > 90
- [ ] Background Sync funcional para 3 formularios críticos (animal, palpación, parto)
- [ ] i18n configurado con español completo
- [ ] Test coverage: 80% unit, 70% component, 10 E2E flujos
- [ ] Responsive: funcional en mobile 360px+, tablet 768px+, desktop 1280px+
- [ ] Multi-tenant: cambio de predio invalida cache y actualiza UI correctamente
- [ ] Offline: app usable en modo lectura sin conectividad

---

*Documento generado para el equipo de desarrollo de GanaTrack. Versión sujeta a revisión según evolución del producto.*
