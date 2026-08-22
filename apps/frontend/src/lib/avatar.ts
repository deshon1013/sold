import type { User } from '../types/user'

/** Falls back to initials derived from the name (or email) when there's no avatar image. */
export function getInitials({ name, email }: User): string {
  const source = name.trim() || email
  const parts = source.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}
