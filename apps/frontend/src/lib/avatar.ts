/** Falls back to initials derived from a display name (or email) when there's no avatar image. */
export function getInitials(displayName: string): string {
  const source = displayName.trim()
  const parts = source.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}
