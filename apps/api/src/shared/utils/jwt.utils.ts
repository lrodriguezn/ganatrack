import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_IN = '7d'

export interface JwtPayload {
  sub: number
  roles: string[]
  permisos?: string[]
  predioIds: number[]
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: ACCESS_EXPIRES_IN })
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: REFRESH_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string) as unknown as JwtPayload
}
