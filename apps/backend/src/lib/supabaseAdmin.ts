import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase env vars. Copy apps/backend/.env.example to apps/backend/.env.local ' +
      'and fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API Keys -> service_role).',
  )
}

// Service-role client: bypasses RLS, server-side only. Never expose this key to the browser.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** Verifies a Supabase access token (from the frontend's session) and returns the user id, or null. */
export async function getUserIdFromToken(accessToken: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
  if (error || !data.user) return null
  return data.user.id
}
