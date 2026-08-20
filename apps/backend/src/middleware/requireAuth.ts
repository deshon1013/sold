import type { NextFunction, Request, Response } from 'express'
import { getUserIdFromToken } from '../lib/supabaseAdmin.js'

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  if (!token) {
    res.status(401).json({ error: 'Missing Authorization header' })
    return
  }

  const userId = await getUserIdFromToken(token)
  if (!userId) {
    res.status(401).json({ error: 'Invalid or expired session' })
    return
  }

  req.userId = userId
  next()
}
