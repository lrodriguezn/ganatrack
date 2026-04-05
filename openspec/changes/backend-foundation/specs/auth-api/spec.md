# Authentication API Specification

## Purpose
Define authentication endpoints, JWT token management, two-factor authentication flow, and password change functionality for GanaTrack backend.

## Requirements

### Requirement: Login Endpoint
The system MUST provide `POST /auth/login` that validates email/password and returns JWT tokens or 2FA requirement.

#### Scenario: Successful login without 2FA
- GIVEN a user with email 'admin@ganatrack.com' and valid password
- WHEN posting `{ email, password }` to `/auth/login`
- THEN response contains `{ accessToken, refreshToken, expiresIn: 900, usuario: { id, nombre, roles } }`
- AND no email field is included in response (security)

#### Scenario: Login with 2FA enabled
- GIVEN a user with 2FA enabled
- WHEN posting valid credentials to `/auth/login`
- THEN response contains `{ requires2FA: true, tempToken }`
- AND tempToken is an opaque JWT with 5-minute TTL encoding userId internally

#### Scenario: Invalid credentials
- GIVEN an invalid email or password
- WHEN posting to `/auth/login`
- THEN response returns 401 with error code `INVALID_CREDENTIALS`

### Requirement: JWT Token Structure
Access tokens MUST be JWT with payload `{ sub: userId, roles: [], predioIds: [], iat, exp }`. Access token TTL MUST be 15 minutes. Refresh token TTL MUST be 7 days.

#### Scenario: Token payload validation
- GIVEN a valid access token
- WHEN decoding the JWT
- THEN payload contains user ID in `sub`, array of role names, array of predio IDs
- AND expiration is within 15 minutes of issuance

### Requirement: Token Refresh
The system MUST provide `POST /auth/refresh` that rotates refresh tokens and returns new access token. Refresh token MUST be stored in httpOnly cookie.

#### Scenario: Successful token refresh
- GIVEN a valid refresh token in httpOnly cookie
- WHEN posting to `/auth/refresh`
- THEN response contains new `{ accessToken }`
- AND new refresh token is set in httpOnly cookie (rotation)
- AND old refresh token is marked inactive in database

#### Scenario: Invalid refresh token
- GIVEN an expired or revoked refresh token
- WHEN posting to `/auth/refresh`
- THEN response returns 401 with error `UNAUTHORIZED`

### Requirement: Logout
The system MUST provide `POST /auth/logout` that revokes the refresh token.

#### Scenario: Successful logout
- GIVEN a valid refresh token in cookie
- WHEN posting to `/auth/logout`
- THEN the refresh token is marked inactive in `usuarios_login` table
- AND httpOnly cookie is cleared

### Requirement: Two-Factor Authentication Verification
The system MUST provide `POST /auth/2fa/verify` that validates tempToken and OTP code, returning JWT tokens.

#### Scenario: Successful 2FA verification
- GIVEN a valid tempToken and correct 6-digit OTP code
- WHEN posting `{ tempToken, codigo }` to `/auth/2fa/verify`
- THEN response contains `{ accessToken, refreshToken }`
- AND OTP code is marked as used

#### Scenario: Invalid OTP code
- GIVEN a valid tempToken but incorrect OTP code
- WHEN posting to `/auth/2fa/verify`
- THEN response returns 400 with error `TWO_FA_INVALID`
- AND attempt counter increments (max 3 attempts)

#### Scenario: Expired tempToken
- GIVEN a tempToken older than 5 minutes
- WHEN posting to `/auth/2fa/verify`
- THEN response returns 401 with error `UNAUTHORIZED`

### Requirement: 2FA Code Resend
The system MUST provide `POST /auth/2fa/resend` that regenerates OTP code for a tempToken.

#### Scenario: Successful code resend
- GIVEN a valid tempToken
- WHEN posting `{ tempToken, metodo: 'email' }` to `/auth/2fa/resend`
- THEN new OTP code is generated and sent via specified method
- AND previous OTP code is invalidated

### Requirement: Password Change
The system MUST provide `POST /auth/change-password` that validates current password and checks history (last 5 passwords).

#### Scenario: Successful password change
- GIVEN a user with valid current password
- WHEN posting `{ passwordActual, passwordNuevo }` to `/auth/change-password`
- THEN new password is hashed with bcrypt (cost factor 12)
- AND new hash is stored in `usuarios_contrasena`
- AND old hash is added to `usuarios_historial_contrasenas`
- AND all active refresh tokens for the user are revoked

#### Scenario: Password history violation
- GIVEN a user whose new password matches one of the last 5 passwords
- WHEN posting to `/auth/change-password`
- THEN response returns 422 with error `PASSWORD_HISTORY_VIOLATION`

#### Scenario: Invalid current password
- GIVEN an incorrect `passwordActual`
- WHEN posting to `/auth/change-password`
- THEN response returns 401 with error `INVALID_CREDENTIALS`

### Requirement: Rate Limiting
Login endpoint MUST be rate-limited to 10 attempts per IP in 15-minute window. General API rate limit MUST be 200 requests per minute per token.

#### Scenario: Login rate limit exceeded
- GIVEN 10 failed login attempts from same IP within 15 minutes
- WHEN attempting 11th login
- THEN response returns 429 with error `RATE_LIMIT_EXCEEDED`

### Requirement: Tenant Context Middleware
The system MUST validate `X-Predio-Id` header against user's `predioIds` from JWT. Invalid predio returns 403.

#### Scenario: Valid predio header
- GIVEN a user with predioIds [1,2] in JWT
- WHEN request includes header `X-Predio-Id: 1`
- THEN request proceeds to controller

#### Scenario: Invalid predio header
- GIVEN a user with predioIds [1,2] in JWT
- WHEN request includes header `X-Predio-Id: 3`
- THEN response returns 403 with error `FORBIDDEN`