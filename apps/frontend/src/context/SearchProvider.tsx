import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SearchContext } from './searchContext'

interface SearchProviderProps {
  children: ReactNode
}

/** Header writes the query, HomePage reads it to filter -- kept in one place since they're siblings, not parent/child. */
export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQuery] = useState('')

  const value = useMemo(() => ({ query, setQuery }), [query])

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
