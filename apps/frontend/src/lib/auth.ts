import type { AuthChangeEvent, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { LoginFormValues, SignUpFormValues, User } from '../types/user'

function toUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    name: typeof supabaseUser.user_metadata.name === 'string' ? supabaseUser.user_metadata.name : '',
    email: supabaseUser.email ?? '',
    createdAt: supabaseUser.created_at,
    avatarUrl:
      typeof supabaseUser.user_metadata.avatar_url === 'string' ? supabaseUser.user_metadata.avatar_url : undefined,
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

export interface ProfileUpdate {
  name?: string
  avatarUrl?: string
}

/** Updates name/avatar in the user's own metadata. `onAuthChange` picks up the result automatically. */
export async function updateProfile(update: ProfileUpdate): Promise<User> {
  const data: Record<string, string> = {}
  if (update.name !== undefined) data.name = update.name
  if (update.avatarUrl !== undefined) data.avatar_url = update.avatarUrl

  const { data: result, error } = await supabase.auth.updateUser({ data })
  if (error) throw new Error(error.message)
  return toUser(result.user)
}

/** Reads the current session (e.g. restored from storage on page load). */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ? toUser(data.user) : null
}

/** Fires on sign-in, sign-out, token refresh, and password-recovery link clicks; returns an unsubscribe function. */
export function onAuthChange(callback: (user: User | null, event: AuthChangeEvent) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ? toUser(session.user) : null, event)
  })
  return () => data.subscription.unsubscribe()
}

/** Emails a link back to /reset-password. Clicking it briefly signs the user in under a 'PASSWORD_RECOVERY' event. */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(error.message)
}

/** Only succeeds while a recovery session (from the emailed link) is active. */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}
