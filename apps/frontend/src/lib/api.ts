import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** POSTs JSON to the Express backend, attaching the current Supabase session as a Bearer token. */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeader()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const message = await res
      .json()
      .then((data: { error?: string }) => data.error)
      .catch(() => undefined)
    throw new Error(message ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}
