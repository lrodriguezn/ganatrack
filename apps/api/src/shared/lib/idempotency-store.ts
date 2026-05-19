// apps/api/src/shared/lib/idempotency-store.ts
/**
 * Idempotency Key Store — in-memory implementation with TTL.
 *
 * Provides a Redis-ready interface for future migration.
 * Keys expire after 24 hours to prevent unbounded memory growth.
 */

export interface IdempotencyRecord {
  key: string
  resourceId: number
  response: unknown
  createdAt: Date
  expiresAt: Date
}

export interface IIdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>
  set(key: string, record: Omit<IdempotencyRecord, 'createdAt' | 'expiresAt'>, ttlMs?: number): Promise<void>
  cleanup(): Promise<number>
}

/**
 * In-memory idempotency store with TTL-based expiration.
 * Suitable for single-instance deployments.
 * For clustered deployments, replace with Redis implementation.
 */
export class InMemoryIdempotencyStore implements IIdempotencyStore {
  private store: Map<string, IdempotencyRecord> = new Map()
  private readonly defaultTtlMs: number

  constructor(defaultTtlMs: number = 24 * 60 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const record = this.store.get(key)
    if (!record) return null

    // Return null if expired
    if (record.expiresAt < new Date()) {
      this.store.delete(key)
      return null
    }

    return record
  }

  async set(
    key: string,
    record: Omit<IdempotencyRecord, 'createdAt' | 'expiresAt'>,
    ttlMs?: number,
  ): Promise<void> {
    const now = new Date()
    const ttl = ttlMs ?? this.defaultTtlMs

    this.store.set(key, {
      ...record,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttl),
    })
  }

  async cleanup(): Promise<number> {
    const now = new Date()
    let removed = 0

    for (const [key, record] of this.store.entries()) {
      if (record.expiresAt < now) {
        this.store.delete(key)
        removed++
      }
    }

    return removed
  }

  /**
   * Returns the current number of entries (for testing/monitoring).
   */
  size(): number {
    return this.store.size
  }

  /**
   * Clears all entries (for testing).
   */
  clear(): void {
    this.store.clear()
  }
}
