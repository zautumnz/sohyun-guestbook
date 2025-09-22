import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { useLightbox } from '@/contexts/LightboxContext'
import { Calendar, User, Trash2 } from 'lucide-react'
import type { ContentItemWithMeta } from '@/contexts/GuestbookContext'

interface BookPageProps {
  pageNumber: number;
  side: 'left' | 'right' | 'single';
}

const BookPage: React.FC<BookPageProps> = ({ pageNumber, side }) => {
  const { contentItems, deleteEntry } = useGuestbook()
  const { openLightbox } = useLightbox()
  const [showDeleteButtons, setShowDeleteButtons] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)

  // Check for password query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const password = urlParams.get('pw')
    setShowDeleteButtons(password === '20250514')
  }, [])

  // Handle content readiness when page changes
  useEffect(() => {
    setIsContentReady(false)
    const timer = setTimeout(() => {
      setIsContentReady(true)
    }, 50) // Small delay to ensure smooth transition

    return () => clearTimeout(timer)
  }, [pageNumber])

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId)
      } catch (error) {
        alert('Failed to delete entry. Please try again.')
      }
    }
  }

  // Get content items for this side
  let pageItems: ContentItemWithMeta[]
  if (side === 'single') {
    // Mobile: 2 items per page
    const startIndex = pageNumber * 2
    pageItems = contentItems.slice(startIndex, startIndex + 2)
  } else {
    // Desktop: 2 items per side, 4 per spread
    const spreadStartIndex = pageNumber * 4
    const sideStartIndex = side === 'left' ? spreadStartIndex : spreadStartIndex + 2
    pageItems = contentItems.slice(sideStartIndex, sideStartIndex + 2)
  }

  return (
    <div className={`w-full h-full p-6 book-page relative overflow-hidden ${
      side === 'left' ? 'pr-4' : 
      side === 'right' ? 'pl-4' : 
      'px-2' // single page mode
    }`}>

      {/* Content loading overlay */}
      {!isContentReady && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
          <div className="text-purple-400 text-2xl">✨</div>
        </div>
      )}
      {/* Kawaii decorative stars */}
      <div className="absolute top-4 left-8 text-purple-300/40 text-sm kawaii-star">✨</div>
      <div className="absolute top-12 right-12 text-pink-300/40 text-xs kawaii-star">⭐</div>
      <div className="absolute bottom-8 left-16 text-purple-300/40 text-xs kawaii-star">💫</div>
      <div className="absolute bottom-16 right-8 text-pink-300/40 text-sm kawaii-star">🌟</div>

      {/* Paper texture overlay with kawaii pattern */}
      <div className="absolute inset-0 opacity-15 paper-texture" />

      {/* Ruled lines for writing */}
      <div className="absolute inset-8 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-purple-200/20"
            style={{ top: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* Decorative lace border */}
      <div className="absolute top-0 left-0 right-0 h-4 lace-border opacity-30" />
      <div className="absolute bottom-0 left-0 right-0 h-4 lace-border opacity-30" />

      {/* Page Header - show on left side or single page mode */}
      {(side === 'left' || side === 'single') && (
        <div className="relative z-10 mb-6">
          <div className="kawaii-border bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-full px-4 py-2 mx-auto w-fit">
            <h2 className="text-base sm:text-lg font-serif text-purple-800 text-center flex items-center gap-2">
              ✨ Sohyun's Birthday Book ✨
            </h2>
          </div>
        </div>
      )}

      {/* Content Items */}
      <div className="relative z-10 space-y-6">
        {pageItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isContentReady ? 1 : 0, y: isContentReady ? 0 : 20 }}
            transition={{ delay: isContentReady ? index * 0.1 : 0, duration: 0.3 }}
            className="relative"
          >
            {item.type === 'text' ? (
              <div className="kawaii-entry p-5 relative group hover:scale-[1.02] transition-all">
                {showDeleteButtons && (
                  <button
                    onClick={() => handleDelete(item.entryId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl"
                    title="Delete entry"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="mb-3">
                  <div className="text-purple-800 font-serif leading-relaxed text-sm sm:text-base">
                    "{item.content.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < item.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}"
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-purple-600 bg-purple-50/50 rounded-lg sm:rounded-full px-3 sm:px-4 py-2">
                  <div className="flex items-center gap-2">
                    <User size={12} className="sm:w-3.5 sm:h-3.5 text-purple-400" />
                    <span className="font-medium">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-purple-400" />
                    <span>{item.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="kawaii-entry p-5 relative group hover:scale-[1.02] transition-all">
                {showDeleteButtons && (
                  <button
                    onClick={() => handleDelete(item.entryId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl z-10"
                    title="Delete entry"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="mb-3 relative">
                  <img
                    src={`/storage/images/${item.content}`}
                    alt="Guest entry"
                    className="max-w-full h-32 object-cover rounded-lg shadow-md border-2 border-purple-100 cursor-pointer hover:border-purple-300 hover:shadow-lg transition-all"
                    onClick={() => openLightbox(`/storage/images/${item.content}`, `Guest entry by ${item.author}`)}
                    title="Click to view larger"
                  />
                  <div className="absolute -top-1 -right-1 text-purple-300 text-xs">✨</div>
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 text-xs">
                    🔍
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-purple-600 bg-purple-50/50 rounded-lg sm:rounded-full px-3 sm:px-4 py-2">
                  <div className="flex items-center gap-2">
                    <User size={12} className="sm:w-3.5 sm:h-3.5 text-purple-400" />
                    <span className="font-medium">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-purple-400" />
                    <span>{item.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

      </div>

      {/* Page number at bottom */}
      <div className={`absolute bottom-4 ${
        side === 'left' ? 'left-6' : 
        side === 'right' ? 'right-6' : 
        'left-1/2 transform -translate-x-1/2' // center for single page
      }`}>
        <div className="kawaii-border bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 py-1">
          <span className="text-purple-600 font-serif text-xs sm:text-sm flex items-center gap-1">
            ⭐ {side === 'single' ? (pageNumber + 1) : 
                side === 'left' ? (pageNumber * 2 + 1) : (pageNumber * 2 + 2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookPage
