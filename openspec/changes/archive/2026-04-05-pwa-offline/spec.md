# Spec: PWA Offline — GanaTrack

## Requisito PWA-01: Query Persistence Offline

**DEBE** persistir el cache de TanStack Query en IndexedDB para que los datos sobrevivan a recargas de página y cierres del navegador mientras está offline.

### Escenarios

**Scenario 1: Recarga offline**
- **DADO** que el usuario tiene datos en cache (lista de animales)
- **CUANDO** pierde conexión y recarga la página (F5)
- **ENTONCES** los datos del cache persisten y se muestran inmediatamente
- **Y** no aparecen pantallas vacías ni errores de red

**Scenario 2: Cierre y reapertura offline**
- **DADO** que el usuario trabajó online y cerró la app
- **CUANDO** la reabre en zona sin conectividad
- **ENTONCES** los datos cacheados están disponibles
- **Y** el staleTime determina si se intenta refetch (falla silenciosamente si offline)

**Scenario 3: Cache expirado**
- **DADO** que el cache tiene maxAge de 24h
- **CUANDO** pasan más de 24h sin conexión
- **ENTONCES** el cache se invalida y se purga
- **Y** la app muestra estado vacío con mensaje claro

---

## Requisito PWA-02: Refresh-Before-Replay en Background Sync

**DEBE** refrescar el token de acceso antes de reenviar mutations encoladas por BackgroundSync.

### Escenarios

**Scenario 1: Token expirado durante offline**
- **DADO** que el usuario creó un animal offline (mutation encolada)
- **Y** el accessToken expiró (15min TTL)
- **CUANDO** la conexión regresa
- **ENTONCES** el SW llama POST /auth/refresh ANTES de reenviar el POST /animales
- **Y** el replay exitoso usa el nuevo token

**Scenario 2: Refresh token también expirado**
- **DADO** que el usuario estuvo offline > 7 días (refresh token expirado)
- **CUANDO** la conexión regresa y el SW intenta refresh
- **ENTONCES** el refresh falla con 401
- **Y** la mutation se mueve a `failed-sync` queue
- **Y** la app muestra banner: "Hay cambios que no pudieron sincronizarse"

**Scenario 3: Múltiples mutations encoladas**
- **DADO** que hay 5 mutations encoladas (POST, PUT, DELETE)
- **CUANDO** la conexión regresa
- **ENTONCES** el SW refresca el token UNA VEZ
- **Y** reenvía las 5 mutations con el nuevo token
- **Y** si alguna falla individualmente, las demás continúan

---

## Requisito PWA-03: Resolución de Conflictos

**DEBE** manejar conflictos que surgen al reenviar mutations offline contra datos que cambiaron en el servidor.

### Escenarios

**Scenario 1: Entidad eliminada (404)**
- **DADO** que el usuario editó un animal offline
- **Y** otro usuario eliminó ese animal en el servidor
- **CUANDO** el SW reenvía el PUT y recibe 404
- **ENTONCES** descarta la mutation silenciosamente
- **Y** notifica al usuario: "El animal fue eliminado por otro usuario"

**Scenario 2: Conflicto de versión (409)**
- **DADO** que el usuario editó el nombre del animal offline ("Vaca A")
- **Y** otro usuario editó el mismo campo en el servidor ("Vaca B")
- **CUANDO** el SW reenvía el PUT y recibe 409
- **ENTONCES** guarda la mutation en `conflict-queue`
- **Y** la app muestra modal con diff lado-a-lado
- **Y** el usuario elige qué versión conservar

**Scenario 3: Validación fallida (400)**
- **DADO** que el usuario creó un animal offline con código duplicado
- **CUANDO** el SW reenvía el POST y recibe 400
- **ENTONCES** guarda en `failed-sync` queue con mensaje de error
- **Y** la app muestra el error en la página de sincronización

---

## Requisito PWA-04: Página de Sincronización

**DEBE** proveer una página `/sincronizacion` donde el usuario puede ver y resolver items pendientes de sincronización.

### Escenarios

**Scenario 1: Ver items pendientes**
- **DADO** que hay 3 items en `failed-sync` queue y 1 en `conflict-queue`
- **CUANDO** el usuario navega a `/sincronizacion`
- **ENTONCES** ve una lista con 4 items
- **Y** cada item muestra: timestamp, método HTTP, entidad afectada, razón del fallo

**Scenario 2: Resolver conflicto 409**
- **DADO** que hay un conflicto de versión en el modal
- **CUANDO** el usuario elige "Mantener mi versión"
- **ENTONCES** se envía PUT con flag `force: true`
- **Y** el item se elimina de la cola si es exitoso
- **CUANDO** el usuario elige "Aceptar versión servidor"
- **ENTONCES** se descarta la mutation local
- **Y** el item se elimina de la cola

**Scenario 3: Descartar item fallido**
- **DADO** que hay un item en `failed-sync` queue
- **CUANDO** el usuario hace click en "Descartar"
- **ENTONCES** se elimina de la cola
- **Y** se muestra confirmación antes de eliminar

---

## Requisito PWA-05: Offline Fallback Page

**DEBE** mostrar una página de fallback cuando el usuario accede a una ruta no cacheada offline.

### Escenarios

**Scenario 1: Ruta no cacheada offline**
- **DADO** que el usuario está offline
- **Y** nunca visitó `/reportes/exportaciones` (no está en cache)
- **CUANDO** navega a esa ruta
- **ENTONCES** ve la página offline con mensaje: "Esta página no está disponible sin conexión"
- **Y** ve un botón "Reintentar"
- **Y** ve links a secciones disponibles offline

---

## Requisito PWA-06: Manifest Completo

**DEBE** tener un manifest.json completo que pase la auditoría PWA de Lighthouse (> 90 score).

### Criterios

- `name`, `short_name`, `description` ✅ (ya existe)
- `start_url`, `display: standalone` ✅ (ya existe)
- `icons` 192px + 512px con `maskable` ✅ (ya existe)
- `lang: "es"` — AGREGAR
- `shortcuts` — AGREGAR (Dashboard, Animales, Nuevo Animal)
- `screenshots` — AGREGAR (para install prompt)
- `categories` — AGREGAR
- `theme_color`, `background_color` ✅ (ya existe)

---

## Requisito PWA-07: Banner de Sincronización Pendiente

**DEBE** mostrar un banner persistente en el header cuando hay items en la cola de sincronización fallida.

### Escenarios

**Scenario 1: Items pendientes**
- **DADO** que `failed-sync` queue tiene 2 items
- **CUANDO** el usuario abre la app (online o offline)
- **ENTONCES** ve un banner: "Hay 2 cambios que requieren tu atención [Ver todo]"
- **Y** "Ver todo" lleva a `/sincronizacion`

**Scenario 2: Sin items pendientes**
- **DADO** que todas las mutations se sincronizaron exitosamente
- **CUANDO** el usuario abre la app
- **ENTONCES** NO hay banner
