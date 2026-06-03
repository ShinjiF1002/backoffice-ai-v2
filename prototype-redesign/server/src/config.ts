import path from 'node:path'

const SERVER_DIR = path.resolve(import.meta.dirname, '..')

export interface ServerConfig {
  /** listen port (contract 07 §5c: default 5180, env SERVER_PORT). */
  port: number
  /** bind host (contract 01 §B-1 #1: default loopback; public only via explicit env). */
  host: string
  /** sqlite file (contract 07 §5c: env DB_PATH, dev default server/data/dev.sqlite). */
  dbPath: string
  /** HMAC signing secret (contract 03 / 07 §5c). Absent is allowed — check:server must pass without it. */
  sessionSecret: string | undefined
  /** destructive demo reset gate (contract 09 §4: default disabled). */
  resetEnabled: boolean
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    port: Number(env.SERVER_PORT ?? 5180),
    host: env.SERVER_HOST ?? '127.0.0.1',
    dbPath: env.DB_PATH ?? path.join(SERVER_DIR, 'data', 'dev.sqlite'),
    sessionSecret: env.BOAI_SESSION_SECRET,
    resetEnabled: env.DEMO_RESET_ENABLED === 'true',
  }
}
