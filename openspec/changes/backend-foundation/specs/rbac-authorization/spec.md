# RBAC Authorization Specification

## Purpose
Define permission-based access control middleware that validates user permissions against route requirements.

## Requirements

### Requirement: Permission Middleware
The system MUST provide middleware that checks if the authenticated user has the required permission for a route.

#### Scenario: Route with required permission
- GIVEN a route configured with permission `animales:write`
- WHEN a user with permission `animales:write` accesses the route
- THEN request proceeds to controller

#### Scenario: Missing permission
- GIVEN a route configured with permission `animales:write`
- WHEN a user without permission `animales:write` accesses the route
- THEN middleware returns 403 with error `FORBIDDEN`

### Requirement: Permission Format
Permissions MUST follow `recurso:accion` format (e.g., `animales:read`, `usuarios:admin`).

#### Scenario: Valid permission format
- GIVEN permission string `servicios:write`
- WHEN middleware validates
- THEN permission is recognized as valid format

#### Scenario: Invalid permission format
- GIVEN permission string `invalid`
- WHEN middleware validates
- THEN permission is rejected (not matched)

### Requirement: Super Admin Override
Permission `*:admin` MUST grant access to all resources regardless of specific permission required.

#### Scenario: Super admin access
- GIVEN a user with permission `*:admin`
- WHEN accessing any route with any required permission
- THEN request proceeds

#### Scenario: Super admin explicit check
- GIVEN a user with permission `*:admin`
- WHEN middleware checks for specific permission `animales:write`
- THEN access is granted even if `animales:write` is not explicitly listed

### Requirement: JWT Permission Extraction
User permissions MUST be extracted from JWT payload's `roles` array, which contains role names. Permissions are resolved from role-permission mappings.

#### Scenario: Permission resolution
- GIVEN JWT payload with roles `['ADMIN', 'VETERINARIO']`
- WHEN middleware extracts permissions
- THEN permissions are resolved from database role-permission mappings
- AND combined permission set is used for authorization

### Requirement: Route Configuration
Routes MUST declare required permissions in route configuration (e.g., via Fastify decorators or schema).

#### Scenario: Route permission declaration
- GIVEN a route handler for `GET /animales`
- WHEN route is registered
- THEN route metadata includes required permission `animales:read`
- AND middleware reads this metadata during request processing

### Requirement: Permission Caching
The system SHOULD cache user permissions to avoid repeated database queries per request.

#### Scenario: Permission cache hit
- GIVEN a user's permissions are cached
- WHEN the same user makes multiple requests
- THEN permissions are retrieved from cache
- AND database is not queried for each request

#### Scenario: Permission cache miss
- GIVEN a user's permissions are not cached
- WHEN the user makes a request
- THEN permissions are fetched from database
- AND cached for subsequent requests

### Requirement: Authorization Error Response
Unauthorized access MUST return 403 with error code `FORBIDDEN` and descriptive message.

#### Scenario: Forbidden response
- GIVEN a user without required permission
- WHEN accessing protected route
- THEN response body contains `{ success: false, error: { code: 'FORBIDDEN', message: 'No tienes permiso para acceder a este recurso' } }`