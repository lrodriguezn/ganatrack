import Database from 'better-sqlite3';
import postgres from 'postgres';
import * as schema from './schema/index.js';
export type DbClient = ReturnType<typeof createClient>;
export declare function createClient(): (import("drizzle-orm/better-sqlite3").BetterSQLite3Database<typeof schema> & {
    $client: Database.Database;
}) | (import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
});
//# sourceMappingURL=client.d.ts.map