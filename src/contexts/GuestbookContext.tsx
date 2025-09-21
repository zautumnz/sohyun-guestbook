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
  deleteEntry: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  goToPage: (page: number) => void;
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
  const entriesPerSpread = 4 // 2 entries per side, 2 sides per spread
  const totalPages = Math.max(1, Math.ceil(entries.length / entriesPerSpread) + 1)

  // Convert API timestamp string to Date object
  const transformApiEntry = (apiEntry: GuestbookEntry & { timestamp: string }): GuestbookEntry => ({
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
      const transformedEntry = transformApiEntry(createdEntry as unknown as GuestbookEntry & { timestamp: string })

      setEntries(prev => [...prev, transformedEntry])
      console.log('Added new entry:', transformedEntry)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry'
      setError(errorMessage)
      console.error('Error creating entry:', err)
      throw err // Re-throw to let the UI handle it
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      setError(null)
      await guestbookApi.deleteEntry(id)
      setEntries(prev => prev.filter(entry => entry.id !== id))
      console.log('Deleted entry:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry'
      setError(errorMessage)
      console.error('Error deleting entry:', err)
      throw err // Re-throw to let the UI handle it
    }
  }

  // Load entries on mount
  useEffect(() => {
    refreshEntries()
  }, [])

  const setCurrentPage = (page: number) => {
    const maxPages = Math.max(1, Math.ceil(entries.length / entriesPerSpread) + 1)
    if (page >= 0 && page < maxPages) {
      setCurrentPageState(page)
    }
  }

  const nextPage = () => {
    const maxPages = Math.max(1, Math.ceil(entries.length / entriesPerSpread) + 1)
    if (currentPage < maxPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <GuestbookContext.Provider value={{
      entries,
      currentPage,
      totalPages,
      loading,
      error,
      addEntry,
      deleteEntry,
      setCurrentPage,
      goToPage,
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
