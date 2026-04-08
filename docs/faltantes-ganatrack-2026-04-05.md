# Faltantes GanaTrack — Estado 2026-04-05

> Auditoría de tareas pendientes e incompletas en Backend y Frontend.
> Generado automáticamente al revisar PRDs, código fuente, openspec, tests y TODOs.

---

## 📊 Resumen General

| Métrica | Backend | Frontend |
|---------|---------|----------|
| Módulos | 11 ✅ todos creados | 11 ✅ todos creados |
| Completion | **~85%** | **~80%** |
| Tests activos | ~45 archivos | ~68 archivos |
| TODOs marcados | 2 | 0 |
| Tests fallando | 0 (10 skipped) | 2 |
| Líneas de código | ~15K+ | ~25K+ |

---

## 🔴 BACKEND — Tareas Incompletas

### P1 — Crítico

| # | Tarea | Archivo | Estado | Impacto |
|---|-------|---------|--------|---------|
| 1 | **Alert Engine — lógica completa** | `apps/api/src/modules/notificaciones/domain/services/alert-engine.service.ts:84` | 🟡 Pendiente | Las 5 reglas de alerta (parto, celo, vacuna, animal enfermo, inseminación) no evalúan automáticamente |
| 2 | **2FA Resend — integrar email/SMS** | `apps/api/src/modules/auth/application/use-cases/resend-2fa.use-case.ts:46` | 🟡 Pendiente | Usuario no puede reenviar código 2FA sin servicio de envío |

### P2 — Importante

| # | Tarea | Estado | Detalle |
|---|-------|--------|---------|
| 3 | **Canal Email (nodemailer)** | ❌ Falta | Cola de reintentos + envío de notificaciones por email no implementado |
| 4 | **Canal Push (FCM/Firebase)** | ❌ Falta | Integración con `firebase-admin` para push notifications |
| 5 | **SSE (Server-Sent Events)** | ❌ Falta | Notificaciones en tiempo real (PRD §13.5 lo define como opcional) |
| 6 | **Redis/BullMQ para colas** | 🟡 Pendiente | Actualmente usa cola en memoria — no sobrevive reinicios del servidor |

### P3 — Polish

| # | Tarea | Estado | Detalle |
|---|-------|--------|---------|
| 7 | **Tests integración better-sqlite3** | 🟡 Skipped | 10 tests de integración saltados: `better-sqlite3 native module failed to initialize` |

---

## 🟡 FRONTEND — Tareas Incompletas

### P1 — Crítico (bloquean funcionalidad)

| # | Tarea | Directorio | Estado | Impacto |
|---|-------|-----------|--------|---------|
| 1 | **Feedback Components** | `shared/components/feedback/` | 🔴 Falta | `Toast`, `ErrorBoundary`, `OfflineBanner`, `EmptyState`, `LoadingSpinner` — sin ellos los errores se muestran silenciosamente |
| 2 | **Shared Hooks** | `shared/hooks/` | 🔴 Falta | `use-pagination`, `use-url-state`, `use-permission`, `use-media-query` — cada página implementa lógica propia |
| 3 | **Tests `predio.store`** | `src/tests/stores/predio.store.test.ts` | 🔴 Failing | 2 tests fallando: `setPredios` y `switchPredio` no limpian `predioActivo` correctamente |

### P2 — Importante

| # | Tarea | Directorio | Estado | Detalle |
|---|-------|-----------|--------|---------|
| 4 | **UI Primitives (Radix)** | `shared/components/ui/` | 🟡 Incompleto | Falta `Checkbox`, `Select`, `Switch`, `RadioGroup`, `Tabs` |
| 5 | **i18n (next-intl)** | `src/i18n/` | 🟡 Pendiente | Internacionalización no configurada — PRD la exige (§18) |
| 6 | **Firebase Push (FCM)** | — | ❌ Falta | Registro de token push en el frontend |
| 7 | **Background Sync completo** | `shared/lib/` | 🟡 Parcial | Queue offline en IndexedDB para formularios críticos |
| 8 | **Cache Strategies Serwist** | `apps/web/src/sw.ts` | 🟡 Parcial | NetworkFirst/CacheFirst por recurso no configuradas |
| 9 | **MSW Handlers** | `src/tests/mocks/` | 🟡 Faltan | Solo 2 handlers — se necesitan ~10+ para testing robusto |

### P3 — Polish

| # | Tarea | Estado | Detalle |
|---|-------|--------|---------|
| 10 | **Coverage push** | 🟡 Pendiente | Objetivos PRD: hooks 80%, services 80%, stores 90%, schemas 95% |
| 11 | **Lighthouse CI config** | 🟡 Pendiente | Configurar pipeline de calidad con Lighthouse |
| 12 | **Dark mode polish** | 🟡 Pendiente | Completar tema oscuro en todos los módulos |
| 13 | **Accessibility audit** | 🟡 Pendiente | aria-labels, focus management, keyboard nav |

---

## 📁 Openspec — Estado de Cambios

### Activos (specs sin implementar)

| Spec | Prioridad | Notas |
|------|-----------|-------|
| `servicios-veterinarios/spec.md` | HIGH | Frontend: página, componentes, hooks |
| `servicios-grupal-wizard/spec.md` | HIGH | Wizard grupal para palpaciones/inseminaciones |
| `mock-services/spec.md` | MEDIUM | MSW handlers para testing |
| `shared-feedback-components/spec.md` | HIGH | Toast, ErrorBoundary, etc. |

### Archivados (completados)

| Cambio | Fecha |
|--------|-------|
| `coverage-lighthouse-audit` | 2026-04-06 |
| `pwa-offline` | 2026-04-05 |
| `e2e-playwright-testing` | 2026-04-05 |
| `fase3-servicios-backend` | 2026-04-05 |
| `fase2-backend` | 2026-04-05 |
| `backend-foundation` | 2026-04-05 |
| `ui-primitives` | 2026-04-05 |
| `fase6-calidad-backend` | 2026-04-05 |
| `fase6.1-calidad-correccion` | 2026-04-05 |

---

## 🗺️ Roadmap — PRD vs Implementación

### Backend (PRD v1.5.0 §14)

| Fase | Estado | Detalle |
|------|--------|---------|
| Fase 1 — Fundación | ✅ Completa | Auth, JWT, 2FA, database, testing setup |
| Fase 2 — Núcleo de Negocio | ✅ Completa | Predios, animales, maestros, configuración |
| Fase 3 — Servicios y Media | ✅ Completa | Palpaciones, inseminaciones, partos, imágenes, productos |
| Fase 4 — Reportes | ✅ Completa | 5 reportes JSON, export PDF/Excel/CSV |
| Fase 5 — Notificaciones | 🟡 ~70% | Cron + triggers done, email/push/SSE pendientes |
| Fase 6 — Calidad y Producción | 🔄 ~80% | Testing, linting, coverage — Swagger pendiente |

### Frontend (PRD v1.0.0 §22)

| Fase | Estado | Detalle |
|------|--------|---------|
| Fase 1 — Fundación | ✅ ~85% | Auth, stores, ky, TanStack Query |
| Fase 2 — Núcleo | ✅ ~90% | UI components, predios, maestros, animales |
| Fase 3 — Servicios y Media | ✅ ~85% | Wizard, palpaciones, partos, imágenes, productos |
| Fase 4 — Reportes | ✅ ~80% | Dashboard, 5 reportes, export |
| Fase 5 — Notificaciones + PWA | ⚠️ ~75% | Bell, panel, preferences — PWA parcial |
| Fase 6 — Calidad | 🔄 ~80% | Usuarios done, coverage push pendiente |

---

## 💡 Sugerencia de Priorización

### Semana 1 — Arreglar lo roto y lo crítico

1. **Fix `predio.store` tests** — 2 tests fallando, bajo esfuerzo
2. **Feedback Components** — Toast, ErrorBoundary, OfflineBanner, EmptyState, LoadingSpinner
3. **Shared Hooks** — `use-pagination`, `use-url-state`, `use-permission`, `use-media-query`

### Semana 2 — Completar P5 Backend

4. **Alert Engine** — Terminar lógica de evaluación de alertas
5. **Canal Email** — Implementar cola + nodemailer

### Semana 3 — Pulido y calidad

6. **i18n** — Configurar next-intl
7. **MSW Handlers** — Para tests robustos sin API real
8. **UI Primitives** — Completar componentes Radix faltantes

---

*Documento generado el 2026-04-05. Revisar periódicamente para actualizar estado.*
