import { injectable, inject } from 'tsyringe'
import type { DbClient } from '@ganatrack/database'
import type { ITransactionManager, TransactionCallback } from '../types/transaction.js'

/**
 * Drizzle implementation of transaction manager
 * Uses better-sqlite3 transactions for SQLite and postgres transactions for PostgreSQL
 */
@injectable()
export class DrizzleTransactionManager implements ITransactionManager {
  constructor(@inject('DbClient') private readonly db: DbClient) {}

  async execute<T>(callback: TransactionCallback<T>): Promise<T> {
    const provider = process.env.DATABASE_PROVIDER ?? 'sqlite'

    if (provider === 'sqlite') {
      return this.executeSqlite(callback)
    }

    return this.executePostgres(callback)
  }

  private async executeSqlite<T>(callback: TransactionCallback<T>): Promise<T> {
    // SQLite with better-sqlite3 uses synchronous transactions
    // We need to wrap it for async compatibility
    return new Promise((resolve, reject) => {
      try {
        // Access underlying better-sqlite3 instance from Drizzle client
        // Drizzle v0.x wraps better-sqlite3 and exposes it via .db property
        const sqliteDb = (this.db as unknown as { db: { exec: (sql: string) => void } }).db
        const savepointName = `sp_${Date.now()}`

        sqliteDb.exec(`SAVEPOINT ${savepointName}`)

        Promise.resolve(callback(this.db))
          .then((result) => {
            sqliteDb.exec(`RELEASE SAVEPOINT ${savepointName}`)
            resolve(result)
          })
          .catch((error) => {
            sqliteDb.exec(`ROLLBACK TO SAVEPOINT ${savepointName}`)
            reject(error)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  private async executePostgres<T>(callback: TransactionCallback<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      return callback(tx)
    })()
  }
}
