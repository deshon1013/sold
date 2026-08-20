const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "3h ago", "2d ago", etc. Falls back to "just now" for anything under a minute. */
export function relativeTime(isoDate: string): string {
  const seconds = (Date.parse(isoDate) - Date.now()) / 1000

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return formatter.format(Math.round(seconds / secondsInUnit), unit)
    }
  }
  return 'just now'
}
