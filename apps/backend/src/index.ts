import './lib/loadEnv.js'
import cors from 'cors'
import express from 'express'
import { uploadsRouter } from './routes/uploads.js'

const app = express()
const port = process.env.PORT ?? 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/uploads', uploadsRouter)

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
