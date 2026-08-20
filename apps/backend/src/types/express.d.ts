declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth once the caller's Supabase session has been verified. */
      userId?: string
    }
  }
}

export {}
