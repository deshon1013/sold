import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser, onAuthChange } from '../lib/auth'
import type { User } from '../types/user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current)
      setCheckingSession(false)
    })
    return onAuthChange(setUser)
  }, [])

  return <AuthContext.Provider value={{ user, checkingSession }}>{children}</AuthContext.Provider>
}
