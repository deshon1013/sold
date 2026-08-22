import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path: string, init: RequestInit): Promise<Response> {
  const headers = await authHeader()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...headers },
  })

  if (!res.ok) {
    const message = await res
      .json()
      .then((data: { error?: string }) => data.error)
      .catch(() => undefined)
    throw new Error(message ?? `Request failed: ${res.status}`)
  }

  return res
}

/** POSTs JSON to the Express backend, attaching the current Supabase session as a Bearer token. */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await request(path, { method: 'POST', body: JSON.stringify(body) })
  return res.json() as Promise<T>
}

/** DELETEs against the Express backend, attaching the current Supabase session as a Bearer token. */
export async function apiDelete(path: string, body: unknown): Promise<void> {
  await request(path, { method: 'DELETE', body: JSON.stringify(body) })
}
