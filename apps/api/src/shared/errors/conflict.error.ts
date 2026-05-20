import { DomainError } from './domain.error.js'

export class ConflictError extends DomainError {
  constructor(message: string) {
    super('DUPLICATE_CODE', message, 409)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class VersionConflictError extends ConflictError {
  constructor(currentVersion: number, expectedVersion: number) {
    super('El recurso fue modificado por otro usuario. Recarga e intenta de nuevo.')
    this.code = 'VERSION_CONFLICT'
    this.details = {
      currentVersion: String(currentVersion),
      expectedVersion: String(expectedVersion),
    }
    Object.setPrototypeOf(this, VersionConflictError.prototype)
  }
}
