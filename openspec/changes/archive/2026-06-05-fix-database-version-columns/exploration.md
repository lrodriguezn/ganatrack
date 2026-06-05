## Exploration: Schema Drift Audit

### Summary
`push-schema.ts` is **severely out of sync** with the Drizzle schema defined in `packages/database/src/schema/`. This is not just a `version` column problem — it is a **systematic divergence** affecting **31 of 42 tables** (74%). The push-schema.ts file was written manually as a workaround for drizzle-kit incompatibility, but was never updated as the Drizzle schema evolved through two migrations (0000 and 0001). The Drizzle schema is the source of truth — it is what the application code (API entities, mappers, types, mock services) actually uses. Running `push-schema.ts` today creates a database that would cause **runtime failures** on nearly every write operation.

### Discrepancies Found

| Table | Drizzle Expects | push-schema.ts Creates | Gap Severity |
|-------|-----------------|------------------------|------|
| **animales** | 29 cols incl. `version`, `sexo_key`, `codigo_arete`, `codigo_qr`, `peso_compra`, `estado_animal_key`, `ind_descartado`, unique `uq_animales_predio_codigo` | 12 cols — missing 17 columns + constraint | **CRITICAL** |
| **imagenes** | `predio_id`, `ruta`, `nombre_original`, `mime_type`, `tamano_bytes`, `descripcion`, `activo` | `url`, `tipo` — completely different columns | **CRITICAL** |
| **predios** | `codigo`, `departamento`, `municipio`, `vereda`, `area_hectareas`, `capacidad_maxima`, `tipo_explotacion_id` | `ubicacion`, `telefono`, `email` (not in Drizzle) | **CRITICAL** |
| **potreros** | `codigo`, `area_hectareas`, `tipo_pasto`, `capacidad_maxima`, `estado`, unique `uq_potreros_predio_codigo` | `capacidad` (wrong name) — missing 5 cols + constraint | **HIGH** |
| **sectores** | `codigo`, `area_hectareas`, `tipo_pasto`, `capacidad_maxima`, `estado`, unique `uq_sectores_predio_codigo` | Missing 5 cols + constraint | **HIGH** |
| **lotes** | `descripcion`, `tipo` | `potrero_id`, `fecha_ingreso`, `fecha_salida` (not in Drizzle) | **HIGH** |
| **grupos** | `descripcion` | `lote_id`, `fecha_ingreso`, `fecha_salida` (not in Drizzle) | **MEDIUM** |
| **config_parametros_predio** | `codigo`, `descripcion`, unique `uq_parametros_predio_codigo` | `parametro` (wrong name), missing descripcion + constraint | **HIGH** |
| **animales_imagenes** | unique `uq_animales_imagenes` | `es_principal`, `updated_at` (extra), missing constraint | **MEDIUM** |
| **veterinarios** | `direccion`, `numero_registro`, `especialidad` | Missing 3 cols | **MEDIUM** |
| **propietarios** | `tipo_documento`, `numero_documento`, `direccion` | Missing 3 cols | **MEDIUM** |
| **diagnosticos_veterinarios** | `categoria` (no predio_id) | `predio_id` (not in Drizzle), missing categoria | **MEDIUM** |
| **motivos_ventas** | No predio_id | `predio_id` (not in Drizzle) | **LOW** |
| **causas_muerte** | No predio_id | `predio_id` (not in Drizzle) | **LOW** |
| **lugares_compras** | `tipo`, `contacto`, `telefono` (no predio_id) | `predio_id` (extra), missing 3 cols | **HIGH** |
| **lugares_ventas** | `tipo`, `contacto`, `telefono` (no predio_id) | `predio_id` (extra), missing 3 cols | **HIGH** |
| **productos** | `codigo`, `tipo_producto`, `categoria`, `presentacion`, `unidad_medida`, `precio_unitario`, `stock_minimo`, `stock_actual`, `fecha_vencimiento`, `laboratorio`, `registro_invima`, unique constraint | `tipo`, `precio`, `stock` (wrong names) — missing 11 cols + constraint | **CRITICAL** |
| **productos_imagenes** | unique `uq_productos_imagenes` | `es_principal`, `updated_at` (extra), missing constraint | **MEDIUM** |
| **reportes_exportaciones** | `parametros`, 3 indexes | Missing `parametros` + all 3 indexes | **MEDIUM** |
| **notificaciones** | `predio_id`, `entidad_tipo`, `entidad_id`, `fecha_evento` | `datos`, `updated_at` (extra), missing 4 cols | **HIGH** |
| **notificaciones_preferencias** | `canal_inapp`, `canal_email`, `canal_push`, `dias_anticipacion`, unique constraint | `habilitado`, `created_at`, `updated_at` (extra), missing 4 cols + constraint | **HIGH** |
| **notificaciones_push_tokens** | unique `uq_notificaciones_push_tokens` | `updated_at` (extra), missing constraint | **LOW** |
| **servicios_palpaciones_grupal** | `codigo`, `observaciones`, `version` | `resultado`, `notas`, `veterinario_id` (wrong name) — missing version | **CRITICAL** |
| **servicios_palpaciones_animales** | `palpacion_grupal_id`, `veterinario_id`, `diagnostico_id`, `condicion_corporal_id`, `fecha`, `fecha_parto`, `comentarios` | `servicio_grupal_id` (wrong name), `resultado` — missing 6 cols | **CRITICAL** |
| **servicios_inseminacion_grupal** | `codigo`, `observaciones`, `version` | `notas`, `veterinario_id` (wrong name) — missing version | **CRITICAL** |
| **servicios_inseminacion_animales** | `inseminacion_grupal_id`, `veterinario_id`, `fecha`, `tipo_inseminacion_key`, `codigo_pajuela`, `diagnostico_id`, `observaciones` | `servicio_grupal_id` (wrong name), `resultado` — missing 6 cols | **CRITICAL** |
| **servicios_partos_animales** | `macho`, `hembra`, `muertos`, `peso`, `tipo_parto_key`, `observaciones`, `version` | `tipo`, `complicaciones`, `notas` — missing 7 cols + version | **CRITICAL** |
| **servicios_partos_crias** | `parto_id`, `cria_id`, `sexo_key`, `peso_nacimiento`, `observaciones` | `servicio_id` (wrong name), `animal_id` (wrong ref), `peso`, `sexo` (wrong names) | **CRITICAL** |
| **servicios_veterinarios_grupal** | `codigo`, `tipo_servicio`, `observaciones`, `version` | `diagnostico_id`, `notas`, `veterinario_id` (wrong name) — missing version | **CRITICAL** |
| **servicios_veterinarios_animales** | `veterinario_id`, `diagnostico_id`, `fecha`, `tipo_diagnostico_key`, `tratamiento`, `medicamentos`, `dosis`, `comentarios` | `resultado` — missing 8 cols | **CRITICAL** |
| **servicios_veterinarios_productos** | `servicio_animal_id`, `unidad` | `servicio_id` (wrong name), `updated_at` (extra), missing unidad | **MEDIUM** |

### Tables with NO discrepancies (8 of 42)
`usuarios`, `usuarios_contrasena`, `usuarios_historial_contrasenas`, `usuarios_login`, `usuarios_autenticacion_dos_factores`, `usuarios_roles`, `usuarios_permisos`, `roles_permisos`, `usuarios_predios`, `usuarios_roles_asignacion`, `config_razas`, `config_condiciones_corporales`, `config_tipos_explotacion`, `config_calidad_animal`, `config_colores`, `config_rangos_edades`, `config_key_values`

### Version Column Gaps (the original issue)
| Table | Has `version` in Drizzle? | Has `version` in push-schema? |
|-------|--------------------------|-------------------------------|
| animales | Yes (migration 0000) | No |
| servicios_palpaciones_grupal | Yes (migration 0001) | No |
| servicios_inseminacion_grupal | Yes (migration 0001) | No |
| servicios_partos_animales | Yes (migration 0001) | No |
| servicios_veterinarios_grupal | Yes (migration 0001) | No |

### Existing Migrations
- **0000_organic_peter_quill.sql** — Full initial schema from Drizzle (includes `version` on `animales`, all correct columns)
- **0001_polite_punisher.sql** — Added `version` to 4 servicios tables
- These migrations are the **source of truth** — they match the Drizzle schema exactly

### Root Cause Analysis
1. `push-schema.ts` was created as a **manual workaround** for drizzle-kit Node.js incompatibility
2. It was written once based on an **older version** of the schema and **never updated**
3. The Drizzle schema evolved significantly (new columns, renamed columns, new constraints, `version` columns added for optimistic locking)
4. Two Drizzle migrations (0000, 0001) were generated correctly but `push-schema.ts` was not regenerated
5. The application code (API entities, mappers, web types, mock services) all use the Drizzle schema — they would fail against the push-schema database

### Recommendations

1. **IMMEDIATE: Delete `push-schema.ts`** — It is dangerous and misleading. Any developer running it creates a broken database. Replace with `npx drizzle-kit push` or `npx drizzle-kit migrate` as the only supported schema management approach.

2. **If drizzle-kit is still incompatible**: Generate the SQL from the migration files (0000 + 0001) and use those directly instead of maintaining a manual copy. The migration SQL IS the correct schema.

3. **Prevent future drift**: Add a CI check or test that compares `push-schema.ts` output against Drizzle schema (if push-schema.ts must exist). Better yet, remove it entirely.

4. **Fix optimistic locking**: The 4 servicios tables + animales need `version` columns. Migration 0001 already handles the servicios tables; migration 0000 handles animales.

### Risks
- **Data loss**: Running `push-schema.ts` deletes the existing database (`unlinkSync`) and creates wrong columns — any existing data is destroyed
- **Runtime crashes**: The API writes columns that don't exist in the push-schema database (e.g., `codigo`, `observaciones`, `version`)
- **Silent data corruption**: Some columns have different names (e.g., `precio` vs `precio_unitario`) — writes would fail or insert NULL
- **Optimistic locking broken**: Without `version` columns, concurrent edits cause lost updates with no detection
- **Constraint violations missing**: Unique constraints (`uq_animales_predio_codigo`, etc.) are not enforced

### Ready for Tasks
**Yes** — the scope is clear. The fix is to either:
- (A) Delete `push-schema.ts` entirely and use drizzle-kit migrations
- (B) Regenerate `push-schema.ts` from the current Drizzle schema (or from migration SQL)

Option A is recommended as it eliminates the maintenance burden entirely.
