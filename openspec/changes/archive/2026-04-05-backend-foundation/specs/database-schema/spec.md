# Database Schema Specification

## Purpose
Define the complete Drizzle ORM schema for GanaTrack's 55 tables across 10 domain files, supporting dual SQLite/PostgreSQL compatibility with soft-delete and tenant isolation.

## Requirements

### Requirement: Unified Schema Files
The system MUST define all tables in TypeScript schema files under `packages/database/src/schema/`, one file per domain: `security.ts`, `predios.ts`, `animales.ts`, `maestros.ts`, `servicios.ts`, `configuracion.ts`, `productos.ts`, `reportes.ts`, `notificaciones.ts`, and an `index.ts` barrel export.

#### Scenario: Schema file creation
- GIVEN the project structure
- WHEN the database package is initialized
- THEN 10 schema files are created with proper imports and exports
- AND each file defines tables for its domain using Drizzle's `sqliteTable` or `pgTable` based on provider

### Requirement: Dual SQLite/PostgreSQL Compatibility
The schema MUST be compatible with both SQLite and PostgreSQL via a single set of TypeScript definitions. Column types MUST use Drizzle's cross-dialect primitives.

#### Scenario: Timestamp handling
- GIVEN a table with timestamp columns
- WHEN using SQLite provider
- THEN timestamps are defined as `integer('column', { mode: 'timestamp' })`
- AND when using PostgreSQL provider
- THEN timestamps are defined as `timestamp('column', { withTimezone: true })`

### Requirement: Soft-Delete Field
Every table MUST include an `activo` field defined as `integer('activo').default(1)` for soft-delete filtering.

#### Scenario: Activo field presence
- GIVEN any table definition
- WHEN the schema is generated
- THEN the table includes an `activo` column with default value 1
- AND repositories filter by `eq(table.activo, 1)` for active records

### Requirement: Foreign Key Constraints
Foreign keys MUST follow PRD specifications: `ON DELETE RESTRICT` for `predio_id` references, `ON DELETE SET NULL` or `CASCADE` as specified per relationship.

#### Scenario: Predio reference restriction
- GIVEN a table with `predio_id` foreign key
- WHEN the referenced predio is deleted
- THEN the database prevents deletion (RESTRICT)
- AND the application handles the constraint violation

#### Scenario: Self-referencing animal lineage
- GIVEN the `animales` table with `madre_id` and `padre_id` self-references
- WHEN an animal record is inserted
- THEN the foreign keys reference `animales.id` with `ON DELETE SET NULL`
- AND circular references are prevented by application logic

### Requirement: Unique Constraints
The system MUST enforce unique constraints as specified: `animales(predio_id, codigo)` and `usuarios_predios(usuario_id, predio_id)`.

#### Scenario: Animal code uniqueness per predio
- GIVEN an animal with codigo 'A001' in predio 1
- WHEN inserting another animal with codigo 'A001' in predio 1
- THEN the database rejects the duplicate
- AND inserting 'A001' in predio 2 succeeds

### Requirement: Naming Conventions
Column names in the database MUST be `snake_case`. TypeScript property names in schema definitions MUST be `camelCase` with Drizzle column name mapping.

#### Scenario: Column name mapping
- GIVEN a property `fechaNacimiento` in TypeScript
- WHEN defining the schema column
- THEN the column is defined as `integer('fecha_nacimiento', { mode: 'timestamp' })`
- AND Drizzle infers the TypeScript type as `Date`

### Requirement: Index Strategy
The system MUST define indexes for tenant filtering (`predio_id`, `activo`) and frequently queried columns.

#### Scenario: Tenant filtering index
- GIVEN a table with `predio_id` and `activo` columns
- WHEN creating the schema
- THEN a composite index `idx_{table}_predio_activo` is defined
- AND query performance is optimized for tenant-scoped pagination

### Requirement: Schema Export and Client Factory
The schema MUST be exported via `index.ts` and used by the Drizzle client factory in `packages/database/src/client.ts`.

#### Scenario: Client factory schema integration
- GIVEN the schema barrel export
- WHEN `createClient()` is called
- THEN the schema is passed to Drizzle's `drizzle()` function
- AND type inference works for all tables

## Tables Summary

| Domain | Tables | Count |
|--------|--------|-------|
| Security | usuarios, usuarios_contrasena, usuarios_historial_contrasenas, usuarios_login, usuarios_autenticacion_dos_factores, usuarios_roles, usuarios_permisos, usuarios_predios | 8 |
| Predios | predios, potreros, sectores, lotes, grupos, config_parametros_predio | 6 |
| Animales | animales, animales_imagenes, imagenes | 3 |
| Maestros | veterinarios, propietarios, hierros, diagnosticos_veterinarios, motivos_ventas, causas_muerte, lugares_compras, lugares_ventas | 8 |
| Servicios | servicios_palpaciones_grupal, servicios_palpaciones_animales, servicios_inseminacion_grupal, servicios_inseminacion_animales, servicios_partos_animales, servicios_partos_crias, servicios_veterinarios_grupal, servicios_veterinarios_animales, servicios_veterinarios_productos + 3 others | 12 |
| Configuracion | config_razas, config_condiciones_corporales, config_tipos_explotacion, config_calidad_animal, config_colores, config_rangos_edades, config_key_values | 7 |
| Productos | productos, productos_imagenes | 2 |
| Reportes | reportes_exportaciones | 1 |
| Notificaciones | notificaciones, notificaciones_preferencias, notificaciones_push_tokens | 3 |
| **Total** | | **55** |