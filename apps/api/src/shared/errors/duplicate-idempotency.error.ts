import { DomainError } from './domain.error.js'

/**
 * Error thrown when a duplicate idempotency key is detected.
 * The middleware catches this and returns 200 with the cached response
 * (standard idempotency behavior — the original request already succeeded).
 */
export class DuplicateIdempotencyError extends DomainError {
  public readonly resourceId: number
  public readonly cachedResponse: unknown

  constructor(message: string, resourceId: number, cachedResponse: unknown) {
    super('DUPLICATE_IDEMPOTENCY_KEY', message, 200)
    this.resourceId = resourceId
    this.cachedResponse = cachedResponse
    Object.setPrototypeOf(this, DuplicateIdempotencyError.prototype)
  }
}
