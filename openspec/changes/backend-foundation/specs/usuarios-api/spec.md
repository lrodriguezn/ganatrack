# Usuarios API Specification

## Purpose
Define user management endpoints, role assignment, and permission management for GanaTrack's RBAC system.

## Requirements

### Requirement: User List Endpoint
The system MUST provide `GET /usuarios` with pagination and filters.

#### Scenario: Paginated user list
- GIVEN authenticated admin user
- WHEN requesting `GET /usuarios?page=1&limit=20&activo=1`
- THEN response contains `{ success: true, data: [...], meta: { page, limit, total } }`
- AND only active users are returned (activo=1)

#### Scenario: User search filter
- GIVEN users with names 'Juan Perez' and 'Maria Garcia'
- WHEN requesting `GET /usuarios?search=Juan`
- THEN response includes only 'Juan Perez'

### Requirement: Single User Endpoint
The system MUST provide `GET /usuarios/:id` to retrieve a single user.

#### Scenario: Get existing user
- GIVEN a user with id=1 exists
- WHEN requesting `GET /usuarios/1`
- THEN response contains user data with roles and predios

#### Scenario: Get non-existent user
- GIVEN no user with id=999
- WHEN requesting `GET /usuarios/999`
- THEN response returns 404 with error `NOT_FOUND`

### Requirement: User Creation
The system MUST provide `POST /usuarios` to create users with password hashing and role assignment.

#### Scenario: Create user with roles
- GIVEN admin user with `usuarios:write` permission
- WHEN posting `{ nombre, email, password, rolesIds: [1,2] }` to `/usuarios`
- THEN password is hashed with bcrypt (cost 12)
- AND user is created in `usuarios` table
- AND password hash stored in `usuarios_contrasena`
- AND user-role associations created in `usuarios_roles`
- AND response returns created user with id

#### Scenario: Duplicate email
- GIVEN existing user with email 'admin@ganatrack.com'
- WHEN posting with same email
- THEN response returns 409 with error `DUPLICATE_EMAIL`

### Requirement: User Update
The system MUST provide `PUT /usuarios/:id` to update user details.

#### Scenario: Update user name
- GIVEN a user with id=1
- WHEN posting `{ nombre: 'New Name' }` to `/usuarios/1`
- THEN user's nombre is updated
- AND updated_at timestamp is refreshed

#### Scenario: Update non-existent user
- GIVEN no user with id=999
- WHEN posting update to `/usuarios/999`
- THEN response returns 404

### Requirement: User Soft Delete
The system MUST provide `DELETE /usuarios/:id` to soft-delete users (set activo=0).

#### Scenario: Soft delete user
- GIVEN a user with id=1 and activo=1
- WHEN deleting `/usuarios/1`
- THEN user's activo field is set to 0
- AND user is excluded from future queries (activo filter)

#### Scenario: Delete non-existent user
- GIVEN no user with id=999
- WHEN deleting `/usuarios/999`
- THEN response returns 404

### Requirement: Role Assignment
The system MUST provide `POST /usuarios/:id/roles` to assign roles to users.

#### Scenario: Assign roles to user
- GIVEN a user with id=1 and rolesIds [2,3]
- WHEN posting `{ rolesIds: [2,3] }` to `/usuarios/1/roles`
- THEN existing user-role associations are replaced
- AND new associations are created for roles 2 and 3

#### Scenario: Assign non-existent role
- GIVEN rolesIds containing id 999
- WHEN posting to `/usuarios/1/roles`
- THEN response returns 422 with error `ROLE_NOT_FOUND`

### Requirement: Role Management
The system MUST provide CRUD endpoints for roles: `GET /roles`, `GET /roles/:id`, `POST /roles`, `PUT /roles/:id`.

#### Scenario: Create role with permissions
- GIVEN admin user
- WHEN posting `{ nombre: 'Veterinario', permisosIds: [1,2,3] }` to `/roles`
- THEN role is created in `usuarios_roles` (note: separate table)
- AND role-permission associations created
- AND response returns created role with id

#### Scenario: Update role permissions
- GIVEN a role with id=1
- WHEN posting `{ permisosIds: [4,5] }` to `/roles/1`
- THEN existing role-permission associations are replaced
- AND new associations are created

### Requirement: Permission List
The system MUST provide `GET /permisos` to list all available permissions.

#### Scenario: List permissions
- GIVEN permissions exist in database
- WHEN requesting `GET /permisos`
- THEN response contains array of permissions with format `recurso:accion`

### Requirement: RBAC Authorization
All endpoints (except auth) MUST require appropriate permissions. Permission format is `recurso:accion`.

#### Scenario: Authorized access
- GIVEN a user with permission `usuarios:read`
- WHEN requesting `GET /usuarios`
- THEN request proceeds

#### Scenario: Unauthorized access
- GIVEN a user without permission `usuarios:write`
- WHEN posting to `/usuarios`
- THEN response returns 403 with error `FORBIDDEN`

### Requirement: Super Admin Permission
Permission `*:admin` grants access to all resources.

#### Scenario: Super admin access
- GIVEN a user with permission `*:admin`
- WHEN accessing any endpoint
- THEN request proceeds regardless of specific resource permissions