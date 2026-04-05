import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePG } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres from 'postgres'
import * as schema from './schema/index.js'

export type DbClient = ReturnType<typeof createClient>

export function createClient() {
  const provider = process.env.DATABASE_PROVIDER ?? 'sqlite'

  if (provider === 'sqlite') {
    const dbPath = process.env.DATABASE_URL ?? 'dev.db'
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    return drizzleSQLite(sqlite, { schema })
  }

  const sql = postgres(process.env.DATABASE_URL!)
  return drizzlePG(sql, { schema })
}
