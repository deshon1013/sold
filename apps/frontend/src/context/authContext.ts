import { createContext } from 'react'
import type { User } from '../types/user'

export interface AuthContextValue {
  user: User | null
  checkingSession: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
