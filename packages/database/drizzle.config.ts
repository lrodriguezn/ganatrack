import type { Config } from 'drizzle-kit'

const provider = process.env.DATABASE_PROVIDER ?? 'sqlite'

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: provider === 'sqlite' ? 'sqlite' : 'postgresql',
  dbCredentials: provider === 'sqlite'
    ? { url: process.env.DATABASE_URL ?? 'dev.db' }
    : { url: process.env.DATABASE_URL! },
} satisfies Config
