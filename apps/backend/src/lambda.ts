import { configure } from '@vendia/serverless-express'
import { app } from './app.js'

// Entry point for AWS Lambda (via a Function URL). Local dev uses index.ts instead,
// which calls app.listen() directly -- env vars here come from the Lambda's own
// configuration (set by the SAM template), not from a .env.local file.
export const handler = configure({ app })
