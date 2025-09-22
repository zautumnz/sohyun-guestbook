import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { useLightbox } from '@/contexts/LightboxContext'
import { Calendar, Trash2, Eye } from 'lucide-react'
import type { ContentItemWithMeta } from '@/contexts/GuestbookContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface BookPageProps {
  pageNumber: number;
  side: 'left' | 'right' | 'single';
}

const BookPage: React.FC<BookPageProps> = ({ pageNumber, side }) => {
  const { contentItems, deleteEntry } = useGuestbook()
  const { openLightbox, openTextLightbox } = useLightbox()
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

  // Get unique entry IDs from all content items for consistent color alternation across pages
  const getEntryColorIndex = (entryId: string) => {
    const uniqueEntryIds = [...new Set(contentItems.map(item => item.entryId))].sort()
    return uniqueEntryIds.indexOf(entryId) % 3 // Cycle through 3 color variants
  }

  // Get drawing image index for consistent avatar across entries
  const getDrawingIndex = (entryId: string) => {
    const uniqueEntryIds = [...new Set(contentItems.map(item => item.entryId))].sort()
    return (uniqueEntryIds.indexOf(entryId) % 8) + 1 // Cycle through 1-8
  }

  // Get content items for this side
  let pageItems: ContentItemWithMeta[]
  if (side === 'single') {
    // Mobile: 3 items per page
    const startIndex = pageNumber * 3
    pageItems = contentItems.slice(startIndex, startIndex + 3)
  } else {
    // Desktop: 3 items per side, 6 per spread
    const spreadStartIndex = pageNumber * 6
    const sideStartIndex = side === 'left' ? spreadStartIndex : spreadStartIndex + 3
    pageItems = contentItems.slice(sideStartIndex, sideStartIndex + 3)
  }

  // Helper function to check if items are part of the same entry group
  const getGroupInfo = (item: ContentItemWithMeta) => {
    const groupItems = contentItems.filter(ci => ci.entryId === item.entryId)
    const isGrouped = groupItems.length > 1
    const itemIndex = groupItems.findIndex(gi => gi.id === item.id)
    const isFirst = itemIndex === 0
    const isLast = itemIndex === groupItems.length - 1

    // Determine content mix for group icon
    const hasText = groupItems.some(gi => gi.type === 'text')
    const hasImage = groupItems.some(gi => gi.type === 'image')
    let groupIcon = '📝'
    if (hasText && hasImage) {
      groupIcon = '📷📝'
    } else if (hasImage) {
      groupIcon = '📷'
    }

    return { isGrouped, isFirst, isLast, totalItems: groupItems.length, itemIndex, groupIcon }
  }

  return (
    <div className={`w-full h-full p-6 book-page relative overflow-hidden ${
      side === 'left' ? 'pr-4' :
      side === 'right' ? 'pl-4' :
      'px-2' // single page mode
    }`}>

      {/* Content loading overlay */}
      {!isContentReady && (
        <div className="absolute inset-0 bg-background/50 dark:bg-background/70 flex items-center justify-center z-20">
          <div className="text-purple-400 dark:text-purple-300 text-2xl">✨</div>
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
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-purple-200/20"
            style={{ top: `${i * 4}%` }}
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
            <h2 className="text-base sm:text-lg font-serif text-purple-800 dark:text-purple-200 text-center flex items-center gap-2">
              ✨ Sohyun's Birthday Book ✨
            </h2>
          </div>
        </div>
      )}

      {/* Content Items */}
      <div className="relative z-10 space-y-4 lg:space-y-6 xl:space-y-8">
        {pageItems.map((item, index) => {
          const groupInfo = getGroupInfo(item)
          const colorIndex = getEntryColorIndex(item.entryId)

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isContentReady ? 1 : 0, y: isContentReady ? 0 : 20 }}
              transition={{ delay: isContentReady ? index * 0.1 : 0, duration: 0.3 }}
              className="relative flex items-start gap-3"
            >
              {/* Group indicator and connecting line */}
              {groupInfo.isGrouped && (
                <div className="flex flex-col items-center group-indicator pt-4 flex-shrink-0">
                  {/* Group badge */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`group-badge cursor-help group-badge-${colorIndex}`}>
                        <span className="text-xs">{groupInfo.groupIcon}</span>
                        <span>{groupInfo.itemIndex + 1}/{groupInfo.totalItems}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-48">
                      <p className="text-xs">
                        Part {groupInfo.itemIndex + 1} of {groupInfo.totalItems} of <span className="font-semibold">{item.author}</span>'s entry
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Connecting line to next item in group */}
                  {!groupInfo.isLast && (
                    <div className={`group-connecting-line group-connecting-line-${colorIndex}`} />
                  )}
                </div>
              )}

              {item.type === 'text' ? (
                <div className={`kawaii-entry kawaii-entry-${colorIndex} p-4 relative group transition-all flex-1 cursor-pointer ${
                  groupInfo.isGrouped ? 'grouped-item' : 'hover:scale-[1.02]'
                } hover:shadow-lg`}
                onClick={() => openTextLightbox(item.content, item.author, `${getDrawingIndex(item.entryId)}.png`)}>
                  {/* Group border highlight */}
                  {groupInfo.isGrouped && (
                    <div className={`group-border group-border-${colorIndex} ${
                      groupInfo.isFirst ? 'group-border-first' :
                      groupInfo.isLast ? 'group-border-last' :
                      'group-border-middle'
                    }`} />
                  )}
                  {showDeleteButtons && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.entryId)
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl z-10"
                      title="Delete entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  {/* Text length indicator */}
                  {item.content.length > 120 && (
                    <div className="absolute top-3 left-3 bg-purple-100/80 dark:bg-purple-700/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={12} className="text-purple-600 dark:text-purple-300" />
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="text-purple-800 dark:text-purple-200 font-serif leading-relaxed text-sm sm:text-base">
                      <div className="max-h-[60px] overflow-hidden relative">
                        "{item.content.substring(0, 120)}{item.content.length > 120 ? '...' : ''}"
                        {item.content.length > 120 && (
                          <div className="absolute bottom-0 right-0 bg-gradient-to-l from-purple-50 dark:from-slate-800 to-transparent px-2 text-purple-500 dark:text-purple-400 text-xs">
                            click to read more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-purple-600 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/40 rounded-lg sm:rounded-full px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={`/assets/drawings/${getDrawingIndex(item.entryId)}.png`}
                        alt="Author avatar"
                        className="w-8 h-8 rounded-full object-cover border border-purple-300/50"
                      />
                      <span className="font-medium truncate">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={10} className="text-purple-400" />
                      <span>{item.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`kawaii-entry kawaii-entry-${colorIndex} p-4 relative group transition-all flex-1 cursor-pointer ${
                  groupInfo.isGrouped ? 'grouped-item' : 'hover:scale-[1.02]'
                } hover:shadow-lg`}
                onClick={() => openLightbox(`/storage/images/${item.content}`, `Guest entry by ${item.author}`, item.author, `${getDrawingIndex(item.entryId)}.png`)}>
                  {/* Group border highlight */}
                  {groupInfo.isGrouped && (
                    <div className={`group-border group-border-${colorIndex} ${
                      groupInfo.isFirst ? 'group-border-first' :
                      groupInfo.isLast ? 'group-border-last' :
                      'group-border-middle'
                    }`} />
                  )}
                  {showDeleteButtons && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.entryId)
                      }}
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
                      className="max-w-full h-24 object-cover rounded-lg shadow-md border-2 border-purple-100 dark:border-purple-600 hover:border-purple-300 dark:hover:border-purple-400 hover:shadow-lg transition-all"
                      title="Click to view larger"
                    />
                    <div className="absolute -top-1 -right-1 text-purple-300 text-xs">✨</div>
                    <div className="absolute top-2 right-2 bg-white/80 dark:bg-background/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 dark:text-purple-300 text-xs">
                      🔍
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-purple-600 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/40 rounded-lg sm:rounded-full px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={`/assets/drawings/${getDrawingIndex(item.entryId)}.png`}
                        alt="Author avatar"
                        className="w-8 h-8 rounded-full object-cover border border-purple-300/50"
                      />
                      <span className="font-medium truncate">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={10} className="text-purple-400" />
                      <span>{item.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Page number at bottom */}
      <div className={`absolute bottom-4 ${
        side === 'left' ? 'left-6' :
        side === 'right' ? 'right-6' :
        'left-1/2 transform -translate-x-1/2' // center for single page
      }`}>
        <div className="kawaii-border bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 py-1">
          <span className="text-purple-600 dark:text-purple-300 font-serif text-xs sm:text-sm flex items-center gap-1">
            ⭐ {side === 'single' ? (pageNumber + 1) :
                side === 'left' ? (pageNumber * 2 + 1) : (pageNumber * 2 + 2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookPage
