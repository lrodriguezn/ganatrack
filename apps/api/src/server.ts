import 'reflect-metadata'
import 'dotenv/config'
import { buildApp } from './app.js'

const start = async () => {
  const app = await buildApp()

  try {
    const port = Number(process.env.PORT) || 4001
    const host = process.env.HOST || '0.0.0.0'
    await app.listen({ port, host })
    app.log.info(`GanaTrack API running on http://${host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
