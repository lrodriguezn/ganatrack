import { DomainError } from './domain.error.js'

export class ConflictError extends DomainError {
  constructor(message: string) {
    super('DUPLICATE_CODE', message, 409)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class VersionConflictError extends DomainError {
  constructor(currentVersion: number, expectedVersion: number) {
    super(
      'VERSION_CONFLICT',
      'El recurso fue modificado por otro usuario. Recarga e intenta de nuevo.',
      409,
      { currentVersion: [String(currentVersion)], expectedVersion: [String(expectedVersion)] },
    )
    Object.setPrototypeOf(this, VersionConflictError.prototype)
  }
}
