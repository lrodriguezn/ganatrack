# Delta spec E2E Testing Playwright 10 flujos críticos

**What**: Especificación delta completa para E2E Testing con Playwright cubriendo los 10 flujos críticos de GanaTrack
**Why**: Definir escenarios detallados para implementación de tests E2E siguiendo el PRD
**Where**: docs/specs/e2e-playwright-testing.md
**Learned**: MSW handlers ya tienen credenciales configuradas (admin@ganatrack.com/password123 directo, 2fa@ganatrack.com con código 123456). Playwright config ya existe con chromium/firefox. Tests existentes usan patrón simple de navegación y assertions.

---

## Escenarios de Test por Flujo

### Flow #1: Login Completo (E2E-01)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-01.1 | Login exitoso con credenciales válidas | `auth.spec.ts` |
| E2E-01.2 | Error de login con credenciales inválidas | `auth.spec.ts` |
| E2E-01.3 | Logout redirige a página de login | `auth.spec.ts` |
| E2E-01.4 | Sesión expirada redirige a login | `auth.spec.ts` |

### Flow #2: Login + 2FA (E2E-02)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-02.1 | Flujo completo 2FA exitoso | `auth-2fa.spec.ts` |
| E2E-02.2 | Error con código 2FA inválido | `auth-2fa.spec.ts` |
| E2E-02.3 | Redirección automática a página 2FA | `auth-2fa.spec.ts` |
| E2E-02.4 | Reenvío de código 2FA con countdown | `auth-2fa.spec.ts` |

### Flow #3: CRUD Animales (E2E-03)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-03.1 | Crear animal con datos válidos | `animales-crud.spec.ts` |
| E2E-03.2 | Error código duplicado | `animales-crud.spec.ts` |
| E2E-03.3 | Editar animal existente | `animales-crud.spec.ts` |
| E2E-03.4 | Cambiar estado de animal | `animales-crud.spec.ts` |
| E2E-03.5 | Eliminar animal | `animales-crud.spec.ts` |
| E2E-03.6 | Validación de campos obligatorios | `animales-crud.spec.ts` |

### Flow #4: Wizard Palpación (E2E-04)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-04.1 | Navegación 3 pasos completa | `servicios-palpacion.spec.ts` |
| E2E-04.2 | Validación datos reproductivos | `servicios-palpacion.spec.ts` |
| E2E-04.3 | Resumen previo a guardar | `servicios-palpacion.spec.ts` |
| E2E-04.4 | Éxito/redirección a detalle servicio | `servicios-palpacion.spec.ts` |

### Flow #5: Registro Parto (E2E-05)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-05.1 | Registro de parto con cría vinculada | `servicios-parto.spec.ts` |
| E2E-05.2 | Error al registrar sin madre | `servicios-parto.spec.ts` |
| E2E-05.3 | Registro de complicaciones | `servicios-parto.spec.ts` |
| E2E-05.4 | Validación peso fuera de rango | `servicios-parto.spec.ts` |

### Flow #6: Cambio de Predio (E2E-06)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-06.1 | Cambio de predio desde dropdown | `predios.spec.ts` |
| E2E-06.2 | Persistencia de seleccionado | `predios.spec.ts` |
| E2E-06.3 | Invalidación de caché al cambiar | `predios.spec.ts` |
| E2E-06.4 | Permisos por diterapkan | `predios.spec.ts` |

### Flow #7: Exportación de Reportes (E2E-07)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-07.1 | Selección de rango de fechas | `reportes.spec.ts` |
| E2E-07.2 | Generación de PDF | `reportes.spec.ts` |
| E2E-07.3 | Generación de Excel | `reportes.spec.ts` |
| E2E-07.4 | Polling de progreso de exportación | `reportes.spec.ts` |
| E2E-07.5 | Descarga de archivo finalizado | `reportes.spec.ts` |

### Flow #8: Operaciones en Lote (E2E-08)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-08.1 | Selección múltiple de animales | `batch-operations.spec.ts` |
| E2E-08.2 | Acción en lote "Cambiar estado" | `batch-operations.spec.ts` |
| E2E-08.3 | Confirmación antes de ejecutar | `batch-operations.spec.ts` |
| E2E-08.4 | Éxito con toast de notificación | `batch-operations.spec.ts` |
| E2E-08.5 | Error parcial con rollback UI | `batch-operations.spec.ts` |

### Flow #9: Navegación Mobile (E2E-09)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-09.1 | Menú hamburguesa funcional en <768px | `mobile.spec.ts` |
| E2E-09.2 | Tabla animales con scroll horizontal | `mobile.spec.ts` |
| E2E-09.3 | Formularios adaptativos | `mobile.spec.ts` |
| E2E-09.4 | Bottom sheet para filtros | `mobile.spec.ts` |
| E2E-09.5 | Touch targets mínimos 44px | `mobile.spec.ts` |

### Flow #10: Offline PWA (E2E-10)

| Escenario | Descripción | Test |
|-----------|-------------|------|
| E2E-10.1 | Banner offline visible sin conexión | `offline.spec.ts` |
| E2E-10.2 | Datos cacheados accesibles offline | `offline.spec.ts` |
| E2E-10.3 | Acción offline encolada | `offline.spec.ts` |
| E2E-10.4 | Sincronización automática al reconectar | `offline.spec.ts` |
| E2E-10.5 | Manejo de conflictos en sincronización | `offline.spec.ts` |

---

## Credenciales de Test

| Usuario | Contraseña | Propósito |
|---------|------------|-----------|
| `admin@ganatrack.com` | `password123` | Login directo sin 2FA |
| `2fa@ganatrack.com` | `password123` | Login con 2FA (código: `123456`) |

---

## Mock Data Determinístico

```typescript
// test-data.ts
export const TEST_ANIMAL = {
  id: 1,
  codigo: 'GAN-001',
  nombre: 'Don Toro',
  estado: 'activo',
};

export const TEST_PREDIOS = [
  { id: 1, nombre: 'Finca La Esperanza' },
  { id: 2, nombre: 'Hacienda El Roble' },
];
```