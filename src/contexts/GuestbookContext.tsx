import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { guestbookApi, CreateEntryPayload, ContentItem, CreateContentItem } from '../services/guestbookApi'

export interface GuestbookEntry {
  id: string;
  content: ContentItem[];
  author: string;
  timestamp: Date;
  pageNumber: number;
  position: { x: number; y: number };
  approved?: boolean;
}

export interface ContentItemWithMeta extends ContentItem {
  id: string;
  author: string;
  timestamp: Date;
  entryId: string;
}

interface GuestbookContextType {
  entries: GuestbookEntry[];
  contentItems: ContentItemWithMeta[];
  pendingEntries: GuestbookEntry[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isMobile: boolean;
  addEntry: (entry: { content: CreateContentItem[]; author: string; position: { x: number; y: number } }) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  approveEntry: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refreshEntries: () => Promise<void>;
}

const GuestbookContext = createContext<GuestbookContextType | null>(null)

export const GuestbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [pendingEntries, setPendingEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, _setIsAdmin] = useState(false)
  const [adminPassword, _setAdminPassword] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

  const [currentPage, setCurrentPageState] = useState(0)

  // Convert entries to content items for pagination (include pending entries for immediate preview)
  const allVisibleEntries = [...entries, ...pendingEntries]
  const contentItems: ContentItemWithMeta[] = allVisibleEntries.flatMap(entry =>
    entry.content.map(item => ({
      ...item,
      id: `${entry.id}_${entry.content.indexOf(item)}`,
      author: entry.author,
      timestamp: entry.timestamp,
      entryId: entry.id
    }))
  )

  const itemsPerSpread = 6 // 3 items per side, 2 sides per spread
  const itemsPerMobilePage = 3 // 3 items per mobile page
  // Calculate total pages based on whether we're using mobile or desktop layout
  const totalPages = Math.max(1, Math.ceil(contentItems.length / itemsPerSpread))

  // Convert API timestamp string to Date object
  const transformApiEntry = (apiEntry: GuestbookEntry & { timestamp: string }): GuestbookEntry => ({
    ...apiEntry,
    timestamp: new Date(apiEntry.timestamp)
  })

  const refreshEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const apiEntries = await guestbookApi.getEntries(isAdmin ? adminPassword : undefined)
      const transformedEntries = apiEntries.map(transformApiEntry)
      setEntries(transformedEntries)
      // Clear pending entries after refresh since we now have fresh data
      setPendingEntries([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch entries'
      setError(errorMessage)
      console.error('Error fetching entries:', err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, adminPassword])

  // Check for mobile viewport and admin mode on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    /*
    This is the worst possible way to do auth, but it only had to last two weeks
    const urlParams = new URLSearchParams(window.location.search)
    const password = urlParams.get('pw')
    if (password === 'uVSM3L4LZ29vLlRMsM5u1jxPTPX1FYU') {
      setIsAdmin(true)
      setAdminPassword(password)
    }
    */

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Refresh entries when admin mode changes
  useEffect(() => {
    if (isAdmin && adminPassword) {
      refreshEntries()
    }
  }, [isAdmin, adminPassword, refreshEntries])


  const addEntry = async (newEntry: { content: CreateContentItem[]; author: string; position: { x: number; y: number } }) => {
    try {
      setError(null)
      const createPayload: CreateEntryPayload = {
        content: newEntry.content,
        author: newEntry.author,
        position: newEntry.position
      }

      const createdEntry = await guestbookApi.createEntry(createPayload)
      const transformedEntry = transformApiEntry(createdEntry as unknown as GuestbookEntry & { timestamp: string })

      // Add to pending entries for immediate preview
      setPendingEntries(prev => [...prev, transformedEntry])
      console.log('Added new entry to pending:', transformedEntry)
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
  }, [refreshEntries])

  const setCurrentPage = (page: number) => {
    const maxPages = Math.max(1, Math.ceil(contentItems.length / itemsPerSpread) + 1)
    if (page >= 0 && page < maxPages) {
      setCurrentPageState(page)
    }
  }

  const nextPage = () => {
    const maxPages = Math.max(1, Math.ceil(contentItems.length / itemsPerSpread) + 1)
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

  const approveEntry = async (id: string) => {
    if (!isAdmin || !adminPassword) {
      throw new Error('Admin access required')
    }

    try {
      setError(null)
      await guestbookApi.approveEntry(id, adminPassword)

      // Move from pending to approved entries if it exists in pending
      const pendingEntry = pendingEntries.find(entry => entry.id === id)
      if (pendingEntry) {
        setPendingEntries(prev => prev.filter(entry => entry.id !== id))
        setEntries(prev => [...prev, { ...pendingEntry, approved: true }])
      } else {
        // Update existing entry
        setEntries(prev => prev.map(entry =>
          entry.id === id ? { ...entry, approved: true } : entry
        ))
      }

      console.log('Approved entry:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve entry'
      setError(errorMessage)
      console.error('Error approving entry:', err)
      throw err
    }
  }

  return (
    <GuestbookContext.Provider value={{
      entries,
      contentItems,
      pendingEntries,
      currentPage,
      totalPages,
      loading,
      error,
      isAdmin,
      isMobile,
      addEntry,
      deleteEntry,
      approveEntry,
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
