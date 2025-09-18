import React, { createContext, useContext, useState, useEffect } from 'react'

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
  addEntry: (entry: Omit<GuestbookEntry, 'id' | 'timestamp' | 'pageNumber'>) => void;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const GuestbookContext = createContext<GuestbookContextType | null>(null)

export const GuestbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to our digital guestbook! Please sign in and share your thoughts.',
      author: 'The Hosts',
      timestamp: new Date('2024-01-01'),
      pageNumber: 1,
      position: { x: 50, y: 30 }
    },
    {
      id: '2',
      type: 'text',
      content: 'What a beautiful place! Thank you for having us.',
      author: 'Sarah & Mike',
      timestamp: new Date('2024-01-15'),
      pageNumber: 1,
      position: { x: 60, y: 60 }
    }
  ])
  
  const [currentPage, setCurrentPageState] = useState(0)
  const entriesPerPage = 6
  const totalPages = Math.max(1, Math.ceil(entries.length / entriesPerPage) + 1)

  const addEntry = (newEntry: Omit<GuestbookEntry, 'id' | 'timestamp' | 'pageNumber'>) => {
    const entry: GuestbookEntry = {
      ...newEntry,
      id: Date.now().toString(),
      timestamp: new Date(),
      pageNumber: Math.ceil((entries.length + 1) / entriesPerPage)
    }
    
    setEntries(prev => [...prev, entry])
    console.log('Added new entry:', entry)
  }

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
      addEntry,
      setCurrentPage,
      nextPage,
      prevPage
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