# PRD — Backend GanaTrack
**Product Requirements Document**
**Versión:** 1.5.0
**Fecha:** 2026-03-30
**Estado:** Aprobado — Judgment Day passed (4 rondas, 20 fixes, ambos jueces CLEAN)

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura Hexagonal](#3-arquitectura-hexagonal)
4. [Estructura del Monorepo (Turborepo)](#4-estructura-del-monorepo-turborepo)
5. [Diagrama Entidad-Relación](#5-diagrama-entidad-relación)
6. [Módulos del Sistema](#6-módulos-del-sistema)
7. [Definición de Endpoints por Módulo](#7-definición-de-endpoints-por-módulo)
8. [Seguridad y Autenticación](#8-seguridad-y-autenticación)
9. [Base de Datos y Drizzle ORM](#9-base-de-datos-y-drizzle-orm)
10. [Convenciones y Estándares](#10-convenciones-y-estándares)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Módulo de Reportes y Estadísticas](#12-módulo-de-reportes-y-estadísticas)
13. [Módulo de Notificaciones y Alertas](#13-módulo-de-notificaciones-y-alertas)
14. [Roadmap de Implementación](#14-roadmap-de-implementación)

---

## 1. Visión General

**GanaTrack** es un sistema de control ganadero multi-tenant lógico (una instalación, múltiples predios/fincas) que permite gestionar el ciclo completo de producción bovina: registro de animales, trazabilidad genealógica, gestión sanitaria y reproductiva, control de predios, y administración de usuarios con roles y permisos.

### 1.1 Objetivos del Backend

- Proveer una API RESTful segura, escalable y bien documentada.
- Soportar SQLite en desarrollo y PostgreSQL en producción sin cambios de código.
- Implementar arquitectura hexagonal para máxima testabilidad y mantenibilidad.
- Centralizar la lógica de negocio en capas de dominio independientes del framework.

### 1.2 Modelo de Despliegue

**Multi-tenant lógico:** una única instalación de GanaTrack puede gestionar múltiples predios/fincas. El campo `predio_id` presente en todas las tablas operativas actúa como discriminador de tenant a nivel de datos. La estrategia de aislamiento es **shared database, shared schema** con filtrado por `predio_id`.

#### Implicaciones:
- Cada request autenticado debe incluir el `predio_id` activo (vía header `X-Predio-Id` o claim en JWT).
- Un middleware `TenantContext` extrae y valida el `predio_id` en cada request, inyectándolo en el contexto de la aplicación.
- Los repositorios filtran automáticamente por `predio_id` del contexto — nunca se accede a datos de un predio sin autorización.
- Un usuario puede tener acceso a múltiples predios según la tabla de asignación `usuarios_predios`.
- Los catálogos de configuración (`config_*`) son globales y no llevan `predio_id`.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión Recomendada |
|------|-----------|---------------------|
| Runtime | Node.js | >= 20 LTS |
| Lenguaje | TypeScript | >= 5.x |
| Monorepo | Turborepo | >= 2.x |
| Framework API | Fastify | >= 4.x |
| ORM | Drizzle ORM | >= 0.30.x |
| Migraciones | drizzle-kit | >= 0.20.x |
| Driver SQLite | `better-sqlite3` | >= 9.x |
| Driver PostgreSQL | `postgres` (postgres.js) | >= 3.x |
| DB Desarrollo | SQLite | 3.x |
| DB Producción | PostgreSQL | >= 15 |
| Autenticación | JWT (access + refresh) + 2FA | jsonwebtoken >= 9.x |
| Validación | JSON Schema (Fastify nativo) + Zod | — |
| Testing | Vitest | >= 1.x |
| Linting | ESLint + Prettier | — |
| Logger | Pino (incluido en Fastify) | — |
| DI Container | tsyringe | >= 5.x |

---

## 3. Arquitectura Hexagonal

La arquitectura hexagonal (también llamada Ports & Adapters) separa el núcleo de negocio de los detalles de infraestructura. Cada módulo de GanaTrack sigue esta estructura interna:

```
módulo/
├── domain/
│   ├── entities/          # Entidades de dominio puras (sin dependencias)
│   ├── value-objects/     # Objetos de valor inmutables
│   ├── repositories/      # Interfaces (puertos) de persistencia
│   └── services/          # Lógica de negocio del dominio
├── application/
│   ├── use-cases/         # Casos de uso (orquestadores)
│   └── dtos/              # Data Transfer Objects de entrada/salida
├── infrastructure/
│   ├── persistence/       # Implementaciones Drizzle de los repositorios
│   ├── http/
│   │   ├── routes/        # Registro de rutas Fastify
│   │   ├── controllers/   # Adaptadores HTTP → casos de uso
│   │   └── schemas/       # JSON Schema para validación Fastify
│   └── mappers/           # Transformación dominio ↔ persistencia
└── index.ts               # Barrel export del módulo
```

### 3.1 Flujo de una Request

```
HTTP Request
    │
    ▼
[Fastify Route] ──valida con JSON Schema──► [400 si inválido]
    │
    ▼
[AuthN Middleware] ──verifica JWT + extrae claims──► [401 si inválido]
    │
    ▼
[TenantContext Middleware] ──valida X-Predio-Id contra predioIds del JWT──► [403 si no coincide]
    │
    ▼
[AuthZ Middleware] ──verifica permiso RBAC──► [403 si sin permiso]
    │
    ▼
[Controller] ──extrae DTO──►
    │
    ▼
[Use Case] ──lógica de orquestación──►
    │
    ▼
[Domain Service] ──reglas de negocio──►
    │
    ▼
[Repository Interface] ──puerta──►
    │
    ▼
[Drizzle Repository] ──adaptador──► [SQLite / PostgreSQL]
    │
    ▼
[Mapper] ──dominio → DTO respuesta──►
    │
    ▼
HTTP Response
```

### 3.2 Principios Obligatorios

- Las **entidades de dominio** no importan nada de Drizzle, Fastify ni Express.
- Los **casos de uso** solo dependen de interfaces (puertos), nunca de implementaciones concretas.
- Los **controladores** no contienen lógica de negocio; solo traducen HTTP ↔ aplicación.
- La **inyección de dependencias** se gestiona con **tsyringe** como contenedor IoC. Cada módulo registra sus dependencias en el composition root (`apps/api/src/container.ts`). Los casos de uso reciben sus dependencias vía constructor injection con decoradores `@injectable()` y `@inject()`.
- El entry point (`server.ts`) importa `reflect-metadata` como primera instrucción para habilitar los decoradores de tsyringe.

---

## 4. Estructura del Monorepo (Turborepo)

```
ganatrack/
├── apps/
│   └── api/                      # Aplicación Fastify principal
│       ├── src/
│       │   ├── modules/           # Módulos de negocio (hexagonal)
│       │   │   ├── auth/
│       │   │   ├── usuarios/
│       │   │   ├── predios/
│       │   │   ├── animales/
│       │   │   ├── servicios/
│       │   │   ├── configuracion/
│       │   │   └── imagenes/
│       │   ├── shared/            # Código compartido entre módulos
│       │   │   ├── errors/
│       │   │   ├── middleware/
│       │   │   └── types/
│       │   ├── plugins/           # Plugins Fastify (cors, jwt, multipart)
│       │   ├── app.ts             # Construcción de la app Fastify
│       │   ├── server.ts          # Entry point (listen)
│       │   ├── container.ts       # Composition root (tsyringe)
│       ├── .env.example
│       └── package.json
├── packages/
│   ├── database/                  # Drizzle schema + cliente compartido
│   │   ├── src/
│   │   │   ├── schema/            # Un archivo por dominio
│   │   │   │   ├── usuarios.ts
│   │   │   │   ├── predios.ts
│   │   │   │   ├── animales.ts
│   │   │   │   ├── servicios.ts
│   │   │   │   ├── configuracion.ts
│   │   │   │   ├── notificaciones.ts
│   │   │   │   └── index.ts       # Re-export de todos los schemas
│   │   │   ├── client.ts          # Factory: retorna db según DATABASE_PROVIDER
│   │   │   └── index.ts
│   │   ├── migrations/            # SQL generado por drizzle-kit
│   │   ├── seed.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── shared-types/              # Tipos TypeScript compartidos
│   │   └── src/
│   │       ├── dtos/
│   │       └── enums/
│   └── config/                    # Configuración compartida (env, logger)
│       └── src/
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### 4.1 Tasks Turborepo (v2) (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:unit": {
      "dependsOn": ["^build"]
    },
    "test:integration": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## 5. Diagrama Entidad-Relación

```mermaid
erDiagram
    %% --- Módulo de Seguridad ---
    USUARIOS ||--|| USUARIOS_CONTRASENA : tiene
    USUARIOS ||--o{ USUARIOS_HISTORIAL_CONTRASENAS : mantiene
    USUARIOS ||--o{ USUARIOS_LOGIN : registra
    USUARIOS ||--o{ USUARIOS_AUTENTICACION_DOS_FACTORES : usa
    USUARIOS }o--o{ USUARIOS_ROLES : asignado
    USUARIOS_ROLES }o--o{ USUARIOS_PERMISOS : contiene
    USUARIOS }o--o{ USUARIOS_PREDIOS : acceso
    USUARIOS_PREDIOS }o--|| PREDIOS : asocia

    %% --- Módulo de Predios y Estructura ---
    PREDIOS ||--o{ POTREROS : contiene
    PREDIOS ||--o{ SECTORES : contiene
    PREDIOS ||--o{ LOTES : contiene
    PREDIOS ||--o{ GRUPOS : contiene
    PREDIOS ||--o{ PRODUCTOS : gestiona
    PREDIOS ||--o{ VETERINARIOS : registra
    PREDIOS ||--o{ PROPIETARIOS : posee
    PREDIOS ||--o{ HIERROS : define
    PREDIOS ||--o{ ANIMALES : alberga

    %% --- Módulo de Animales y Salud ---
    CONFIG_RAZAS ||--o{ ANIMALES : clasifica
    CONFIG_CONDICIONES_CORPORALES ||--o{ ANIMALES : evalua
    ANIMALES ||--o{ ANIMALES_IMAGENES : tiene
    PRODUCTOS ||--o{ PRODUCTOS_IMAGENES : tiene
    IMAGENES ||--o{ ANIMALES_IMAGENES : vincula
    IMAGENES ||--o{ PRODUCTOS_IMAGENES : vincula
    IMAGENES ||--o{ HIERROS : representa

    %% --- Relaciones de Servicios ---
    VETERINARIOS ||--o{ SERVICIOS_PALPACIONES_GRUPAL : realiza
    SERVICIOS_PALPACIONES_GRUPAL ||--o{ SERVICIOS_PALPACIONES_ANIMALES : incluye
    ANIMALES ||--o{ SERVICIOS_PALPACIONES_ANIMALES : recibe
    ANIMALES ||--o{ SERVICIOS_PARTOS_ANIMALES : registra
    DIAGNOSTICOS_VETERINARIOS ||--o{ SERVICIOS_PALPACIONES_ANIMALES : resultado

    USUARIOS {
        int id PK
        string nombre
        string email
        int activo
    }

    USUARIOS_PREDIOS {
        int id PK
        int usuario_id FK
        int predio_id FK
        int rol_id FK
        int activo
    }

    ANIMALES {
        int id PK
        int predio_id FK
        string codigo
        int madre_id FK
        int padre_id FK
        int config_razas_id FK
        int potrero_id FK
        float precio_compra
    }

    PREDIOS {
        int id PK
        string codigo
        string nombre
        float area_hectareas
    }

    CONFIG_KEY_VALUES {
        string opcion
        string key
        string value
    }
```

---

## 6. Módulos del Sistema

### 6.1 Resumen de Módulos

| Módulo | Responsabilidad Principal | Tablas Principales |
|--------|--------------------------|-------------------|
| `auth` | Login, JWT, 2FA, refresh tokens | Usuarios_Login, Usuarios_Autenticacion_Dos_Factores |
| `usuarios` | CRUD usuarios, roles, permisos | Usuarios, Usuarios_Roles, Usuarios_Permisos |
| `predios` | Gestión de fincas, potreros, sectores, lotes, grupos | predios, potreros, sectores, lotes, grupos |
| `animales` | Registro, trazabilidad, árbol genealógico | animales, animales_imagenes |
| `servicios` | Palpaciones, inseminaciones, partos, veterinarios | servicios_palpaciones_*, servicios_inseminacion_*, servicios_partos_*, servicios_veterinarios_* |
| `configuracion` | Catálogos del sistema (razas, colores, parámetros) | config_* |
| `maestros` | Veterinarios, propietarios, hierros, diagnósticos, motivos | veterinarios, propietarios, hierros, diagnosticos_veterinarios, motivos_ventas, causas_muerte, lugares_* |
| `imagenes` | Upload y gestión de archivos multimedia | imagenes, animales_imagenes, productos_imagenes |
| `productos` | Inventario de productos veterinarios | productos, productos_imagenes |
| `reportes` | Estadísticas, indicadores y exportación PDF/Excel/CSV | reportes_exportaciones |
| `notificaciones` | Alertas automáticas in-app, email y push | notificaciones, notificaciones_preferencias, notificaciones_push_tokens |

---

## 7. Definición de Endpoints por Módulo

> **Prefijo base:** `/api/v1`
> **Autenticación:** Todos los endpoints (salvo `/auth/login` y `/auth/refresh`) requieren header `Authorization: Bearer <access_token>`

---

### 7.1 Módulo `auth`

| Método | Ruta | Descripción | Body / Params clave |
|--------|------|-------------|---------------------|
| `POST` | `/auth/login` | Inicio de sesión | `{ email, password }` |
| `POST` | `/auth/refresh` | Renovar access token | `{ refreshToken }` |
| `POST` | `/auth/logout` | Cerrar sesión | — (token en header) |
| `POST` | `/auth/2fa/verify` | Verificar código 2FA | `{ tempToken, codigo }` |
| `POST` | `/auth/2fa/resend` | Reenviar código 2FA | `{ tempToken, metodo }` |
| `POST` | `/auth/change-password` | Cambiar contraseña | `{ passwordActual, passwordNuevo }` |

**Flujo de login con 2FA:**
1. `POST /auth/login` → si 2FA activo, responde `{ requires2FA: true, tempToken }`
   - El `tempToken` es un JWT opaco de corta duración (TTL 5 min) que codifica el `usuarioId` internamente. **No se expone el `usuarioId` real** al cliente para prevenir enumeración.
2. `POST /auth/2fa/verify` → valida `tempToken` + código OTP → responde `{ accessToken, refreshToken }`

**Respuesta exitosa de login sin 2FA:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900,
  "usuario": { "id": 1, "nombre": "Admin", "roles": ["ADMIN"] }
}
```

---

### 7.2 Módulo `usuarios`

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/usuarios` | Listar usuarios | `?activo=1&page=1&limit=20` |
| `GET` | `/usuarios/:id` | Obtener usuario por ID | — |
| `POST` | `/usuarios` | Crear usuario | `{ nombre, email, password, rolesIds[] }` |
| `PUT` | `/usuarios/:id` | Actualizar usuario | `{ nombre, email, activo }` |
| `DELETE` | `/usuarios/:id` | Desactivar usuario (soft delete) | — |
| `POST` | `/usuarios/:id/roles` | Asignar roles a usuario | `{ rolesIds[] }` |
| `GET` | `/roles` | Listar roles disponibles | — |
| `GET` | `/roles/:id` | Obtener rol por ID | — |
| `POST` | `/roles` | Crear rol | `{ nombre, permisosIds[] }` |
| `PUT` | `/roles/:id` | Actualizar rol | `{ nombre, permisosIds[] }` |
| `GET` | `/permisos` | Listar permisos disponibles | — |

---

### 7.3 Módulo `predios`

#### Predio

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/predios` | Listar predios | `?activo=1` |
| `GET` | `/predios/:id` | Obtener predio | — |
| `POST` | `/predios` | Crear predio | `{ codigo, nombre, area_hectareas, capacidad_maxima }` |
| `PUT` | `/predios/:id` | Actualizar predio | campos editables |
| `DELETE` | `/predios/:id` | Desactivar predio | — |

#### Potreros, Sectores, Lotes, Grupos

Patrón uniforme para los cuatro sub-recursos (reemplazar `{recurso}` por `potreros`, `sectores`, `lotes` o `grupos`):

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/predios/:predioId/{recurso}` | Listar por predio |
| `GET` | `/predios/:predioId/{recurso}/:id` | Obtener por ID |
| `POST` | `/predios/:predioId/{recurso}` | Crear |
| `PUT` | `/predios/:predioId/{recurso}/:id` | Actualizar |
| `DELETE` | `/predios/:predioId/{recurso}/:id` | Desactivar |

**Body de creación para potreros:**
```json
{
  "codigo": "P001",
  "nombre": "Potrero Norte",
  "area_hectareas": 15.5,
  "capacidad_maxima": 40
}
```

#### Parámetros de Predio

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/predios/:predioId/parametros` | Listar parámetros del predio |
| `PUT` | `/predios/:predioId/parametros/:codigo` | Actualizar valor de parámetro |

---

### 7.4 Módulo `animales`

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/animales` | Listar animales | `?predioId&estado_animal_key&sexo_key&potrero_id&page&limit&search` |
| `GET` | `/animales/:id` | Obtener animal completo | — |
| `POST` | `/animales` | Registrar animal | ver body completo abajo |
| `PUT` | `/animales/:id` | Actualizar animal | campos editables |
| `DELETE` | `/animales/:id` | Marcar como inactivo | — |
| `GET` | `/animales/:id/genealogia` | Árbol genealógico (3 generaciones) | — |
| `GET` | `/animales/:id/historial` | Historial de eventos del animal | `?tipo=servicios,partos,veterinario` |
| `PATCH` | `/animales/:id/estado` | Cambiar estado (vendido/muerto) | `{ estado_animal_key, fecha, motivo_id? }` |
| `GET` | `/animales/estadisticas` | Conteos por categoría edad/sexo | `?predioId` |

**Body de creación de animal:**
```json
{
  "predioId": 1,
  "codigo": "A001",
  "nombre": "La Negra",
  "fechaNacimiento": "2023-05-15T00:00:00Z",
  "sexoKey": 1,
  "tipoIngresoId": 0,
  "configRazasId": 2,
  "potreroId": 3,
  "madreId": null,
  "codigoMadre": "",
  "padreId": null,
  "tipoPadreKey": 0,
  "precioCompra": 0,
  "pesoCompra": 0,
  "codigoRfid": "",
  "codigoArete": "E001234",
  "estadoAnimalKey": 0,
  "saludAnimalKey": 0
}
```

> **Convención de nomenclatura para DTOs:** todos los campos de request/response usan `camelCase` puro. La conversión a `snake_case` de columnas DB happens en el mapper de infraestructura. Ver §10.4.

---

### 7.5 Módulo `servicios`

#### Palpaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/servicios/palpaciones` | Listar eventos grupales | `?predioId&page&limit` |
| `GET` | `/servicios/palpaciones/:id` | Detalle de evento grupal con animales |
| `POST` | `/servicios/palpaciones` | Crear evento grupal | `{ predio_id, codigo, fecha, veterinarios_id, animales[] }` |
| `PUT` | `/servicios/palpaciones/:id` | Actualizar evento grupal |
| `POST` | `/servicios/palpaciones/:grupalId/animales` | Añadir animal a evento |
| `PUT` | `/servicios/palpaciones/animales/:id` | Actualizar resultado individual |
| `DELETE` | `/servicios/palpaciones/animales/:id` | Eliminar animal del evento |

**Body de animal en palpación:**
```json
{
  "animales_id": 5,
  "veterinarios_id": 1,
  "diagnosticos_veterinarios_id": 2,
  "config_condiciones_corporales_id": 3,
  "fecha": "2026-01-10T08:00:00Z",
  "dias_gestacion": 45,
  "fecha_parto": "2026-04-25T00:00:00Z",
  "comentarios": ""
}
```

#### Inseminaciones

Mismo patrón que palpaciones. Rutas: `/servicios/inseminaciones` y `/servicios/inseminaciones/:grupalId/animales`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/servicios/inseminaciones` | Listar eventos |
| `GET` | `/servicios/inseminaciones/:id` | Detalle |
| `POST` | `/servicios/inseminaciones` | Crear evento |
| `POST` | `/servicios/inseminaciones/:grupalId/animales` | Añadir animal |
| `PUT` | `/servicios/inseminaciones/animales/:id` | Actualizar |

#### Partos

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/servicios/partos` | Listar partos | `?predioId&page&limit` |
| `GET` | `/servicios/partos/:id` | Detalle de parto | — |
| `POST` | `/servicios/partos` | Registrar parto | `{ predio_id, animales_id, fecha, machos, hembras, muertos, tipo_parto_key }` |
| `PUT` | `/servicios/partos/:id` | Actualizar parto | — |

#### Servicios Veterinarios

Misma estructura que palpaciones. Rutas: `/servicios/veterinarios` y `/servicios/veterinarios/:grupalId/animales`

---

### 7.6 Módulo `maestros`

#### Veterinarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/maestros/veterinarios` | Listar | `?predioId` |
| `GET` | `/maestros/veterinarios/:id` | Obtener |
| `POST` | `/maestros/veterinarios` | Crear |
| `PUT` | `/maestros/veterinarios/:id` | Actualizar |
| `DELETE` | `/maestros/veterinarios/:id` | Desactivar |

#### Propietarios, Hierros, Diagnósticos, Motivos de Venta, Causas de Muerte, Lugares de Compra, Lugares de Venta

Patrón CRUD uniforme bajo `/maestros/{recurso}`:

| Recurso | Ruta base |
|---------|-----------|
| Propietarios | `/maestros/propietarios` |
| Hierros | `/maestros/hierros` |
| Diagnósticos veterinarios | `/maestros/diagnosticos` |
| Motivos de venta | `/maestros/motivos-ventas` |
| Causas de muerte | `/maestros/causas-muerte` |
| Lugares de compra | `/maestros/lugares-compras` |
| Lugares de venta | `/maestros/lugares-ventas` |

Todos soportan: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

---

### 7.7 Módulo `configuracion`

Catálogos de sistema. Algunos son de solo lectura (seed), otros son editables por el administrador.

| Método | Ruta | Descripción | Editable |
|--------|------|-------------|---------|
| `GET` | `/config/razas` | Listar razas | ✅ |
| `POST` | `/config/razas` | Crear raza | ✅ |
| `PUT` | `/config/razas/:id` | Actualizar raza | ✅ |
| `GET` | `/config/condiciones-corporales` | Listar condiciones | ✅ |
| `GET` | `/config/tipos-explotacion` | Listar tipos | ✅ |
| `GET` | `/config/calidad-animal` | Listar calidades | ✅ |
| `GET` | `/config/colores` | Listar colores | ✅ |
| `GET` | `/config/rangos-edades` | Listar rangos por sexo | 🔒 solo lectura |
| `GET` | `/config/key-values` | Listar key-values | 🔒 solo lectura |
| `GET` | `/config/key-values/:opcion` | Filtrar por opción (ej: `sexo`, `estado_animal`) | 🔒 solo lectura |

---

### 7.8 Módulo `imagenes`

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `POST` | `/imagenes/upload` | Subir imagen | `multipart/form-data`: `file`, `predioId`, `descripcion?` |
| `GET` | `/imagenes/:id` | Obtener metadata de imagen | — |
| `DELETE` | `/imagenes/:id` | Eliminar imagen | — |
| `GET` | `/imagenes/animal/:animalId` | Listar imágenes de un animal | — |
| `POST` | `/imagenes/animal/:animalId` | Asociar imagen a animal | `{ imagenId }` |
| `GET` | `/imagenes/producto/:productoId` | Listar imágenes de un producto | — |
| `POST` | `/imagenes/producto/:productoId` | Asociar imagen a producto | `{ imagenId }` |

**Límites:** tamaño máximo por imagen 5MB, formatos permitidos: `image/jpeg`, `image/png`, `image/webp`.

---

### 7.9 Módulo `productos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/productos` | Listar productos | `?predioId&tipo_producto_key` |
| `GET` | `/productos/:id` | Obtener producto |
| `POST` | `/productos` | Crear producto |
| `PUT` | `/productos/:id` | Actualizar producto |
| `DELETE` | `/productos/:id` | Desactivar producto |

---

## 8. Seguridad y Autenticación

### 8.1 Estrategia JWT

- **Access Token:** TTL de 15 minutos. Firmado con `HS256`. Payload: `{ sub: userId, roles: [], predioIds: number[], iat, exp }`. El campo `predioIds` contiene todos los predios a los que el usuario tiene acceso (del cual se selecciona el activo vía `X-Predio-Id`). El middleware `TenantContext` **obligatoriamente** valida que el `X-Predio-Id` del request esté presente en `predioIds` del token — si no coincide, responde `403 Forbidden`.
- **Refresh Token:** TTL de 7 días. Almacenado en tabla `Usuarios_Login` con flag `exitoso = true`. Rotación en cada uso (refresh token rotation).
- **Revocación:** Al hacer logout, el refresh token se marca como inactivo.

### 8.2 Flujo 2FA

```
POST /auth/login
    │
    ├─► (sin 2FA activo) → responde { accessToken, refreshToken }
    │
    └─► (con 2FA activo) → genera código OTP → envía por método configurado
                        → responde { requires2FA: true, tempToken }
                              │
                              ▼
                    POST /auth/2fa/verify
                              │
                              └─► (código válido) → responde { accessToken, refreshToken }
```

- Código OTP: 6 dígitos, TTL 5 minutos (campo `fecha_expiracion` en tabla).
- Métodos soportados: `email`, `sms` (según campo `metodo` en `Usuarios_Autenticacion_Dos_Factores`).
- Máximo 3 intentos fallidos antes de bloqueo temporal.

### 8.3 Control de Acceso (RBAC)

Los permisos siguen la convención `recurso:accion`, por ejemplo:

| Permiso | Descripción |
|---------|-------------|
| `animales:read` | Ver animales |
| `animales:write` | Crear/editar animales |
| `animales:delete` | Eliminar animales |
| `servicios:write` | Registrar servicios veterinarios |
| `usuarios:admin` | Gestionar usuarios y roles |
| `config:admin` | Modificar catálogos |

El middleware de autorización verifica el permiso requerido en cada ruta antes de llegar al controlador.

### 8.4 Historial de Contraseñas

- Al cambiar contraseña, se valida que la nueva no coincida con las últimas 5 contraseñas (tabla `Usuarios_Historial_Contrasenas`).
- Hash con `bcrypt`, cost factor `12`. **El salt NO se almacena por separado** — bcrypt embebe el salt automáticamente en el hash generado (`$2b$12$<22-char-salt><31-char-hash>`). El hash completo se almacena como string opaco en `Usuarios_Contrasena.contrasena_hash`. Si se requiere auditoría de cambios de contraseña, registrar el evento en `Usuarios_Historial_Contrasenas` (timestamp + userId) — sin tocar el material criptográfico.

### 8.5 Rate Limiting

- `/auth/login`: máximo 10 intentos por IP en ventana de 15 minutos.
- API general: 200 requests/minuto por token.
- Implementado con plugin `@fastify/rate-limit`.

---

## 9. Base de Datos y Drizzle ORM

### 9.1 Por qué Drizzle para GanaTrack

Drizzle ORM es **SQL-first y TypeScript-first**: el schema se define en TypeScript y Drizzle infiere todos los tipos directamente — sin paso de generación de cliente, sin tipos desincronizados. Para GanaTrack esto es especialmente valioso dado el esquema complejo con self-references (`animales.madre_id`, `animales.padre_id`) y 40+ tablas.

Ventajas clave sobre Prisma para este proyecto:

| Aspecto | Drizzle | Prisma |
|---------|---------|--------|
| Type-safety | Inferencia directa desde schema TS | Genera tipos en paso separado |
| SQLite → PostgreSQL | Mismo API, drivers intercambiables | Diferencias sutiles entre providers |
| Queries complejas | SQL nativo con type-safety | Abstracción que puede generar N+1 |
| Self-references | Soporte directo y explícito | Requiere configuración especial |
| Bundle size | ~7KB | ~2MB+ (cliente generado) |
| Transparencia | Ves exactamente el SQL ejecutado | SQL generado implícito |

### 9.2 Configuración Dual SQLite / PostgreSQL

El cliente se construye según la variable `DATABASE_PROVIDER`, sin cambios en el código de repositorios:

```typescript
// packages/database/src/client.ts
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePG }     from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres  from 'postgres'
import * as schema from './schema'

export type DbClient = ReturnType<typeof createClient>

export function createClient() {
  const provider = process.env.DATABASE_PROVIDER ?? 'sqlite'

  if (provider === 'sqlite') {
    const sqlite = new Database(process.env.DATABASE_URL ?? 'dev.db')
    return drizzleSQLite(sqlite, { schema })
  }

  const sql = postgres(process.env.DATABASE_URL!)
  return drizzlePG(sql, { schema })
}
```

Variables de entorno por ambiente:

```bash
# Desarrollo (SQLite)
DATABASE_PROVIDER=sqlite
DATABASE_URL=dev.db

# Producción (PostgreSQL)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@localhost:5432/ganatrack
```

### 9.2.1 Estrategia Dual Schema

Se mantiene **un único conjunto de archivos de schema** (`./src/schema/`) compatible con ambos motores. El `client.ts` selecciona el driver en runtime — el schema es el mismo.

```
packages/database/src/schema/
├── pg/                    # (deprecated — mantener solo para referencia durante transición)
├── sqlite/                # (deprecated — mantener solo para referencia durante transición)
└── schema/                # Schema unificado (fuente de verdad)
    ├── usuarios.ts
    ├── predios.ts
    ├── animales.ts
    └── ...
```

> Durante la transición, los subdirectorios `pg/` y `sqlite/` pueden existir como referencia temporal pero **no se usan activamente**. Una vez migrado el schema unificado, se eliminan.

**Regla:** al agregar una columna o tabla, se modifica el schema unificado y se asegura compatibilidad tanto con SQLite como con PostgreSQL. Si hay incompatibilidad de tipos, usar type-guard o cast explícito. Validar que ambos schemas sean compatibles en CI (ver `scripts/validate-schema-compat.ts`).

### 9.3 Definición de Schema (ejemplos representativos)

El schema completo vive en `packages/database/src/schema/`, un archivo por dominio.

```typescript
// packages/database/src/schema/animales.ts
import { sqliteTable, integer, text, real, index, unique } from 'drizzle-orm/sqlite-core'
import { predios }   from './predios'
import { potreros }  from './predios'
import { configRazas } from './configuracion'

export const animales = sqliteTable('animales', {
  id:                     integer('id').primaryKey({ autoIncrement: true }),
  predioId:               integer('predio_id').notNull().references(() => predios.id),
  codigo:                 text('codigo', { length: 20 }).notNull(),
  nombre:                 text('nombre', { length: 100 }).default(''),
  fechaNacimiento:       integer('fecha_nacimiento', { mode: 'timestamp' }),
  fechaCompra:           integer('fecha_compra',     { mode: 'timestamp' }),
  sexoKey:               integer('sexo_key').default(0),
  tipoIngresoId:         integer('tipo_ingreso_id').default(0),
  // Self-reference: madre y padre
  madreId:               integer('madre_id').references((): any => animales.id),
  codigoMadre:           text('codigo_madre').default(''),
  indTransferenciaEmb:   integer('ind_transferencia_embriones').default(0),
  codigoDonadora:        text('codigo_donadora').default(''),
  tipoPadreKey:          integer('tipo_padre_key').default(0),
  padreId:               integer('padre_id').references((): any => animales.id),
  codigoPadre:           text('codigo_padre').default(''),
  codigoPajuela:         text('codigo_pajuela').default(''),
  configRazasId:         integer('config_razas_id').references(() => configRazas.id),
  potreroId:             integer('potrero_id').references(() => potreros.id),
  precioCompra:          real('precio_compra').default(0),
  pesoCompra:            real('peso_compra').default(0),
  // NOTA: los nombres de columna en la DB usan snake_case puro (ej: 'codigo_rfid')
  // Los valores se mapean en el mapper de infraestructura, no en el schema
  codigoRfid:            text('codigo_rfid').default(''),
  codigoArete:           text('codigo_arete').default(''),
  codigoQr:              text('codigo_qr').default(''),
  saludAnimalKey:        integer('salud_animal_key').default(0),
  estadoAnimalKey:       integer('estado_animal_key').default(0),
  indDescartado:         integer('ind_descartado').default(0),
  activo:                integer('activo').default(1),
  createdAt:             integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:             integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  // UNIQUE constraint: un código de animal es único DENTRO de cada predio
  // Previene duplicados a nivel de DB — dos concurrent inserts fallará uno
  unique('uq_animales_predio_codigo').on(table.predioId, table.codigo),
  // Índice compuesto para filtrado por tenant + estado (paginación)
  index('idx_animales_predio_activo').on(table.predioId, table.activo),
])

// Tipos inferidos automáticamente — sin generación de cliente
export type Animal        = typeof animales.$inferSelect
export type NuevoAnimal   = typeof animales.$inferInsert
```

```typescript
// packages/database/src/schema/usuarios.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const usuarios = sqliteTable('usuarios', {   // tabla en snake_case minúsculas (ver convención)
  id:        integer('id').primaryKey({ autoIncrement: true }),
  nombre:    text('nombre', { length: 100 }).notNull(),
  email:     text('email',  { length: 100 }).notNull().unique(),
  createdAt: integer('created_at',  { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  activo:    integer('activo').default(1),
})

export type Usuario      = typeof usuarios.$inferSelect
export type NuevoUsuario = typeof usuarios.$inferInsert
```

**Tabla `usuarios_predios`** (relación many-to-many usuario ↔ predio):

```typescript
// packages/database/src/schema/usuarios.ts
import { unique } from 'drizzle-orm/sqlite-core'

export const usuariosPredios = sqliteTable('usuarios_predios', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  predioId:  integer('predio_id').notNull().references(() => predios.id),
  rolId:     integer('rol_id'),                     // opcional: rol específico en este predio
  activo:    integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  // Constraint: un usuario no puede estar asignado al mismo predio dos veces
  // Base para filtrar predioIds del JWT
  unique('uq_usuarios_predios').on(table.usuarioId, table.predioId),
])

export type UsuarioPredio = typeof usuariosPredios.$inferSelect
export type NuevoUsuarioPredio = typeof usuariosPredios.$inferInsert
```

### 9.4 Ejemplo de Repositorio con Drizzle

```typescript
// módulo animales/infrastructure/persistence/drizzle-animal.repository.ts
import { eq, and, desc } from 'drizzle-orm'
import { DbClient }      from '@ganatrack/database'
import { animales }      from '@ganatrack/database/schema'
import { IAnimalRepository } from '../../domain/repositories/animal.repository'
import { Animal as AnimalDomain } from '../../domain/entities/animal.entity'
import { AnimalMapper }  from '../mappers/animal.mapper'
import { TenantContext } from '../../../../shared/middleware/tenant-context' // injected dependency

export class DrizzleAnimalRepository implements IAnimalRepository {
  constructor(
    private readonly db: DbClient,
    private readonly tenantCtx: TenantContext,  // injectado por tsyringe
  ) {}

  private get predicates() {
    // фильтро obligatorio por tenant — NUNCA se hace query sin predioId
    return { activo: eq(animales.activo, 1), predioId: eq(animales.predioId, this.tenantCtx.predioId) }
  }

  async findById(id: number): Promise<AnimalDomain | null> {
    const [row] = await this.db
      .select()
      .from(animales)
      .where(and(eq(animales.id, id), this.predicates.predioId, this.predicates.activo))
      .limit(1)

    return row ? AnimalMapper.toDomain(row) : null
  }

  async findByPredio(predioId: number, opts: { page: number; limit: number }) {
    // El predioId del request DEBE coincidir con el del tenant context
    if (predioId !== this.tenantCtx.predioId) {
      throw new ForbiddenError('No tienes acceso a este predio')
    }
    return this.db
      .select()
      .from(animales)
      .where(and(this.predicates.predioId, this.predicates.activo))
      .orderBy(desc(animales.createdAt))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit)
  }
}
```

### 9.5 Migraciones con drizzle-kit

```typescript
// packages/database/drizzle.config.ts
import type { Config } from 'drizzle-kit'

const provider = process.env.DATABASE_PROVIDER ?? 'sqlite'

export default {
  schema:    './src/schema/index.ts',
  out:       './migrations',
  dialect:   provider === 'sqlite' ? 'sqlite' : 'postgresql',
  dbCredentials: provider === 'sqlite'
    ? { url: process.env.DATABASE_URL ?? 'dev.db' }
    : { url: process.env.DATABASE_URL! },
} satisfies Config
```

```bash
# Generar migración (compara schema TS con DB actual)
pnpm drizzle-kit generate

# Aplicar migraciones
pnpm drizzle-kit migrate

# Explorar datos con Drizzle Studio
pnpm drizzle-kit studio

# Push directo en desarrollo (sin archivos de migración)
pnpm drizzle-kit push
```

> **Convención:** en desarrollo usar `drizzle-kit push` para iteración rápida. En staging/producción usar siempre `generate` + `migrate` para tener historial de migraciones versionado en Git.

### 9.6 Convenciones Drizzle

- El schema TypeScript es la **fuente de verdad** — nunca editar SQL de migraciones a mano salvo casos excepcionales documentados.
- Soft delete via campo `activo integer().default(1)`. Se filtra con `eq(tabla.activo, 1)` en todos los repositorios — centralizado en un helper `whereActivo(tabla)`.
- El campo `activo` se incluye en **todas** las tablas, incluyendo tablas intermedias (`animales_imagenes`, `usuarios_roles`, `productos_imagenes`, etc.). Esto permite desactivar relaciones sin perder el historial.
- Los `_key` enumerados (`sexo_key`, `estado_animal_key`, etc.) se definen como constantes TypeScript en `packages/shared-types/src/enums/` para type-safety en la capa de dominio.
- Timestamps en SQLite: usar `integer({ mode: 'timestamp' })` — Drizzle serializa/deserializa `Date` automáticamente.
- En PostgreSQL: usar `timestamp('campo', { withTimezone: true })`.

### 9.7 Seed de Datos Obligatorios

```typescript
// packages/database/seed.ts
import { createClient } from './src/client'
import { configRangosEdades, configKeyValues } from './src/schema'

const db = createClient()

await db.insert(configRangosEdades).values([
  { id: 1, rango1: 1,    rango2: 240,   nombre: 'Ternero',         sexo: 0 },
  { id: 2, rango1: 241,  rango2: 365,   nombre: 'Novillo destete', sexo: 0 },
  // ... resto de rangos
]).onConflictDoNothing()

await db.insert(configKeyValues).values([
  { opcion: 'sexo',         key: 'Masculino', value: '0' },
  { opcion: 'sexo',         key: 'Femenino',  value: '1' },
  { opcion: 'estado_animal',key: 'Activo',    value: '0' },
  { opcion: 'estado_animal',key: 'Vendido',   value: '1' },
  { opcion: 'estado_animal',key: 'Muerto',    value: '2' },
  // ... resto de key-values
]).onConflictDoNothing()
```

El seed carga automáticamente:
- `config_rangos_edades` — 10 registros (ternero → toro / ternera → vaca)
- `config_key_values` — sexo, tipo_producto, salud_animal, estado_animal, tipo_padre, tipo_diagnostico, tipo_parto_key
- Usuario administrador inicial con rol `ADMIN`

---

## 10. Convenciones y Estándares

### 10.1 Estructura de Respuestas HTTP

**Éxito (200/201):**
```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "ANIMAL_NOT_FOUND",
    "message": "El animal con id 99 no existe",
    "details": []
  }
}
```

### 10.2 Códigos de Error del Dominio

| Código | HTTP | Descripción |
|--------|------|-------------|
| `UNAUTHORIZED` | 401 | Token ausente o inválido |
| `FORBIDDEN` | 403 | Sin permiso para el recurso |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 422 | Datos de entrada inválidos |
| `DUPLICATE_CODE` | 409 | Código ya existe en el predio |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `TWO_FA_REQUIRED` | 401 | Se requiere verificación 2FA (el cuerpo indica `requires2FA: true`) |
| `TWO_FA_INVALID` | 400 | Código 2FA incorrecto |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas solicitudes |

### 10.3 Paginación

Todos los endpoints de listado soportan:

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | int | 1 | Página actual |
| `limit` | int | 20 | Registros por página (max 100) |
| `sortBy` | string | `createdAt` | Campo de ordenamiento |
| `sortOrder` | `asc`/`desc` | `desc` | Dirección |

### 10.4 Naming Conventions

- **Archivos:** `kebab-case` (ej: `animal-repository.ts`)
- **Clases:** `PascalCase` (ej: `AnimalRepository`)
- **Interfaces:** prefijo `I` (ej: `IAnimalRepository`)
- **Rutas:** `kebab-case` plural (ej: `/animales`, `/servicios/palpaciones`)
- **Variables/funciones:** `camelCase`
- **Env vars:** `SCREAMING_SNAKE_CASE`

---

## 11. Variables de Entorno

```bash
# Servidor
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Base de datos
DATABASE_PROVIDER=sqlite
DATABASE_URL=dev.db

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 2FA
TWO_FA_CODE_TTL_MINUTES=5
TWO_FA_MAX_ATTEMPTS=3

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5

# Rate Limiting
RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_API_MAX=200
RATE_LIMIT_API_WINDOW_MS=60000

# Alertas — umbrales por defecto
ALERTA_PARTO_DIAS_ANTICIPACION=7
ALERTA_CELO_DIAS_ANTICIPACION=5
ALERTA_ANIMAL_ENFERMO_SIN_ATENCION_DIAS=3

# Email
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USER=noreply@ganatrack.com
SMTP_PASS=secreto
EMAIL_FROM="GanaTrack <noreply@ganatrack.com>"

# Push (Firebase)
FIREBASE_PROJECT_ID=ganatrack-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@ganatrack.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Logger
LOG_LEVEL=info
```

---

## 12. Módulo de Reportes y Estadísticas

### 12.1 Visión General

El módulo de reportes entrega datos en tres formatos: **JSON** (para que el frontend renderice gráficas), **PDF** (descarga con diseño corporativo) y **Excel/CSV** (para análisis externo). La generación de PDF usará `pdfkit` con streaming directo a la response de Fastify y la de Excel usará `exceljs`.

Todos los reportes son **sincrónicos para volúmenes pequeños** (< 1.000 animales). Para exportaciones pesadas se encolan como jobs asincrónicos y el cliente polling consulta el estado.

### 12.2 Nuevas Tablas Requeridas

Se deben agregar al schema Drizzle como TypeScript (en `packages/database/src/schema/reportes.ts`):

```typescript
// packages/database/src/schema/reportes.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { predios } from './predios'
import { usuarios } from './usuarios'

export const reportesExportaciones = sqliteTable('reportes_exportaciones', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  predioId:   integer('predio_id').notNull()
    .references(() => predios.id),           // ON DELETE RESTRICT (nunca hacer cascade)
  usuarioId:  integer('usuario_id').notNull()
    .references(() => usuarios.id),          // ON DELETE RESTRICT
  tipo:       text('tipo', { length: 50 }).notNull(),    // inventario|reproductivo|mortalidad|movimiento|sanitario
  formato:    text('formato', { length: 10 }).notNull(), // json|pdf|xlsx|csv
  estado:     text('estado', { length: 20 }).notNull().default('pendiente'), // pendiente|procesando|listo|error
  rutaArchivo: text('ruta_archivo'),
  parametros: text('parametros'),            // JSON string con filtros aplicados
  createdAt:  integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo:     integer('activo').default(1),
})

export type ReporteExportacion    = typeof reportesExportaciones.$inferSelect
export type NuevoReporteExportacion = typeof reportesExportaciones.$inferInsert
```

> **Nota de diseño:** se usa `ON DELETE RESTRICT` (Drizzle no genera cascade automático para soft-delete) para evitar que un hard-delete accidental borre el historial de exportaciones. La eliminación de registros se hace exclusivamente via soft-delete (`activo = 0`).

### 12.3 Stack de Generación

| Formato | Librería | Notas |
|---------|----------|-------|
| JSON | Drizzle + agregaciones | Respuesta directa |
| PDF | `pdfkit` | Streaming directo a Fastify reply o archivo en disco |
| Excel | `exceljs` | `.xlsx` con hojas y estilos |
| CSV | `fast-csv` | Stream directo al response |

### 12.4 Endpoints del Módulo `reportes`

> Prefijo: `/api/v1/reportes`
> Permiso requerido: `reportes:read`

#### 12.4.1 Inventario de Animales

Conteo de animales activos agrupados por categoría (rangos de edad × sexo según `config_rangos_edades`), potrero, raza y estado.

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/reportes/inventario` | Inventario en JSON | `?predioId&fecha&potreroId&razaId` |
| `GET` | `/reportes/inventario/export` | Exportar inventario | `?formato=pdf\|xlsx\|csv&predioId&fecha` |

**Respuesta JSON (`/reportes/inventario`):**
```json
{
  "success": true,
  "data": {
    "fecha_corte": "2026-03-26",
    "total_animales": 312,
    "por_categoria": [
      { "categoria": "Ternero",       "sexo": "M", "cantidad": 42 },
      { "categoria": "Novillo destete","sexo": "M", "cantidad": 38 },
      { "categoria": "Novillo levante","sexo": "M", "cantidad": 25 },
      { "categoria": "Novillo Ceba",  "sexo": "M", "cantidad": 60 },
      { "categoria": "Toro",          "sexo": "M", "cantidad": 8  },
      { "categoria": "Ternera",       "sexo": "F", "cantidad": 40 },
      { "categoria": "Novilla destete","sexo": "F", "cantidad": 35 },
      { "categoria": "Novilla levante","sexo": "F", "cantidad": 28 },
      { "categoria": "Novilla vientre","sexo": "F", "cantidad": 22 },
      { "categoria": "Vaca",          "sexo": "F", "cantidad": 14 }
    ],
    "por_potrero": [
      { "potrero": "P001 - Norte", "cantidad": 80 }
    ],
    "por_raza": [
      { "raza": "Brahman", "cantidad": 150 }
    ]
  }
}
```

#### 12.4.2 Productividad Reproductiva

Indicadores del ciclo reproductivo en un rango de fechas: tasa de preñez, partos efectivos, distribución por tipo de parto, y eficiencia de inseminación.

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/reportes/reproductivo` | Indicadores en JSON | `?predioId&fechaInicio&fechaFin` |
| `GET` | `/reportes/reproductivo/export` | Exportar | `?formato=pdf\|xlsx\|csv` |

**Métricas calculadas:**

| Métrica | Cálculo |
|---------|---------|
| `tasa_prenez_pct` | (hembras preñadas / hembras palpadas) × 100 |
| `tasa_partos_pct` | (partos efectivos / hembras gestantes) × 100 |
| `tasa_mortalidad_neonatal_pct` | (terneros muertos al parto / total nacidos) × 100 |
| `promedio_dias_gestacion` | AVG(dias_gestacion) de palpaciones positivas |
| `eficiencia_inseminacion_pct` | (inseminaciones que resultaron preñez / total inseminaciones) × 100 |
| `distribucion_tipo_parto` | conteo por `tipo_parto_key` (Normal, Con Ayuda, Distócico, Mortinato) |

#### 12.4.3 Mortalidad

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/reportes/mortalidad` | Muertes en JSON | `?predioId&fechaInicio&fechaFin&causaId` |
| `GET` | `/reportes/mortalidad/export` | Exportar | `?formato=pdf\|xlsx\|csv` |

**Métricas:** total muertes por período, agrupación por `causas_muerte`, por categoría de edad, por potrero. Tasa de mortalidad = (muertes / inventario promedio del período) × 100.

#### 12.4.4 Movimiento de Animales (Compras y Ventas)

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/reportes/movimiento` | Flujo compras/ventas JSON | `?predioId&fechaInicio&fechaFin` |
| `GET` | `/reportes/movimiento/export` | Exportar | `?formato=pdf\|xlsx\|csv` |

**Métricas:** ingresos por compra (cantidad + valor), egresos por venta (cantidad + valor + lugar), saldo neto del período, precio promedio de compra/venta por categoría.

#### 12.4.5 Indicadores Sanitarios

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/reportes/sanitario` | Indicadores sanitarios JSON | `?predioId&fechaInicio&fechaFin&veterinarioId` |
| `GET` | `/reportes/sanitario/export` | Exportar | `?formato=pdf\|xlsx\|csv` |

**Métricas:** servicios veterinarios por tipo de diagnóstico, animales tratados vs. total, frecuencia de intervenciones por veterinario, animales con estado `salud_animal_key = 1` (enfermos) activos.

#### 12.4.6 Gestión de Exportaciones Asincrónicas

Para exportaciones de datasets grandes (> 1.000 registros) el sistema encola el job y devuelve un `exportacionId` para polling.

**Tecnología de cola de jobs:** se usa **BullMQ + Redis** como cola de trabajos asincrónicos. En desarrollo sin Redis, se usa un适配器 de cola en memoria solo para testing (`DummyQueueAdapter`).

> **Alternativa para desarrollo:** si Redis no está disponible, usar `in-memory` job queue con `export type JobQueue = BullMQ | InMemoryQueue`. La interfaz es la misma; el adapter se swappea via tsyringe injection token `JOB_QUEUE`.

**Configuración de jobs (BullMQ):**
```typescript
// Worker de exportación — procesa en segundo plano
{
  name: 'generate-report',
  data: { exportacionId, tipo, formato, filtros, idioma },
  opts: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },  // conserva últimos 100 jobs completados
    removeOnFail: { count: 500 },
    jobId: `report-${exportacionId}`, // idempotency key
  }
}
```

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/reportes/exportaciones` | Listar exportaciones del usuario |
| `GET` | `/reportes/exportaciones/:id` | Estado de una exportación |
| `GET` | `/reportes/exportaciones/:id/download` | Descargar archivo generado |
| `DELETE` | `/reportes/exportaciones/:id` | Eliminar exportación |

**Flujo asincrónico:**
```
POST /reportes/inventario/export?formato=xlsx
    │
    ├─► (< 1.000 animales) → genera y responde con stream directo (Content-Disposition: attachment)
    │
    └─► (≥ 1.000 animales) → JobQueue.enqueue('generate-report', { exportacionId, ... })
                           → responde { exportacionId, estado: 'pendiente' }
                                  │
                                  ▼
                      Job Worker procesa async (retry 3x si falla)
                                  │
                                  ▼
                      JobQueue.on('completed') → actualiza estado='listo', ruta_archivo
                                  │
                                  ▼
                      GET /reportes/exportaciones/:id  ← cliente hace polling
                                  │
                          estado = 'listo'
                                  │
                                  ▼
                      GET /reportes/exportaciones/:id/download
```

**Dead letter y limpieza:** jobs que fallan 3 veces quedan en estado `failed` y se marcan `activo=0` en `reportes_exportaciones`. Un cron diario (`0 3 * * *`) limpia archivos en disco mayores a 30 días.

### 12.5 Nuevos Permisos RBAC

| Permiso | Descripción |
|---------|-------------|
| `reportes:read` | Consultar reportes en JSON |
| `reportes:export` | Generar exportaciones PDF/Excel/CSV |

---

## 13. Módulo de Notificaciones y Alertas

### 13.1 Estrategia de Generación: Cron + Trigger

Se adopta **arquitectura dual** para máxima cobertura:

- **Cron Job diario** (00:30 AM): evalúa todas las alertas de manera global y genera notificaciones pendientes para el día. Implementado con `node-cron`.
- **Trigger en escritura**: al guardar una palpación, inseminación o servicio veterinario, se evalúan en tiempo real las alertas relacionadas con ese animal específico. Esto garantiza que las alertas aparezcan inmediatamente sin esperar al cron nocturno.

```
Escritura de palpación/servicio
        │
        ▼
[Use Case] → [AlertaService.evaluarAnimal(animalId)]
        │
        └─► genera NotificacionEntity si aplica
        │
        ▼
[NotificacionRepository.guardar()]
        │
        └─► [NotificacionDispatcher] ──► In-App (DB)
                                    ──► Email (cola)
                                    ──► Push (cola)
```

### 13.2 Nuevas Tablas Requeridas

Se definen como esquemas Drizzle TypeScript en `packages/database/src/schema/notificaciones.ts`:

```typescript
// packages/database/src/schema/notificaciones.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { predios } from './predios'
import { usuarios } from './usuarios'

// --- Notificaciones generadas ---
export const notificaciones = sqliteTable('notificaciones', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  predioId:     integer('predio_id').notNull()
    .references(() => predios.id),            // ON DELETE RESTRICT
  usuarioId:    integer('usuario_id')
    .references(() => usuarios.id),         // ON DELETE SET NULL
  tipo:         text('tipo', { length: 50 }).notNull(),  // ver §13.3
  titulo:       text('titulo', { length: 200 }).notNull(),
  mensaje:      text('mensaje').notNull(),
  entidadTipo:  text('entidad_tipo', { length: 50 }),     // 'animal'|'servicio'|etc.
  entidadId:    integer('entidad_id'),
  leida:        integer('leida').default(0),
  fechaEvento:  integer('fecha_evento', { mode: 'timestamp' }),
  createdAt:    integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo:       integer('activo').default(1),
})

export type Notificacion    = typeof notificaciones.$inferSelect
export type NuevaNotificacion = typeof notificaciones.$inferInsert

// --- Preferencias de notificación por usuario ---
export const notificacionesPreferencias = sqliteTable('notificaciones_preferencias', {
  id:               integer('id').primaryKey({ autoIncrement: true }),
  usuarioId:        integer('usuario_id').notNull()
    .references(() => usuarios.id),       // ON DELETE CASCADE
  tipo:             text('tipo', { length: 50 }).notNull(),
  canalInapp:       integer('canal_inapp').default(1),
  canalEmail:       integer('canal_email').default(1),
  canalPush:        integer('canal_push').default(0),
  diasAnticipacion: integer('dias_anticipacion').default(7),
  activo:           integer('activo').default(1),
  // unique(usuario_id, tipo) → se define como índice único en la sección de índices
})

export type NotificacionPreferencia = typeof notificacionesPreferencias.$inferSelect

// --- Tokens de dispositivo para push notifications ---
export const notificacionesPushTokens = sqliteTable('notificaciones_push_tokens', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  usuarioId:   integer('usuario_id').notNull()
    .references(() => usuarios.id),      // ON DELETE CASCADE
  token:       text('token', { length: 500 }).notNull(),
  plataforma:  text('plataforma', { length: 20 }).notNull(), // 'android'|'ios'|'web'
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo:      integer('activo').default(1),
  // unique(usuario_id, token) → se define como índice único
})

export type NotificacionPushToken = typeof notificacionesPushTokens.$inferSelect
```

> **FK y soft-delete:** se usa `ON DELETE RESTRICT` para `predio_id` (nunca borrar cascade) y `ON DELETE SET NULL` para `usuario_id`. La tabla de preferencias y tokens usa `ON DELETE CASCADE` porque si se elimina un usuario, sus preferencias y tokens de push no tienen sentido.

### 13.3 Tipos de Alerta

| Tipo (`tipo`) | Descripción | Trigger | Origen de datos |
|---------------|-------------|---------|-----------------|
| `PARTO_PROXIMO` | Parto estimado en N días | Cron + al guardar palpación | `servicios_palpaciones_animales.fecha_parto` |
| `CELO_ESTIMADO` | Celo esperado (21 días post-parto o post-servicio fallido) | Cron + al guardar parto/inseminación | Calculado desde `servicios_partos_animales.fecha` |
| `INSEMINACION_PENDIENTE` | Animal con diagnóstico reproductivo pendiente de servicio | Cron diario | `servicios_palpaciones_animales` sin inseminación posterior |
| `VACUNA_PENDIENTE` | Tratamiento veterinario programado próximo a vencer | Cron + al guardar servicio veterinario | `servicios_veterinarios_animales` con `tipo_diagnostico_key` de vitaminas |
| `ANIMAL_ENFERMO` | Animal con `salud_animal_key = 1` sin servicio veterinario en últimos N días | Cron diario | `animales.salud_animal_key` + `servicios_veterinarios_animales` |

### 13.4 Lógica de Evaluación por Tipo

#### PARTO_PROXIMO
```
Para cada palpación activa con fecha_parto IS NOT NULL:
  dias_restantes = fecha_parto - HOY
  si dias_restantes IN (dias_anticipacion, 3, 1):
    crear notificación si no existe una del mismo tipo/animal/día
```

#### CELO_ESTIMADO
```
Para cada parto registrado:
  fecha_celo_estimado = fecha_parto + 21 días
  si dias_restantes hasta fecha_celo_estimado IN (dias_anticipacion, 3, 1):
    crear notificación

Para cada inseminación sin preñez confirmada (palpación negativa posterior):
  fecha_celo_estimado = fecha_inseminacion + 21 días
  si aplica → crear notificación
```

#### VACUNA_PENDIENTE
```
Para cada servicios_veterinarios_animales con tipo_diagnostico_key = 1 (Vitaminas):
  si tiene campo de próxima aplicación programada (parametros del predio):
    calcular fecha_proxima = fecha_servicio + intervalo_dias (config_parametros)
    si dias_restantes IN (dias_anticipacion, 3, 1):
      crear notificación
```

#### ANIMAL_ENFERMO
```
Para cada animal con salud_animal_key = 1:
  ultimo_servicio = MAX(fecha) de servicios_veterinarios_animales donde animales_id = animal.id
  si ultimo_servicio IS NULL OR (HOY - ultimo_servicio) > umbral_dias_sin_atencion:
    crear notificación (máximo 1 por animal por día)
```

### 13.5 Canales de Entrega

#### In-App
Las notificaciones se persisten en la tabla `notificaciones`. El frontend hace polling o puede usar SSE (Server-Sent Events) para recibirlas en tiempo real.

#### Email
Se encola en un job con `nodemailer`. El backend no envía directamente desde el request — usa una cola en memoria (o `bull` si se escala) para reintentos.

#### Push Notifications
Se integra con **Firebase Cloud Messaging (FCM)** usando el paquete `firebase-admin`. Los tokens de dispositivo se registran en `notificaciones_push_tokens`.

### 13.6 Endpoints del Módulo `notificaciones`

> Prefijo: `/api/v1/notificaciones`

| Método | Ruta | Descripción | Params clave |
|--------|------|-------------|--------------|
| `GET` | `/notificaciones` | Listar notificaciones del usuario | `?leida=0\|1&tipo&page&limit` |
| `GET` | `/notificaciones/resumen` | Conteo de no leídas por tipo | — |
| `PATCH` | `/notificaciones/:id/leer` | Marcar como leída | — |
| `PATCH` | `/notificaciones/leer-todas` | Marcar todas como leídas | — |
| `DELETE` | `/notificaciones/:id` | Eliminar notificación | — |
| `GET` | `/notificaciones/preferencias` | Ver preferencias del usuario | — |
| `PUT` | `/notificaciones/preferencias/:tipo` | Actualizar preferencias por tipo | `{ canal_inapp, canal_email, canal_push, dias_anticipacion }` |
| `POST` | `/notificaciones/push-tokens` | Registrar token de dispositivo | `{ token, plataforma }` |
| `DELETE` | `/notificaciones/push-tokens/:token` | Eliminar token (logout dispositivo) | — |
| `POST` | `/notificaciones/alertas/evaluar` | Forzar evaluación manual (admin) | `?predioId` |

**Respuesta `/notificaciones/resumen`:**
```json
{
  "success": true,
  "data": {
    "total_no_leidas": 12,
    "por_tipo": [
      { "tipo": "PARTO_PROXIMO",         "cantidad": 4 },
      { "tipo": "CELO_ESTIMADO",         "cantidad": 3 },
      { "tipo": "VACUNA_PENDIENTE",      "cantidad": 3 },
      { "tipo": "ANIMAL_ENFERMO",        "cantidad": 2 }
    ]
  }
}
```

**Respuesta `/notificaciones`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "tipo": "PARTO_PROXIMO",
      "titulo": "Parto próximo — Animal A045",
      "mensaje": "La vaca A045 tiene parto estimado en 3 días (29/03/2026).",
      "entidad_tipo": "animal",
      "entidad_id": 45,
      "leida": 0,
      "fecha_evento": "2026-03-29T00:00:00Z",
      "created_at": "2026-03-26T00:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12 }
}
```

### 13.7 Arquitectura del Job de Alertas

```
node-cron ('30 0 * * *')          ← dispara a las 00:30 AM diario
        │
        ▼
AlertaSchedulerService
        │
        ├─► evaluarPartosProximos(predioId)
        ├─► evaluarCelosEstimados(predioId)
        ├─► evaluarInseminacionesPendientes(predioId)
        ├─► evaluarVacunasPendientes(predioId)
        └─► evaluarAnimalesEnfermos(predioId)
                │
                ▼ (por cada alerta encontrada)
        NotificacionService.crear(notificacion)
                │
                ├─► [InAppAdapter]   → INSERT notificaciones
                ├─► [EmailAdapter]   → encolar job nodemailer
                └─► [PushAdapter]    → encolar job FCM
```

### 13.8 Variables de Entorno Adicionales

```bash
# Alertas — umbrales por defecto (sobrescribibles por preferencias de usuario)
ALERTA_PARTO_DIAS_ANTICIPACION=7
ALERTA_CELO_DIAS_ANTICIPACION=5
ALERTA_ANIMAL_ENFERMO_SIN_ATENCION_DIAS=3

# Email
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USER=noreply@ganatrack.com
SMTP_PASS=secreto
EMAIL_FROM="GanaTrack <noreply@ganatrack.com>"

# Push (Firebase)
FIREBASE_PROJECT_ID=ganatrack-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@ganatrack.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 13.9 Nuevos Permisos RBAC

| Permiso | Descripción |
|---------|-------------|
| `notificaciones:read` | Ver propias notificaciones |
| `notificaciones:admin` | Forzar evaluación de alertas, ver todas |

---

## 14. Roadmap de Implementación

### Fase 1 — Fundación (Semanas 1–2)
- Configurar monorepo Turborepo con pnpm workspaces
- Setup TypeScript + ESLint + Prettier + Vitest
- Crear `packages/database` con schema Drizzle completo (todas las tablas incluyendo notificaciones y exportaciones)
- Configurar `drizzle.config.ts` para SQLite (dev) y PostgreSQL (prod)
- Ejecutar seed inicial con catálogos y usuario admin
- Implementar módulo `auth` completo (login, JWT, 2FA, refresh)
- Módulo `usuarios` con RBAC básico
- Configurar Vitest con cobertura para `packages/` y `apps/api/`
- Establecer estrategia de testing: unitarios (domain services con mocks), integración (SQLite real), e2e (Fastify inject)
- Tests unitarios obligatorios para cada caso de uso implementado desde Fase 1

### Fase 2 — Núcleo de Negocio (Semanas 3–4)
- Módulo `predios` (predio, potreros, sectores, lotes, grupos)
- Módulo `configuracion` (catálogos + seed)
- Módulo `maestros` (veterinarios, propietarios, hierros, diagnósticos, motivos)
- Módulo `animales` (registro completo + árbol genealógico)

### Fase 3 — Servicios y Media (Semanas 5–6)
- Módulo `servicios` (palpaciones, inseminaciones, partos, veterinarios)
- Módulo `imagenes` (upload, asociación a animales/productos)
- Módulo `productos`

### Fase 4 — Reportes (Semanas 7–8)
- Módulo `reportes`: endpoints JSON para los 5 reportes
- Generación de PDF con `pdfkit` (inventario + reproductivo primero)
- Generación de Excel/CSV con `exceljs` y `fast-csv`
- Implementar flujo asincrónico con polling para exportaciones grandes
- Tabla `reportes_exportaciones` + limpieza periódica de archivos

### Fase 5 — Notificaciones y Alertas (Semanas 9–10)
- Tablas `notificaciones`, `notificaciones_preferencias`, `notificaciones_push_tokens`
- `AlertaSchedulerService` con `node-cron` para los 5 tipos de alerta
- Triggers en escritura (palpaciones, partos, servicios veterinarios)
- Canal In-App + endpoints de gestión de notificaciones
- Canal Email con `nodemailer` y cola de reintentos
- Canal Push con `firebase-admin` (FCM)
- Endpoint SSE opcional para notificaciones en tiempo real

### Fase 6 — Calidad y Producción (Semanas 11–12)
- Cobertura de tests unitarios en casos de uso (objetivo: 80%)
- Tests de integración en rutas críticas y jobs de alertas
- Documentación Swagger/OpenAPI auto-generada con `@fastify/swagger`
- Validación de migración completa a PostgreSQL con `drizzle-kit migrate`
- Hardening de seguridad (headers, CORS, rate limiting en producción)
- Monitoreo con Pino + integración opcional con Sentry
- Drizzle Studio habilitado en entornos de desarrollo/staging para inspección de datos

---

*Documento generado para el equipo de desarrollo de GanaTrack. Versión sujeta a revisión según evolución del producto.*
