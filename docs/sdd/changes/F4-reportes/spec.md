# Módulo Reportes — Especificaciones Fase 4

## Reportes-Dashboard

### Requirement: Dashboard KPIs Reales

El sistema DEBE cargar indicadores clave desde `GET /api/v1/dashboard/kpi?predio_id=X` y mostrarlos en el dashboard home reemplazando los datos mock existentes. Los KPIs incluyen: total de animales, tasa de preñez (%), mortalidad (%), y balance compras/ventas del mes.

#### Scenario: Carga exitosa de KPIs

- GIVEN un usuario autenticado con al menos un predio seleccionado
- WHEN la página `/dashboard` carga
- THEN el sistema llama a `GET /api/v1/dashboard/kpi?predio_id=X`
- AND muestra los 4 KPIs con valores reales en ≤ 2 segundos
- AND cada KPI muestra su valor, etiqueta y tendencia (↑/↓)

#### Scenario: Estado de carga

- GIVEN un usuario navega al dashboard
- WHEN la petición de KPIs está en curso
- THEN se muestra un skeleton loader por cada KPI card
- AND NO se muestran valores mock ni cero

#### Scenario: Sin datos disponibles

- GIVEN un predio sin registros de ningún tipo
- WHEN se cargan los KPIs
- THEN el sistema muestra valores en 0 para todos los indicadores
- AND muestra un mensaje "Sin datos disponibles para este predio"

#### Scenario: Error de red

- GIVEN el endpoint de KPIs retorna error 500 o falla la conexión
- WHEN la petición falla
- THEN se muestra un toast de error "No se pudieron cargar los indicadores"
- AND se muestra un botón "Reintentar" en cada KPI card afectado
- AND NO se muestran valores mock

#### Scenario: Cambio de predio

- GIVEN el dashboard ya cargó KPIs para el predio A
- WHEN el usuario cambia al predio B
- THEN los KPIs muestran skeleton loaders inmediatamente
- AND se realiza nueva petición con `predio_id=B`
- AND los valores se actualizan con los datos del predio B

---

## Reportes-Inventario

### Requirement: Reporte de Inventario por Múltiples Dimensiones

El sistema DEBE mostrar el inventario de animales con 4 gráficos: distribución por predio, por raza, por estado y por sexo, usando datos de `GET /api/v1/reportes/inventario?predio_id=X`.

#### Scenario: Carga completa del reporte de inventario

- GIVEN un usuario navega a `/dashboard/reportes/inventario` con un predio seleccionado
- WHEN la página carga
- THEN el sistema llama al endpoint de inventario
- AND renderiza 4 gráficos ApexCharts: barras (por predio), dona (por raza), barras horizontales (por estado), dona (por sexo)
- AND muestra un componente `ReportFilters` con selector de predio

#### Scenario: Filtro por predio

- GIVEN el reporte de inventario muestra datos del predio A
- WHEN el usuario cambia el selector de predio a B
- THEN los filtros se sincronizan con URL searchParams (`?predio_id=B`)
- AND todos los 4 gráficos se actualizan con datos del predio B
- AND se muestra estado de carga durante la transición

#### Scenario: Inventario vacío

- GIVEN un predio sin animales registrados
- WHEN se carga el reporte de inventario
- THEN se muestra un estado vacío con ícono y texto "No hay animales registrados en este predio"
- AND NO se renderizan gráficos vacíos
- AND se muestra un botón "Agregar animales" que navega a `/dashboard/animales`

#### Scenario: Dataset grande (>1000 animales)

- GIVEN un predio con más de 1000 animales
- WHEN se carga el reporte de inventario
- THEN los gráficos renderizan en ≤ 3 segundos
- AND el gráfico de barras por predio agrupa razas con < 2% en categoría "Otros"

---

## Reportes-Reproductivo

### Requirement: Reporte Reproductivo con Indicadores Clave

El sistema DEBE mostrar indicadores reproductivos: tasa de concepción (%), servicios por mes, intervalo entre partos (días), y tasa de preñez, usando datos de `GET /api/v1/reportes/reproductivo?predio_id=X&desde=Y&hasta=Z`.

#### Scenario: Carga con rango de fechas

- GIVEN un usuario navega a `/dashboard/reportes/reproductivo`
- WHEN la página carga con rango de fechas por defecto (últimos 12 meses)
- THEN el sistema llama al endpoint con parámetros `desde` y `hasta`
- AND muestra: línea (tasa concepción mensual), barras (servicios/mes), indicador numérico (intervalo partos), gauge (tasa preñez)

#### Scenario: Rango de fechas personalizado

- GIVEN el reporte reproductivo cargó con rango por defecto
- WHEN el usuario selecciona fechas personalizadas en ReportFilters
- THEN los parámetros `desde` y `hasta` se actualizan en la URL
- AND todos los gráficos se refetch con el nuevo rango
- AND el rango se mantiene al recargar la página

#### Scenario: Sin eventos reproductivos en el rango

- GIVEN un predio sin registros reproductivos en el rango seleccionado
- WHEN se carga el reporte
- THEN se muestra estado vacío "No hay eventos reproductivos en el período seleccionado"
- AND se sugiere ampliar el rango de fechas

#### Scenario: Rango de fechas inválido

- GIVEN el usuario selecciona fecha `hasta` anterior a fecha `desde`
- WHEN intenta aplicar el filtro
- THEN el sistema muestra un error de validación "La fecha final debe ser posterior a la fecha inicial"
- AND NO se realiza la petición al backend

---

## Reportes-Mortalidad

### Requirement: Reporte de Mortalidad con Análisis por Causa y Tendencia

El sistema DEBE mostrar análisis de mortalidad por causa, por rango de edad, y tendencia mensual, usando datos de `GET /api/v1/reportes/mortalidad?predio_id=X&desde=Y&hasta=Z`.

#### Scenario: Carga completa del reporte de mortalidad

- GIVEN un usuario navega a `/dashboard/reportes/mortalidad`
- WHEN la página carga
- THEN muestra: dona/stacked (mortalidad por causa), barras horizontales (por rango edad), línea (tendencia mensual)
- AND cada causa de mortalidad muestra porcentaje del total

#### Scenario: Mortalidad cero en el período

- GIVEN un predio sin muertes en el rango seleccionado
- WHEN se carga el reporte
- THEN se muestra un estado positivo "No se registraron mortalidades en este período" con ícono de check
- AND se muestra un mini-gráfico de línea con valor 0

#### Scenario: Pico de mortalidad detectado

- GIVEN un mes con mortalidad > 2x el promedio de los últimos 6 meses
- WHEN se renderiza la tendencia mensual
- THEN el punto del pico se resalta con color de alerta (rojo/naranja)
- AND un tooltip muestra "⚠️ Mortalidad elevada: X eventos (promedio: Y)"

---

## Reportes-Movimiento

### Requirement: Reporte de Movimiento Económico

El sistema DEBE mostrar compras vs ventas de animales, saldo neto, y costos de transacción, usando datos de `GET /api/v1/reportes/movimiento?predio_id=X&desde=Y&hasta=Z`.

#### Scenario: Balance de movimientos

- GIVEN un usuario navega a `/dashboard/reportes/movimiento`
- WHEN la página carga
- THEN muestra: barras agrupadas (compras vs ventas por mes), indicador de saldo neto (compras - ventas), tabla resumen con costos de transacción
- AND el saldo neto muestra color verde si positivo, rojo si negativo

#### Scenario: Sin movimientos en el período

- GIVEN un predio sin compras ni ventas en el rango
- WHEN se carga el reporte
- THEN se muestra estado vacío "No hay movimientos registrados en este período"
- AND el saldo neto muestra "$0.00"

#### Scenario: Moneda y formato

- GIVEN datos de movimiento con valores monetarios
- WHEN se renderizan los valores
- THEN todos los montos se formatean con separador de miles y 2 decimales
- AND se muestra el símbolo de moneda configurado para el predio

---

## Reportes-Sanitario

### Requirement: Reporte Sanitario con Eventos y Tratamientos

El sistema DEBE mostrar eventos sanitarios por tipo, calendario de vacunaciones, y tratamientos aplicados, usando datos de `GET /api/v1/reportes/sanitario?predio_id=X&desde=Y&hasta=Z`.

#### Scenario: Carga completa del reporte sanitario

- GIVEN un usuario navega a `/dashboard/reportes/sanitario`
- WHEN la página carga
- THEN muestra: barras apiladas (eventos por tipo/mes), lista (vacunaciones pendientes), tabla (tratamientos aplicados con fecha, animal, tipo)

#### Scenario: Vacunaciones pendientes

- GIVEN existen vacunaciones programadas sin aplicar
- WHEN se renderiza el reporte sanitario
- THEN la sección de vacunaciones pendientes muestra un badge con el count
- AND cada vacunación pendiente muestra: tipo, fecha programada, animales objetivo
- AND las vencidas (> 7 días) se resaltan en rojo

#### Scenario: Sin eventos sanitarios

- GIVEN un predio sin registros sanitarios en el rango
- WHEN se carga el reporte
- THEN se muestra estado vacío "No hay eventos sanitarios registrados"
- AND se sugiere "Registrar primer evento sanitario"

---

## Reportes-Exportación

### Requirement: Sistema de Exportación Asíncrona con Polling

El sistema DEBE permitir exportar cualquier reporte en formatos PDF, Excel y CSV mediante un proceso asíncrono con polling de estado, usando `POST /api/v1/reportes/exportar` y `GET /api/v1/reportes/exportar/:job_id/status`.

#### Scenario: Inicio de exportación exitoso

- GIVEN un usuario en cualquier página de reporte con datos cargados
- WHEN hace clic en "Exportar" y selecciona un formato (PDF/Excel/CSV)
- THEN el sistema llama a `POST /api/v1/reportes/exportar` con el tipo de reporte, formato y filtros actuales
- AND recibe un `job_id`
- AND muestra un indicador de progreso "Preparando exportación..."

#### Scenario: Polling de estado de exportación

- GIVEN una exportación iniciada con `job_id`
- WHEN el sistema hace polling cada 3 segundos a `GET /api/v1/reportes/exportar/:job_id/status`
- THEN mientras el estado sea "pending" o "processing", muestra el indicador de progreso
- AND cuando el estado es "completed", descarga automáticamente el archivo
- AND muestra un toast "Exportación completada"

#### Scenario: Timeout de exportación (60s)

- GIVEN una exportación que tarda más de 60 segundos
- WHEN el polling alcanza el límite de 60 segundos (20 intentos × 3s)
- THEN el sistema cancela el polling
- AND muestra un toast de error "La exportación tardó demasiado. Intente con un rango de fechas menor"
- AND muestra un botón "Reintentar" que reinicia el proceso
- AND el job_id se registra para posible reanudación manual

#### Scenario: Error en la exportación

- GIVEN el endpoint de status retorna estado "failed"
- WHEN el polling detecta el fallo
- THEN muestra un toast "Error al generar la exportación: {mensaje del servidor}"
- AND ofrece un botón "Reintentar"
- AND limpia el estado de la exportación fallida

#### Scenario: Exportación con filtros activos

- GIVEN un usuario con filtros aplicados (predio=B, rango=últimos 6 meses)
- WHEN exporta el reporte de inventario a Excel
- THEN la petición POST incluye los filtros activos en el payload
- AND el archivo exportado contiene solo los datos filtrados
- AND el nombre del archivo incluye el tipo de reporte y la fecha: `inventario_2026-04-03.xlsx`

#### Scenario: Exportación sin datos

- GIVEN un reporte sin datos (estado vacío visible)
- WHEN el usuario intenta exportar
- THEN el botón de exportar se muestra deshabilitado
- Y un tooltip indica "No hay datos para exportar"

#### Scenario: Múltiples exportaciones simultáneas

- GIVEN el usuario inicia una exportación de inventario a PDF
- WHEN intenta iniciar otra exportación de movimiento a CSV antes de que la primera termine
- THEN el sistema permite la segunda exportación
- AND muestra un indicador de progreso por cada exportación activa
- AND limita a un máximo de 3 exportaciones simultáneas
- AND si se excede el límite, muestra "Máximo 3 exportaciones simultáneas. Espere a que una termine"

---

## Componentes Compartidos

### Requirement: Filtros Compartidos con Sincronización URL

El sistema DEBE proveer un componente `ReportFilters` compartido que sincroniza predio y rango de fechas con los searchParams de la URL para todas las páginas de reporte.

#### Scenario: Sincronización bidireccional URL ↔ Filtros

- GIVEN un usuario en `/dashboard/reportes/inventario`
- WHEN cambia el predio en ReportFilters
- THEN la URL se actualiza a `?predio_id=X&desde=Y&hasta=Z`
- AND al recargar la página, los filtros se restauran desde la URL
- AND al navegar entre reportes, los filtros se mantienen

#### Scenario: Filtros por defecto

- GIVEN un usuario navega a un reporte sin parámetros en la URL
- WHEN la página carga
- THEN el predio se establece al predio activo en el store global
- AND el rango de fechas se establece a los últimos 12 meses
- AND la URL se actualiza con los valores por defecto

---

## Calidad y Performance

### Requirement: Performance y Lazy Loading

El sistema DEBE garantizar que ApexCharts no impacte el bundle inicial y que todos los reportes carguen en tiempos aceptables.

#### Scenario: Lazy loading de ApexCharts

- GIVEN un usuario navega a `/dashboard` (home)
- WHEN la página carga
- THEN el bundle de ApexCharts NO se descarga
- AND solo se descarga cuando el usuario navega a una página de reporte

#### Scenario: Tiempo de carga de reporte

- GIVEN un usuario navega a cualquier página de reporte
- WHEN los datos están disponibles en el backend
- THEN el reporte renderiza completamente en ≤ 3 segundos
- AND los gráficos muestran skeleton loaders mientras cargan
