import { createContext } from 'react'
import type { User } from '../types/user'

export interface AuthContextValue {
  user: User | null
  checkingSession: boolean
  /** True from the moment a password-recovery link is clicked until the new password is set. */
  passwordRecovery: boolean
  clearPasswordRecovery: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
