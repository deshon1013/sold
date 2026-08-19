import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { LoginFormValues, SignUpFormValues, User } from '../types/user'

function toUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    name: typeof supabaseUser.user_metadata.name === 'string' ? supabaseUser.user_metadata.name : '',
    email: supabaseUser.email ?? '',
    createdAt: supabaseUser.created_at,
  }
}

/**
 * Creates the Supabase auth user and stashes `name` in its metadata.
 * Returns null if the project has "Confirm email" enabled — there's no
 * session (and no user to show) until they click the link in their inbox.
 */
export async function signUp({ name, email, password }: SignUpFormValues): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(error.message)
  return data.session && data.user ? toUser(data.user) : null
}

export async function logIn({ email, password }: LoginFormValues): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return toUser(data.user)
}

export async function logOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/** Reads the current session (e.g. restored from storage on page load). */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ? toUser(data.user) : null
}

/** Fires on sign-in, sign-out, and token refresh; returns an unsubscribe function. */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toUser(session.user) : null)
  })
  return () => data.subscription.unsubscribe()
}
