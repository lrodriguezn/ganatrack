# Delta Spec: E2E Testing con Playwright

## Overview

Especificación de tests E2E para los 10 flujos críticos de GanaTrack usando Playwright. Los tests corren contra MSW mocks con credenciales predefinidas.

### Credenciales MSW para Tests

| Email | Password | Comportamiento |
|-------|----------|----------------|
| `admin@ganatrack.com` | `password123` | Login directo (sin 2FA) |
| `2fa@ganatrack.com` | `password123` | Requiere 2FA, código OTP: `123456` |
| `invalid@ganatrack.com` | `wrongpass` | Credenciales inválidas (401) |

### Configuración de Proyectos Playwright

| Project | Viewport | User Agent | Uso |
|---------|----------|------------|-----|
| chromium | 1280x720 | Desktop Chrome | Tests desktop |
| firefox | 1280x720 | Desktop Firefox | Smoke tests |
| mobile-chrome | 375x667 | Pixel 5 | Tests mobile |
| mobile-safari | 375x812 | iPhone 13 | Tests iOS |

---

## Requirement E2E-01: Login Completo

### Scenario: Login exitoso con credenciales válidas
**GIVEN** el usuario navega a la página de login (`/login`)
**WHEN** ingresa email `admin@ganatrack.com` y password `password123`
**AND** hace click en el botón "Iniciar Sesión"
**THEN** es redirigido al dashboard (`/dashboard`)
**AND** el header muestra el nombre "Admin Ganatrack"
**AND** el sidebar muestra los módulos principales (Animales, Servicios, Reportes)

### Scenario: Login con credenciales inválidas
**GIVEN** el usuario navega a la página de login
**WHEN** ingresa email `invalid@ganatrack.com` y password `wrongpass`
**AND** hace click en "Iniciar Sesión"
**THEN** se muestra mensaje de error "Credenciales inválidas"
**AND** permanece en la página de login
**AND** el campo de password se limpia automáticamente

### Scenario: Login con campos vacíos
**GIVEN** el usuario navega a la página de login
**WHEN** hace click en "Iniciar Sesión" sin ingresar credenciales
**THEN** se muestran mensajes de validación "El email es requerido" y "La contraseña es requerida"
**AND** no se envía request al servidor

### Scenario: Login con email mal formateado
**GIVEN** el usuario navega a la página de login
**WHEN** ingresa email `not-an-email` y cualquier password
**THEN** se muestra mensaje de validación "Formato de email inválido"
**AND** el botón "Iniciar Sesión" permanece deshabilitado

---

## Requirement E2E-02: Login + 2FA

### Scenario: Flujo completo de login con 2FA
**GIVEN** el usuario navega a la página de login
**WHEN** ingresa email `2fa@ganatrack.com` y password `password123`
**AND** hace click en "Iniciar Sesión"
**THEN** es redirigido a la página de verificación 2FA (`/auth/2fa`)
**AND** se muestra el campo para ingresar código OTP
**WHEN** ingresa código `123456` y confirma
**THEN** es redirigido al dashboard
**AND** la sesión está activa con token de acceso

### Scenario: 2FA con código inválido
**GIVEN** el usuario está en la página de verificación 2FA
**WHEN** ingresa código `000000` (código incorrecto)
**AND** confirma el código
**THEN** se muestra error "Código inválido"
**AND** el campo de código se limpia
**AND** puede reintentar inmediatamente

### Scenario: 2FA con código expirado
**GIVEN** el usuario está en la página de verificación 2FA
**WHEN** espera más de 5 minutos sin ingresar código
**AND** ingresa código `123456`
**THEN** se muestra error "Sesión expirada, inicie sesión nuevamente"
**AND** es redirigido a la página de login

### Scenario: Cancelar flujo 2FA
**GIVEN** el usuario está en la página de verificación 2FA
**WHEN** hace click en "Cancelar" o "Volver al login"
**THEN** es redirigido a la página de login
**AND** el temp token 2FA se invalida

---

## Requirement E2E-03: CRUD Animal

### Scenario: Crear nuevo animal completo
**GIVEN** el usuario está autenticado en el dashboard
**WHEN** navega a Animales > Nuevo Animal
**AND** completa todos los campos requeridos:
  - Código: `A099`
  - Nombre: `Nuevo Torito`
  - Especie: `Bovino`
  - Sexo: `Macho`
  - Fecha nacimiento: `01/01/2024`
  - Raza: `Brahman`
  - Predio: predio actual
**AND** hace click en "Guardar"
**THEN** es redirigido al detalle del nuevo animal
**AND** se muestra mensaje de éxito "Animal creado exitosamente"
**AND** todos los datos se muestran correctamente

### Scenario: Crear animal con código duplicado
**GIVEN** el usuario está en el formulario de nuevo animal
**WHEN** ingresa código `GAN-001` (ya existente en el sistema)
**AND** completa los demás campos
**AND** hace click en "Guardar"
**THEN** se muestra error "El código GAN-001 ya existe en este predio"
**AND** el campo código se resalta en rojo
**AND** no se crea el animal

### Scenario: Editar animal existente
**GIVEN** el usuario está en la lista de animales
**WHEN** hace click en el animal "GAN-001" (Don Toro)
**AND** navega a la página de edición
**AND** modifica el nombre a "Don Toro Modificado"
**AND** hace click en "Guardar"
**THEN** es redirigido al detalle del animal
**AND** se muestra el nombre actualizado
**AND** se muestra mensaje "Animal actualizado exitosamente"

### Scenario: Cambiar estado del animal
**GIVEN** el usuario está en el detalle del animal "GAN-001"
**WHEN** hace click en el selector de estado
**AND** selecciona estado "Vendido"
**AND** confirma el cambio
**THEN** el estado se actualiza a "Vendido"
**AND** se muestra badge de estado correspondiente
**AND** se registra la fecha de cambio de estado

### Scenario: Eliminar animal
**GIVEN** el usuario está en el detalle del animal
**WHEN** hace click en "Eliminar Animal"
**AND** confirma en el modal de confirmación
**THEN** el animal se elimina (soft delete)
**AND** es redirigido a la lista de animales
**AND** el animal ya no aparece en la lista

### Scenario: Validación de formulario vacío
**GIVEN** el usuario está en el formulario de nuevo animal
**WHEN** hace click en "Guardar" sin completar ningún campo
**THEN** se muestran mensajes de validación para cada campo requerido:
  - "El código es requerido"
  - "La especie es requerida"
  - "El sexo es requerido"
  - "La fecha de nacimiento es requerida"
**AND** el botón "Guardar" permanece deshabilitado

---

## Requirement E2E-04: Wizard Palpación Grupal

### Scenario: Completar wizard de palpación grupal exitosamente
**GIVEN** el usuario está autenticado y navega a Servicios > Palpación Grupal
**WHEN** completa el paso 1 (Evento):
  - Tipo evento: "Palpación grupal"
  - Fecha: fecha actual
  - Responsable: "Dr. García"
**AND** hace click en "Siguiente"
**THEN** avanza al paso 2 (Selección de animales)
**WHEN** selecciona 10 animales de la lista
**AND** hace click en "Siguiente"
**THEN** avanza al paso 3 (Resultados)
**WHEN** ingresa resultados para cada animal:
  - 7 preñadas
  - 3 vacías
**AND** hace click en "Finalizar"
**THEN** se muestra resumen del evento
**AND** se muestra mensaje "Palpación registrada exitosamente"
**AND** los resultados se guardan en el sistema

### Scenario: Wizard palpación sin seleccionar animales
**GIVEN** el usuario está en el paso 2 del wizard
**WHEN** no selecciona ningún animal
**AND** hace click en "Siguiente"
**THEN** se muestra error "Debe seleccionar al menos un animal"
**AND** permanece en el paso 2

### Scenario: Navegación entre pasos del wizard
**GIVEN** el usuario está en el paso 2 del wizard
**WHEN** hace click en "Anterior"
**THEN** regresa al paso 1 con los datos preservados
**WHEN** hace click en "Siguiente"
**THEN** avanza al paso 2 con la selección preservada

### Scenario: Cancelar wizard en cualquier paso
**GIVEN** el usuario está en cualquier paso del wizard
**WHEN** hace click en "Cancelar"
**THEN** se muestra confirmación "¿Está seguro que desea cancelar?"
**WHEN** confirma
**THEN** es redirigido a la lista de servicios
**AND** no se guarda ningún dato parcial

---

## Requirement E2E-05: Registro de Parto

### Scenario: Registrar parto exitoso con cría
**GIVEN** el usuario está autenticado y navega a Servicios > Registro de Parto
**WHEN** busca y selecciona la madre "Vaca 001" (GAN-002)
**AND** completa los datos del parto:
  - Fecha parto: fecha actual
  - Tipo parto: "Normal"
  - Complicaciones: "Ninguna"
**AND** hace click en "Registrar Cría"
**THEN** se habilita el formulario de registro de cría
**WHEN** completa datos de la cría:
  - Código: `A100`
  - Sexo: "Macho"
  - Peso: `35` kg
**AND** hace click en "Guardar Parto"
**THEN** se muestra resumen con madre y cría vinculadas
**AND** se muestra mensaje "Parto registrado exitosamente"
**AND** la cría aparece en la lista de animales

### Scenario: Registrar parto sin seleccionar madre
**GIVEN** el usuario está en el formulario de registro de parto
**WHEN** completa los datos del parto sin seleccionar madre
**AND** hace click en "Guardar Parto"
**THEN** se muestra error "Debe seleccionar la madre"
**AND** el campo de selección de madre se resalta

### Scenario: Registrar parto con complicaciones
**GIVEN** el usuario está registrando un parto
**WHEN** selecciona tipo parto "Cesárea"
**AND** ingresa complicaciones "Requiere intervención veterinaria"
**AND** completa el resto de campos
**AND** hace click en "Guardar Parto"
**THEN** se registra el parto con la etiqueta de complicación
**AND** se muestra alerta "Parto con complicaciones registrado"

### Scenario: Validar peso de cría fuera de rango
**GIVEN** el usuario está registrando la cría
**WHEN** ingresa peso `5` kg (muy bajo para bovino)
**AND** intenta guardar
**THEN** se muestra warning "El peso parece fuera de rango normal (20-50 kg)"
**AND** puede confirmar o corregir el valor

---

## Requirement E2E-06: Cambio de Predio

### Scenario: Cambiar predio y actualizar datos
**GIVEN** el usuario está autenticado con acceso a múltiples predios
**WHEN** hace click en el selector de predio (header)
**THEN** se muestra dropdown con lista de predios disponibles
**WHEN** selecciona "Predio Norte"
**THEN** el selector muestra "Predio Norte"
**AND** todos los datos se actualizan:
  - Lista de animales cambia a los del Predio Norte
  - Dashboard muestra estadísticas del Predio Norte
  - Servicios muestran datos del Predio Norte

### Scenario: Cambio de predio preserva navegación
**GIVEN** el usuario está en la página de detalle de animal
**WHEN** cambia de predio usando el selector
**THEN** es redirigido a la lista de animales del nuevo predio
**AND** no permanece en detalle de animal del predio anterior

### Scenario: Predio con un solo acceso
**GIVEN** el usuario tiene acceso solo a un predio
**WHEN** observa el selector de predio en el header
**THEN** el selector no es clickeable (deshabilitado)
**AND** muestra el nombre del único predio disponible

### Scenario: Cambio de predio invalida caché
**GIVEN** el usuario está en el dashboard del Predio A
**WHEN** cambia al Predio B
**THEN** se invalida la caché de datos del Predio A
**AND** los nuevos datos se cargan desde el servidor
**AND** no se muestran datos stale del predio anterior

---

## Requirement E2E-07: Exportación de Reportes

### Scenario: Exportar reporte de animales a CSV
**GIVEN** el usuario está en Reportes > Animales
**WHEN** aplica filtros:
  - Especie: "Bovino"
  - Estado: "Activo"
  - Rango fechas: último mes
**AND** hace click en "Exportar CSV"
**THEN** se inicia proceso de exportación
**AND** se muestra indicador de progreso "Generando reporte..."
**WHEN** la exportación completa
**THEN** se descarga archivo CSV
**AND** el archivo contiene los datos filtrados correctamente

### Scenario: Exportar reporte a PDF
**GIVEN** el usuario está en Reportes > Servicios
**WHEN** selecciona tipo reporte "Resumen de servicios"
**AND** hace click en "Exportar PDF"
**THEN** se muestra modal de opciones PDF:
  - Formato: "A4"
  - Orientación: "Horizontal"
  - Incluir gráficos: Sí/No
**WHEN** confirma exportación
**THEN** se descarga archivo PDF con el reporte

### Scenario: Exportación con polling de estado
**GIVEN** el usuario solicita exportación de reporte grande
**WHEN** hace click en "Exportar"
**THEN** se muestra modal "Generando reporte... (0%)"
**AND** el sistema hace polling cada 2 segundos al endpoint de estado
**WHEN** el reporte está listo (100%)
**THEN** se habilita botón de descarga
**AND** el modal muestra "Reporte listo para descargar"

### Scenario: Exportación fallida
**GIVEN** el usuario solicita exportación
**WHEN** ocurre error en generación del reporte
**THEN** se muestra mensaje "Error generando reporte, intente nuevamente"
**AND** el usuario puede reintentar inmediatamente

### Scenario: Exportación sin filtros
**GIVEN** el usuario está en la página de reportes
**WHEN** hace click en "Exportar" sin aplicar filtros
**THEN** se muestra confirmación "¿Desea exportar todos los registros?"
**WHEN** confirma
**THEN** se exporta el reporte completo

---

## Requirement E2E-08: Operación en Lote

### Scenario: Selección múltiple de animales
**GIVEN** el usuario está en la lista de animales
**WHEN** hace click en el checkbox de selección múltiple
**AND** selecciona 5 animales diferentes
**THEN** se muestra contador "5 animales seleccionados"
**AND** aparece barra de acciones en lote
**AND** los animales seleccionados tienen checkbox marcado

### Scenario: Aplicar acción en lote - Cambiar estado
**GIVEN** el usuario ha seleccionado 5 animales
**WHEN** hace click en "Acciones en lote" > "Cambiar Estado"
**AND** selecciona nuevo estado "Enfermo"
**AND** confirma la acción
**THEN** se muestra progreso "Actualizando 5 animales..."
**WHEN** completa
**THEN** los 5 animales muestran estado "Enfermo"
**AND** se muestra mensaje "5 animales actualizados exitosamente"

### Scenario: Aplicar acción en lote - Asignar potrero
**GIVEN** el usuario ha seleccionado 3 animales
**WHEN** hace click en "Acciones en lote" > "Asignar Potrero"
**AND** selecciona potrero "Potrero 3"
**AND** confirma
**THEN** los 3 animales se asignan al Potrero 3
**AND** se muestra mensaje de éxito

### Scenario: Selección de todos los animales
**GIVEN** el usuario está en la lista de animales
**WHEN** hace click en el checkbox "Seleccionar todos"
**THEN** se seleccionan todos los animales visibles (máximo 100)
**AND** se muestra contador con el total
**WHEN** hace click en "Seleccionar todos" nuevamente
**THEN** se deseleccionan todos los animales

### Scenario: Operación en lote con validación
**GIVEN** el usuario ha seleccionado 10 animales
**WHEN** intenta aplicar acción "Eliminar"
**THEN** se muestra modal de confirmación "¿Eliminar 10 animales?"
**AND** se requiere escribir "CONFIRMAR" para proceder
**WHEN** cancela
**THEN** no se realiza ninguna acción

---

## Requirement E2E-09: Navegación Mobile

### Scenario: Navegación mobile - Sidebar colapsable
**GIVEN** el usuario abre la aplicación en viewport mobile (375x667)
**WHEN** la página carga
**THEN** el sidebar está oculto (colapsado)
**AND** se muestra botón hamburger menu
**WHEN** hace click en hamburger menu
**THEN** el sidebar se desliza desde la izquierda
**AND** muestra los módulos principales
**WHEN** selecciona "Animales"
**THEN** el sidebar se cierra automáticamente
**AND** navega a la lista de animales

### Scenario: Tablas responsive en mobile
**GIVEN** el usuario está en la lista de animales en mobile
**THEN** la tabla se muestra en formato de cards
**AND** cada card muestra información esencial:
  - Código
  - Nombre
  - Estado (badge)
**AND** hay botón "Ver más" para detalles
**WHEN** hace click en "Ver más"
**THEN** se expande la card con información adicional

### Scenario: Formularios mobile
**GIVEN** el usuario está en el formulario de nuevo animal en mobile
**THEN** los campos se muestran en columna única
**AND** el teclado virtual no oculta campos importantes
**AND** hay navegación entre secciones con tabs
**WHEN** completa el formulario
**THEN** el botón "Guardar" está fijo en la parte inferior

### Scenario: Pull-to-refresh en mobile
**GIVEN** el usuario está en la lista de animales en mobile
**WHEN** hace pull-to-refresh (desliza hacia abajo)
**THEN** se muestra indicador de carga
**AND** se recargan los datos desde el servidor
**WHEN** completa
**THEN** se muestra mensaje "Datos actualizados"

### Scenario: Navegación con gestos
**GIVEN** el usuario está en el detalle de un animal en mobile
**WHEN** desliza hacia la derecha
**THEN** navega a la página anterior (lista de animales)
**WHEN** desliza hacia la izquierda
**THEN** no navega (está en la primera página del flujo)

---

## Requirement E2E-10: Modo Offline (PWA)

### Scenario: Navegación en modo offline
**GIVEN** el usuario tiene la PWA instalada y abierta
**WHEN** se desconecta de internet (simula offline)
**THEN** se muestra banner "Sin conexión - Modo offline"
**AND** la aplicación sigue funcionando con datos cacheados
**WHEN** navega a Animales
**THEN** se muestra lista de animales desde caché
**AND** las acciones de escritura (crear, editar) están deshabilitadas

### Scenario: Reintento automático al reconectar
**GIVEN** el usuario está en modo offline
**WHEN** se reconecta a internet
**THEN** el banner "Sin conexión" desaparece
**AND** se sincronizan automáticamente los datos pendientes
**AND** se muestra mensaje "Sincronización completada"

### Scenario: Acciones offline pendientes de sincronización
**GIVEN** el usuario está en modo offline
**WHEN** intenta crear un animal
**THEN** se muestra mensaje "Acción guardada localmente, se sincronizará al reconectar"
**AND** el animal se guarda en IndexedDB local
**WHEN** se reconecta
**THEN** el animal se sincroniza al servidor
**AND** se muestra confirmación de sincronización

### Scenario: Indicador visual de estado de conexión
**GIVEN** el usuario navega por la aplicación
**WHEN** la conexión es inestable
**THEN** se muestra indicador amarillo "Conexión inestable"
**WHEN** se desconecta completamente
**THEN** el indicador cambia a rojo "Sin conexión"
**WHEN** se reconecta
**THEN** el indicador vuelve a verde "Conectado"

### Scenario: Cache de assets estáticos
**GIVEN** el usuario ha visitado la aplicación anteriormente
**WHEN** abre la PWA sin conexión
**THEN** la aplicación carga correctamente desde caché
**AND** los assets estáticos (JS, CSS, imágenes) están disponibles
**AND** solo las llamadas API fallan (mostrando datos cacheados)

---

## Fixtures Requeridos

### Auth Fixture (`auth.fixture.ts`)
```typescript
// Proporciona contexto autenticado reutilizable
// Usa API login para obtener storageState
// Guarda cookies de refresh token
```

### 2FA Fixture (`twofa.fixture.ts`)
```typescript
// Maneja flujo completo de 2FA
// Proporciona helper para ingresar código OTP
// Limpia estado entre tests
```

### Predio Fixture (`predio.fixture.ts`)
```typescript
// Helpers para cambio de predio
// Selección de predio por ID o nombre
// Verificación de datos actualizados
```

---

## Configuración de CI

### Matrix de Ejecución
```yaml
strategy:
  matrix:
    project: [chromium, firefox]
    shard: [1/4, 2/4, 3/4, 4/4]
```

### Artefactos
- Videos en fallos
- Traces de Playwright
- Reporte HTML
- Screenshots de error

### Reintentos
- Local: 0 reintentos
- CI: 2 reintentos

---

## Datos de Test Seed

### Animales de prueba
| Código | Nombre | Especie | Estado |
|--------|--------|---------|--------|
| GAN-001 | Don Toro | Bovino | Activo |
| GAN-002 | Vaca 001 | Bovino | Activo |
| GAN-003 | Ternero 001 | Bovino | Activo |
| GAN-004 | Vaca 002 | Bovino | Enfermo |
| GAN-005 | Toro 002 | Bovino | Activo |

### Predios de prueba
| ID | Nombre | Ubicación |
|----|--------|-----------|
| 1 | Predio Central | Córdoba |
| 2 | Predio Norte | Santa Fe |
| 3 | Predio Sur | Buenos Aires |

### Usuarios de prueba
| Email | Rol | 2FA |
|-------|-----|-----|
| admin@ganatrack.com | Admin | No |
| 2fa@ganatrack.com | Veterinario | Sí |
