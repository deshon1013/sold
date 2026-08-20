import { existsSync } from 'node:fs'

// Must be imported before anything that reads process.env at module scope.
const envFile = '.env.local'
if (existsSync(envFile)) {
  process.loadEnvFile(envFile)
}
