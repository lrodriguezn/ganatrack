## Especificaciones: F3-SERVICIOS (Palpaciones, Inseminaciones, Partos)

---

## 1. Palpaciones

### P-01: Listado de Eventos Grupales

El sistema DEBE mostrar un listado paginado de todos los eventos grupales de palpación del predio activo.

**RF-P-01.1** La tabla DEBE mostrar: código del evento, fecha, veterinario, número de animales, acciones (ver detalle).

**RF-P-01.2** El sistema DEBE soportar paginación server-side con parámetros `page` y `limit`.

**RF-P-01.3** El sistema DEBE filtrar eventos por el predio activo del usuario (obtenido de `usePredioStore().predioActivo`).

**RF-P-01.4** El sistema DEBE mostrar KPIs: total de palpaciones en el período, tasa de preñez positiva.

### P-02: Wizard de Nueva Palpación (3 Pasos)

El sistema DEBE permitir crear un evento grupal de palpación mediante un wizard de 3 pasos.

**RF-P-02.1 Step 1 — Crear Evento**: El formulario DEBE requerir: predio (auto-seleccionado del activo), código del evento, fecha, veterinario (selector de maestros), observaciones (opcional).

**RF-P-02.2 Step 2 — Seleccionar Animales**: El componente `AnimalSelector` DEBE mostrar solo hembras activas del predio. El usuario DEBE poder seleccionar múltiples animales con búsqueda.

**RF-P-02.3 Step 3 — Registrar Resultados**: Para cada animal seleccionado, el formulario DEBE requerir: diagnóstico veterinario (selector de maestros), condición corporal (selector de catálogos). Si el diagnóstico es "positivo" (preñada), el formulario DEBE mostrar campos adicionales: días de gestación y fecha estimada de parto.

**RF-P-02.4** El wizard DEBE preservar el estado entre pasos usando `useState` local en el componente page.

**RF-P-02.5** Al completar el paso 3, el sistema DEBE crear el evento y redirigir al listado con toast de éxito.

### P-03: Detalle de Evento Grupal

El sistema DEBE mostrar el detalle de un evento de palpación con:
- Datos del evento (código, fecha, veterinario, observaciones)
- Tabla de animales con sus resultados individuales

### P-04: Validaciones

**RF-P-04.1** El código del evento DEBE ser requerido y no puede estar vacío.

**RF-P-04.2** La fecha DEBE ser requerida y no puede ser futura.

**RF-P-04.3** El veterinario DEBE ser requerido.

**RF-P-04.4** Debe haber al menos 1 animal seleccionado en el paso 2.

**RF-P-04.5** El diagnóstico DEBE ser requerido para cada animal.

**RF-P-04.6** Si el diagnóstico es positivo, `diasGestacion` DEBE ser > 0 y `fechaParto` DEBE ser posterior a la fecha del evento.

---

## 2. Inseminaciones

### I-01: Listado de Eventos

El sistema DEBE mostrar un listado paginado de eventos de inseminación — mismo patrón que P-01.

**RF-I-01.1** La tabla DEBE mostrar: código, fecha, veterinario, # animales, acciones.

### I-02: Wizard de Nueva Inseminación

El sistema DEBE permitir crear un evento grupal de inseminación — mismo patrón wizard que P-02.

**RF-I-02.1 Step 1**: Campos: predio, código, fecha, veterinario, observaciones.

**RF-I-02.2 Step 2**: Selector de hembras activas (reutiliza AnimalSelector).

**RF-I-02.3 Step 3**: Para cada animal: fecha, toro (opcional), pajuela (opcional), dosis (opcional), observaciones.

### I-03: Detalle de Evento

Mismo patrón que P-03.

---

## 3. Partos

### PT-01: Listado de Partos

El sistema DEBE mostrar un listado paginado de registros de parto.

**RF-PT-01.1** La tabla DEBE mostrar: animal (arete/nombre), fecha, crías (machos + hembras + muertos), tipo de parto, acciones.

**RF-PT-01.2** El sistema DEBE mostrar KPIs: total partos del mes, total nacidos vivos, tasa de mortalidad neonatal.

### PT-02: Formulario de Registro

El sistema DEBE permitir registrar un parto mediante un formulario simple (NO wizard — flujo individual).

**RF-PT-02.1** El formulario DEBE requerir: animal (selector de hembras gestantes), fecha del parto, tipo de parto (Normal / Con Ayuda / Distócico / Mortinato).

**RF-PT-02.2** El formulario DEBE requerir: número de machos nacidos, hembras nacidas, muertos nacidos.

**RF-PT-02.3** El total de crías (machos + hembras + muertos) DEBE ser > 0.

**RF-PT-02.4** Al guardar, el sistema DEBE invalidar la query de partos y mostrar toast de éxito.

### PT-03: Validaciones

**RF-PT-03.1** El animal DEBE ser requerido.

**RF-PT-03.2** La fecha DEBE ser requerida y no puede ser futura.

**RF-PT-03.3** El tipo de parto DEBE ser requerido.

**RF-PT-03.4** Al menos uno de machos/hembras/muertos DEBE ser > 0.

---

## 4. Shared

### SH-01: Query Keys

El sistema DEBE agregar los query keys de servicios al archivo `shared/lib/query-keys.ts` existente.

**RF-SH-01.1** La estructura DEBE seguir el patrón existente: `servicios.palpaciones.all`, `servicios.palpaciones.list(params)`, `servicios.palpaciones.detail(id)`.

**RF-SH-01.2** Misma estructura para `inseminaciones` y `partos`.

---

## Cobertura de Requisitos

| Req | Cobertura |
|-----|-----------|
| Listado palpaciones | P-01 |
| Nueva palpación (wizard) | P-02 |
| Detalle palpación | P-03 |
| Listado inseminaciones | I-01 |
| Nueva inseminación (wizard) | I-02 |
| Detalle inseminación | I-03 |
| Listado partos | PT-01 |
| Nuevo parto (formulario) | PT-02 |
| Query keys | SH-01 |
