import React, { createContext, useContext, useState, useEffect } from 'react'
import { guestbookApi, CreateEntryPayload } from '../services/guestbookApi'

export interface GuestbookEntry {
  id: string;
  type: 'text' | 'image';
  content: string;
  author: string;
  timestamp: Date;
  pageNumber: number;
  position: { x: number; y: number };
}

interface GuestbookContextType {
  entries: GuestbookEntry[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  addEntry: (entry: Omit<GuestbookEntry, 'id' | 'timestamp' | 'pageNumber'>) => Promise<void>;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refreshEntries: () => Promise<void>;
}

const GuestbookContext = createContext<GuestbookContextType | null>(null)

export const GuestbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPageState] = useState(0)
  const entriesPerPage = 6
  const totalPages = Math.max(1, Math.ceil(entries.length / entriesPerPage) + 1)

  // Convert API timestamp string to Date object
  const transformApiEntry = (apiEntry: GuestbookEntry & { timestamp: string}): GuestbookEntry => ({
    ...apiEntry,
    timestamp: new Date(apiEntry.timestamp)
  })

  const refreshEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const apiEntries = await guestbookApi.getEntries()
      const transformedEntries = apiEntries.map(transformApiEntry)
      setEntries(transformedEntries)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch entries'
      setError(errorMessage)
      console.error('Error fetching entries:', err)
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async (newEntry: Omit<GuestbookEntry, 'id' | 'timestamp' | 'pageNumber'>) => {
    try {
      setError(null)
      const createPayload: CreateEntryPayload = {
        type: newEntry.type,
        content: newEntry.content,
        author: newEntry.author,
        position: newEntry.position
      }

      const createdEntry = await guestbookApi.createEntry(createPayload)
      const transformedEntry = transformApiEntry(createdEntry)

      setEntries(prev => [...prev, transformedEntry])
      console.log('Added new entry:', transformedEntry)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry'
      setError(errorMessage)
      console.error('Error creating entry:', err)
      throw err // Re-throw to let the UI handle it
    }
  }

  // Load entries on mount
  useEffect(() => {
    refreshEntries()
  }, [])

  const setCurrentPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPageState(page)
    }
  }

  const nextPage = () => setCurrentPage(currentPage + 1)
  const prevPage = () => setCurrentPage(currentPage - 1)

  return (
    <GuestbookContext.Provider value={{
      entries,
      currentPage,
      totalPages,
      loading,
      error,
      addEntry,
      setCurrentPage,
      nextPage,
      prevPage,
      refreshEntries
    }}>
      {children}
    </GuestbookContext.Provider>
  )
}

export const useGuestbook = () => {
  const context = useContext(GuestbookContext)
  if (!context) throw new Error('useGuestbook must be used within GuestbookProvider')
  return context
}
