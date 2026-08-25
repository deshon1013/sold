import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser, onAuthChange } from '../lib/auth'
import type { User } from '../types/user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current)
      setCheckingSession(false)
    })
    return onAuthChange((nextUser, event) => {
      // Clicking the emailed reset link briefly signs the user in -- that
      // shouldn't drop them into the normal app, so this gets tracked
      // separately and App.tsx routes to the reset-password screen instead.
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      setUser(nextUser)
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, checkingSession, passwordRecovery, clearPasswordRecovery: () => setPasswordRecovery(false) }}
    >
      {children}
    </AuthContext.Provider>
  )
}
