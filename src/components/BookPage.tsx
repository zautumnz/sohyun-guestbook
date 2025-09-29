import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { useLightbox } from '@/contexts/LightboxContext'
import { Calendar, Trash2, Eye, Check, Clock } from 'lucide-react'
import type { ContentItemWithMeta } from '@/contexts/GuestbookContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface BookPageProps {
  pageNumber: number;
  side: 'left' | 'right' | 'single';
}

const BookPage: React.FC<BookPageProps> = ({ pageNumber, side }) => {
  const { contentItems, entries, pendingEntries, deleteEntry, approveEntry, isAdmin } = useGuestbook()
  const { openLightbox, openTextLightbox } = useLightbox()
  const [showDeleteButtons, setShowDeleteButtons] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)

  // Check for password query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const password = urlParams.get('pw')
    setShowDeleteButtons(password === '20250514')
  }, [])

  // Helper function to get entry approval status
  const getEntryApprovalStatus = (entryId: string) => {
    const pendingEntry = pendingEntries.find(entry => entry.id === entryId)
    const approvedEntry = entries.find(entry => entry.id === entryId)

    if (pendingEntry) {
      return { isPending: true, isApproved: false }
    }
    if (approvedEntry) {
      return { isPending: false, isApproved: approvedEntry.approved || false }
    }
    return { isPending: false, isApproved: false }
  }

  const handleApprove = async (entryId: string) => {
    try {
      await approveEntry(entryId)
    } catch (error) {
      alert('Failed to approve entry. Please try again.')
    }
  }

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
    return (uniqueEntryIds.indexOf(entryId) % 9) + 1 // Cycle through 1-9
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
    <div className={`w-full h-full book-page relative ${
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
      <div className="absolute top-4 left-8 text-purple-300/40 text-sm kawaii-star pointer-events-none">✨</div>
      <div className="absolute top-12 right-12 text-pink-300/40 text-xs kawaii-star pointer-events-none">⭐</div>
      <div className="absolute bottom-8 left-16 text-purple-300/40 text-xs kawaii-star pointer-events-none">💫</div>
      <div className="absolute bottom-16 right-8 text-pink-300/40 text-sm kawaii-star pointer-events-none">🌟</div>

      {/* Paper texture overlay with kawaii pattern */}
      <div className="absolute inset-0 opacity-15 paper-texture pointer-events-none" />

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
      <div className="absolute top-0 left-0 right-0 h-4 lace-border opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-4 lace-border opacity-30 pointer-events-none" />

      {/* Scrollable content container */}
      <div className="relative z-10 h-full overflow-y-auto sm:overflow-hidden custom-scrollbar p-6">
        {/* Page Header - show on left side or single page mode */}
        {(side === 'left' || side === 'single') && (
          <div className="mb-3">
            <div className="kawaii-border bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-full px-3 py-1 mx-auto w-fit">
              <h2 className="text-sm sm:text-base font-serif text-purple-800 dark:text-purple-200 text-center flex items-center gap-2">
                ✨ Sohyun's Birthday Book ✨
              </h2>
            </div>
          </div>
        )}

        {/* Content Items */}
        <div className="space-y-1 lg:space-y-2 xl:space-y-3 2xl:space-y-6 pb-6">
        {pageItems.map((item, index) => {
          const groupInfo = getGroupInfo(item)
          const colorIndex = getEntryColorIndex(item.entryId)
          const approvalStatus = getEntryApprovalStatus(item.entryId)

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
                <div className={`kawaii-entry kawaii-entry-${colorIndex} p-3 xl:p-3 2xl:p-4 relative group transition-all flex-1 cursor-pointer ${
                  groupInfo.isGrouped ? 'grouped-item' : 'hover:scale-[1.02]'
                } hover:shadow-lg ${
                  approvalStatus.isPending ? 'ring-2 ring-yellow-300/50 bg-yellow-50/30 dark:bg-yellow-900/20' :
                  (!approvalStatus.isApproved && isAdmin) ? 'ring-2 ring-red-300/50 bg-red-50/30 dark:bg-red-900/20' : ''
                }`}
                onClick={() => openTextLightbox(item.content, item.author, `${getDrawingIndex(item.entryId)}.png`)}>
                  {/* Group border highlight */}
                  {groupInfo.isGrouped && (
                    <div className={`group-border group-border-${colorIndex} ${
                      groupInfo.isFirst ? 'group-border-first' :
                      groupInfo.isLast ? 'group-border-last' :
                      'group-border-middle'
                    }`} />
                  )}
                  {/* Admin controls */}
                  {showDeleteButtons && (
                    <div className="absolute top-3 right-3 flex gap-1 z-10">
                      {!approvalStatus.isApproved && !approvalStatus.isPending && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApprove(item.entryId)
                          }}
                          className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white transition-all shadow-lg hover:shadow-xl"
                          title="Approve entry"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.entryId)
                        }}
                        className="p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl"
                        title="Delete entry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Approval status indicator */}
                  {(approvalStatus.isPending || (!approvalStatus.isApproved && isAdmin)) && (
                    <div className={`absolute top-3 left-3 p-1 rounded-full ${
                      approvalStatus.isPending ? 'bg-yellow-100/80 dark:bg-yellow-900/80' : 'bg-red-100/80 dark:bg-red-900/80'
                    } backdrop-blur-sm`} title={approvalStatus.isPending ? "Pending approval" : "Needs approval"}>
                      {approvalStatus.isPending ? (
                        <Clock size={12} className="text-yellow-600 dark:text-yellow-300" />
                      ) : (
                        <Clock size={12} className="text-red-600 dark:text-red-300" />
                      )}
                    </div>
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
                <div className={`kawaii-entry kawaii-entry-${colorIndex} p-3 xl:p-3 2xl:p-4 relative group transition-all flex-1 cursor-pointer ${
                  groupInfo.isGrouped ? 'grouped-item' : 'hover:scale-[1.02]'
                } hover:shadow-lg ${
                  approvalStatus.isPending ? 'ring-2 ring-yellow-300/50 bg-yellow-50/30 dark:bg-yellow-900/20' :
                  (!approvalStatus.isApproved && isAdmin) ? 'ring-2 ring-red-300/50 bg-red-50/30 dark:bg-red-900/20' : ''
                }`}
                onClick={() => openLightbox(`/storage/images/${item.content}`, `Guest entry by ${item.author}`, item.author, `${getDrawingIndex(item.entryId)}.png`)}>
                  {/* Group border highlight */}
                  {groupInfo.isGrouped && (
                    <div className={`group-border group-border-${colorIndex} ${
                      groupInfo.isFirst ? 'group-border-first' :
                      groupInfo.isLast ? 'group-border-last' :
                      'group-border-middle'
                    }`} />
                  )}
                  {/* Admin controls */}
                  {showDeleteButtons && (
                    <div className="absolute top-3 right-3 flex gap-1 z-10">
                      {!approvalStatus.isApproved && !approvalStatus.isPending && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApprove(item.entryId)
                          }}
                          className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white transition-all shadow-lg hover:shadow-xl"
                          title="Approve entry"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.entryId)
                        }}
                        className="p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl"
                        title="Delete entry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Approval status indicator */}
                  {(approvalStatus.isPending || (!approvalStatus.isApproved && isAdmin)) && (
                    <div className={`absolute top-3 left-3 p-1 rounded-full ${
                      approvalStatus.isPending ? 'bg-yellow-100/80 dark:bg-yellow-900/80' : 'bg-red-100/80 dark:bg-red-900/80'
                    } backdrop-blur-sm`} title={approvalStatus.isPending ? "Pending approval" : "Needs approval"}>
                      {approvalStatus.isPending ? (
                        <Clock size={12} className="text-yellow-600 dark:text-yellow-300" />
                      ) : (
                        <Clock size={12} className="text-red-600 dark:text-red-300" />
                      )}
                    </div>
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

      </div>

      {/* Page number at bottom - outside scrollable content */}
      <div className={`absolute bottom-4 ${
        side === 'left' ? 'left-6' :
        side === 'right' ? 'right-6' :
        'right-6' // bottom right for single page (mobile)
      } z-20`}>
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
