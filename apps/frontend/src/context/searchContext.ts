import { createContext } from 'react'

export interface SearchContextValue {
  query: string
  setQuery: (query: string) => void
}

export const SearchContext = createContext<SearchContextValue | undefined>(undefined)
