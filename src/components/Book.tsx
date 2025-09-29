import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, AlertCircle, RefreshCw, Printer, Hash, Moon, Sun, Shield, Clock, CheckCircle, Calendar } from 'lucide-react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { LightboxProvider, useLightbox } from '@/contexts/LightboxContext'
import { useTheme } from '@/contexts/ThemeContext'
import BookPage from './BookPage'
import AddEntryModal from './AddEntryModal'
import ImageLightbox from './ImageLightbox'
import TextLightbox from './TextLightbox'

const BookContent = () => {
  const { currentPage, totalPages, nextPage, prevPage, loading, error, refreshEntries, goToPage, contentItems, isAdmin, pendingEntries, entries } = useGuestbook()
  const { isOpen, imageSrc, imageAlt, imageAuthor, imageAvatarImage, textContent, textAuthor, textAvatarImage, contentType, openLightbox, openTextLightbox, closeLightbox } = useLightbox()
  const { isDark, toggleTheme } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showJumpModal, setShowJumpModal] = useState(false)
  const [jumpPageInput, setJumpPageInput] = useState('')
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Check for first visit and show welcome modal
  // Uses 'guestbook-welcome-shown' localStorage key to track if user has seen the welcome message
  useEffect(() => {
    const hasVisited = localStorage.getItem('guestbook-welcome-shown')
    if (!hasVisited) {
      setShowWelcomeModal(true)
      localStorage.setItem('guestbook-welcome-shown', 'true')
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleChibiClick = () => {
    setShowWelcomeModal(true)
  }

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false)
  }

  const handleJumpToPage = () => {
    const inputPageNum = parseInt(jumpPageInput)
    let targetSpread: number

    // Check if we're on desktop (window width >= 640px) for two-page spread
    const isDesktop = window.innerWidth >= 640

    if (isDesktop) {
      // Desktop: Convert individual page number to spread number
      // Page 1-2 -> spread 0, Page 3-4 -> spread 1, etc.
      targetSpread = Math.floor((inputPageNum - 1) / 2)
    } else {
      // Mobile: Direct page number to spread mapping (page 1 -> spread 0, page 2 -> spread 1)
      targetSpread = inputPageNum - 1
    }

    // Calculate mobile-specific total pages (each spread shows as one page)
    const mobileTotalPages = Math.max(1, Math.ceil(contentItems.length / 3))
    const maxPages = isDesktop ? totalPages : mobileTotalPages

    if (targetSpread >= 0 && targetSpread < maxPages) {
      // Check if we're already on the target spread - if so, just close the modal
      if (targetSpread === currentPage) {
        setShowJumpModal(false)
        setJumpPageInput('')
        return
      }

      setIsPageTransitioning(true)
      goToPage(targetSpread)
      setShowJumpModal(false)
      setJumpPageInput('')
    }
  }

  const handleJumpModalClose = () => {
    setShowJumpModal(false)
    setJumpPageInput('')
  }

  if (loading && totalPages === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-4 xl:px-6 2xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-10 relative">
        <div className="kawaii-star absolute top-20 left-20">✨</div>
        <div className="kawaii-star absolute top-32 right-32">⭐</div>
        <div className="kawaii-star absolute bottom-40 left-40">💫</div>
        <div className="text-center kawaii-modal rounded-xl p-8 shadow-2xl">
          <RefreshCw className="animate-spin h-12 w-12 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-700 dark:text-purple-300 font-medium text-sm sm:text-base">Loading guestbook entries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-4 xl:px-6 2xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-10 relative">
        <div className="kawaii-star absolute top-20 left-20">✨</div>
        <div className="kawaii-star absolute top-32 right-32">⭐</div>
        <div className="kawaii-star absolute bottom-40 left-40">💫</div>
        <div className="text-center max-w-md kawaii-modal rounded-xl p-8 shadow-2xl">
          <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">Failed to load guestbook</h2>
          <p className="text-purple-600 dark:text-purple-300 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={refreshEntries}
            className="kawaii-button px-4 py-2 sm:px-6 sm:py-3 text-white font-medium text-sm sm:text-base rounded-full hover:scale-105 transition-all"
          >
            ✨ Try Again ✨
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-4 xl:px-6 2xl:px-8 py-2 sm:py-3 lg:py-4 xl:py-5 relative overflow-hidden no-print">
      {/* Beta Warning Banner */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-amber-100 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-700 py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="text-sm font-medium">Beta - All entries will be deleted before going live</span>
        </div>
      </div>

      {/* Floating stars */}
      <div className="kawaii-star absolute top-10 left-10 text-2xl">✨</div>
      <div className="kawaii-star absolute top-20 right-20 text-xl">⭐</div>
      <div className="kawaii-star absolute top-40 left-1/4 text-lg">💫</div>
      <div className="kawaii-star absolute bottom-20 right-10 text-2xl">🌟</div>
      <div className="kawaii-star absolute bottom-40 left-20 text-lg">✨</div>

      {/* Chibi image in upper right */}
      <div className="absolute top-8 right-4 z-10 hidden sm:flex flex-col items-center gap-3">
        <img
          style={{ width: '100%' }}
          src="/assets/chibi.jpg"
          alt="Chibi Sohyun"
          className="w-24 h-24 rounded-full shadow-lg border-4 border-white/80 hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleChibiClick}
          title="Click to view welcome message"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="kawaii-button flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-400 to-blue-400 text-white text-sm font-medium rounded-full transition-all"
          title="Print all entries to PDF"
        >
          <Printer size={12} />
          PDF
        </motion.button>
      </div>

      {/* Theme toggle in upper right - always visible */}
      <div className="absolute top-8 right-4 z-10 flex sm:hidden flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="kawaii-button flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-sm font-medium rounded-full transition-all shadow-lg"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={12} /> : <Moon size={12} />}
          <span className="hidden sm:inline">{isDark ? '#lightmode' : '#darkmode'}</span>
        </motion.button>
      </div>

      {/* Theme toggle for desktop - positioned under PDF */}
      <div className="absolute top-44 right-4 z-10 hidden sm:flex flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="kawaii-button flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-sm font-medium rounded-full transition-all shadow-lg"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden sm:inline">{isDark ? '#lightmode' : '#darkmode'}</span>
        </motion.button>

        {/* Admin status indicator */}
        {isAdmin && (
          <div className="kawaii-button flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-sm font-medium rounded-full shadow-lg">
            <Shield size={14} />
            <span className="text-xs">Admin</span>
          </div>
        )}

        {/* Entry status for admin */}
        {isAdmin && (
          <div className="flex flex-col gap-1">
            <div className="kawaii-button flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white text-xs font-medium rounded-full shadow-sm">
              <CheckCircle size={10} />
              <span>{entries.filter(e => e.approved).length} approved</span>
            </div>
            {pendingEntries.length > 0 && (
              <div className="kawaii-button flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-medium rounded-full shadow-sm">
                <Clock size={10} />
                <span>{pendingEntries.length} pending</span>
              </div>
            )}
            {entries.filter(e => !e.approved).length > 0 && (
              <div className="kawaii-button flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs font-medium rounded-full shadow-sm">
                <AlertCircle size={10} />
                <span>{entries.filter(e => !e.approved).length} unapproved</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center w-full">
        {/* Book Shadow */}
        <div className="absolute inset-0 bg-purple-300/30 dark:bg-purple-600/40 blur-2xl transform translate-y-8 scale-95 rounded-3xl" />

        {/* Book Container */}
        <div className="relative kawaii-border bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-indigo-800 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 rounded-2xl shadow-2xl w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl min-w-0">
          <div className="kawaii-border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900 rounded-xl shadow-inner lace-border">

            {/* Book Pages - Responsive Layout */}
            <div className="relative w-full h-[60vh] min-h-[500px] sm:h-[65vh] lg:h-[70vh] xl:h-[72vh] 2xl:h-[75vh] max-h-[800px] overflow-hidden rounded-xl flex">
              <AnimatePresence mode="wait" onExitComplete={() => setIsPageTransitioning(false)}>
                <motion.div
                  key={currentPage}
                  initial={{ rotateY: currentPage > 0 ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: currentPage > 0 ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-xl flex"
                  style={{ transformStyle: 'preserve-3d' }}
                  onAnimationStart={() => setIsPageTransitioning(true)}
                  onAnimationComplete={() => setIsPageTransitioning(false)}
                >
                  {/* Mobile: Scrollable All Entries View */}
                  <div className="w-full h-full relative sm:hidden overflow-y-auto custom-scrollbar">
                    <div className="space-y-4 p-4">
                      {contentItems.map((item, index) => {
                        const uniqueEntryIds = [...new Set(contentItems.map(item => item.entryId))].sort()
                        const colorIndex = uniqueEntryIds.indexOf(item.entryId) % 3
                        const drawingIndex = (uniqueEntryIds.indexOf(item.entryId) % 9) + 1
                        
                        // Helper function to check if items are part of the same entry group
                        const getGroupInfo = (item: typeof contentItems[0]) => {
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
                        
                        const groupInfo = getGroupInfo(item)
                        
                        return (
                          <div key={`${item.entryId}_${index}`} className="relative flex items-start gap-3">
                            {/* Group indicator and connecting line */}
                            {groupInfo.isGrouped && (
                              <div className="flex flex-col items-center group-indicator pt-4 flex-shrink-0">
                                {/* Group badge */}
                                <div className={`group-badge group-badge-${colorIndex}`}>
                                  <span className="text-xs">{groupInfo.groupIcon}</span>
                                  <span>{groupInfo.itemIndex + 1}/{groupInfo.totalItems}</span>
                                </div>

                                {/* Connecting line to next item in group */}
                                {!groupInfo.isLast && (
                                  <div className={`group-connecting-line group-connecting-line-${colorIndex}`} />
                                )}
                              </div>
                            )}
                            
                            <div className={`kawaii-entry kawaii-entry-${colorIndex} p-4 rounded-lg shadow-lg transition-all duration-200 cursor-pointer flex-1 relative ${
                              groupInfo.isGrouped ? 'grouped-item' : 'hover:scale-[1.02]'
                            }`}>
                              {/* Group border highlight */}
                              {groupInfo.isGrouped && (
                                <div className={`group-border group-border-${colorIndex} ${
                                  groupInfo.isFirst ? 'group-border-first' :
                                  groupInfo.isLast ? 'group-border-last' :
                                  'group-border-middle'
                                }`} />
                              )}
                              
                              {item.type === 'text' ? (
                                <div 
                                  className="space-y-3"
                                  onClick={() => openTextLightbox(item.content, item.author, `${drawingIndex}.png`)}
                                >
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                                    {item.content}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/40 rounded-full px-3 py-2">
                                    <img
                                      src={`/assets/drawings/${drawingIndex}.png`}
                                      alt="Author avatar"
                                      className="w-6 h-6 rounded-full object-cover border border-purple-300/50"
                                    />
                                    <span className="font-medium truncate">{item.author}</span>
                                    <div className="flex items-center gap-1 ml-auto">
                                      <Calendar size={10} className="text-purple-400" />
                                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="space-y-3"
                                  onClick={() => openLightbox(`/storage/images/${item.content}`, `Entry by ${item.author}`, item.author, `${drawingIndex}.png`)}
                                >
                                  <img
                                    src={`/storage/images/${item.content}`}
                                    alt={`Entry by ${item.author}`}
                                    className="w-full rounded-lg hover:opacity-90 transition-opacity"
                                  />
                                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/40 rounded-full px-3 py-2">
                                    <img
                                      src={`/assets/drawings/${drawingIndex}.png`}
                                      alt="Author avatar"
                                      className="w-6 h-6 rounded-full object-cover border border-purple-300/50"
                                    />
                                    <span className="font-medium truncate">{item.author}</span>
                                    <div className="flex items-center gap-1 ml-auto">
                                      <Calendar size={10} className="text-purple-400" />
                                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {contentItems.length === 0 && (
                        <div className="text-center text-purple-600 dark:text-purple-400 py-12">
                          <div className="kawaii-entry p-6 rounded-lg">
                            <p className="text-lg mb-2">✨ No entries yet! ✨</p>
                            <p className="text-sm opacity-80">Be the first to leave a message for Sohyun!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Two Page Spread */}
                  <div className="hidden sm:contents">
                    {/* Left Page */}
                    <div className="w-1/2 h-full relative">
                      <BookPage pageNumber={currentPage} side="left" />
                    </div>

                    {/* Book Binding/Crease */}
                    <div className="w-6 h-full relative bg-gradient-to-r from-purple-300/30 via-purple-400/50 to-purple-300/30 dark:from-purple-600/50 dark:via-purple-500/70 dark:to-purple-600/50 shadow-inner">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-purple-500/30 dark:bg-purple-400/50 transform -translate-x-1/2" />
                      <div className="absolute inset-y-0 left-1 w-px bg-purple-200/40 dark:bg-purple-300/50" />
                      <div className="absolute inset-y-0 right-1 w-px bg-purple-200/40 dark:bg-purple-300/50" />
                      {/* Binding holes/stitching */}
                      <div className="absolute top-12 left-1/2 w-1 h-1 bg-purple-400/40 dark:bg-purple-300/60 rounded-full transform -translate-x-1/2" />
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400/40 dark:bg-purple-300/60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-12 left-1/2 w-1 h-1 bg-purple-400/40 dark:bg-purple-300/60 rounded-full transform -translate-x-1/2" />
                    </div>

                    {/* Right Page */}
                    <div className="w-1/2 h-full relative">
                      <BookPage pageNumber={currentPage} side="right" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Page transition loading overlay */}
              {isPageTransitioning && (
                <div className="absolute inset-0 bg-background/80 dark:bg-background/90 flex items-center justify-center rounded-xl z-10">
                  <div className="text-center">
                    <RefreshCw className="animate-spin h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-600 dark:text-purple-300 text-sm">Turning page...</p>
                  </div>
                </div>
              )}

              {/* Decorative corners with stars */}
              <div className="absolute top-4 left-4 text-purple-400/50 dark:text-purple-300/70 text-lg">✨</div>
              <div className="absolute top-4 right-4 text-purple-400/50 dark:text-purple-300/70 text-lg">⭐</div>
              <div className="absolute bottom-4 left-4 text-purple-400/50 dark:text-purple-300/70 text-lg">💫</div>
              <div className="absolute bottom-4 right-4 text-purple-400/50 dark:text-purple-300/70 text-lg">🌟</div>
            </div>

            {/* Navigation Controls - Hidden on Mobile */}
            <div className="hidden sm:flex justify-between items-center mt-6 px-6 pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsPageTransitioning(true)
                  prevPage()
                }}
                disabled={currentPage === 0 || isPageTransitioning}
                className="kawaii-button flex items-center gap-2 px-6 py-3 text-white font-medium text-base rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
                Previous
              </motion.button>

              <div className="flex items-center gap-6">
                {(loading || isPageTransitioning) && (
                  <RefreshCw className="animate-spin h-5 w-5 text-purple-400" />
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJumpModal(true)}
                  className="kawaii-button flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-400 to-blue-400 text-white font-medium text-sm rounded-full transition-all"
                >
                  <Hash size={14} />
                  Jump
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="kawaii-button flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-base rounded-full transition-all"
                >
                  <Plus size={16} />
                  💝 Add Entry
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsPageTransitioning(true)
                  nextPage()
                }}
                disabled={currentPage >= totalPages - 1 || isPageTransitioning}
                className="kawaii-button flex items-center gap-2 px-6 py-3 text-white font-medium text-base rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* Mobile Add Button - Centered */}
            <div className="sm:hidden flex justify-center mt-6 px-6 pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="kawaii-button flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-base rounded-full transition-all"
              >
                <Plus size={16} />
                💝 Add Entry
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AddEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Jump to Page Modal */}
      <AnimatePresence>
        {showJumpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={handleJumpModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="kawaii-modal bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-purple-800 -m-6 mb-4 p-6 rounded-t-xl">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 text-center">
                  🔍 Jump to Page
                </h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Page Number (1-{window.innerWidth >= 640 ? totalPages * 2 : Math.max(1, Math.ceil(contentItems.length / 3))})
                </label>
                <input
                  type="number"
                  min="1"
                  max={window.innerWidth >= 640 ? totalPages * 2 : Math.max(1, Math.ceil(contentItems.length / 3))}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                  className="w-full px-3 py-2 border border-purple-200 dark:border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-background text-foreground transition-colors"
                  placeholder="Enter page number"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleJumpModalClose}
                  className="px-4 py-2 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 font-medium text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJumpToPage}
                  disabled={!jumpPageInput || parseInt(jumpPageInput) < 1 || parseInt(jumpPageInput) > (window.innerWidth >= 640 ? totalPages * 2 : Math.max(1, Math.ceil(contentItems.length / 3)))}
                  className="kawaii-button px-4 py-2 text-white font-medium text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ✨ Jump ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {contentType === 'image' ? (
        <ImageLightbox
          src={imageSrc}
          alt={imageAlt}
          author={imageAuthor}
          avatarImage={imageAvatarImage}
          isOpen={isOpen}
          onClose={closeLightbox}
        />
      ) : (
        <TextLightbox
          content={textContent}
          author={textAuthor}
          avatarImage={textAvatarImage}
          isOpen={isOpen}
          onClose={closeLightbox}
        />
      )}

      {/* Welcome Modal */}
      <TextLightbox
        content="Welcome to Sohyun's Birthday Guestbook! 💙

For Sohyun's birthday, we invite you to share your thoughts and memories with her.

You can leave a message or image (or both!) for Sohyun here. Click the 'Add Entry' button to get started."
        author="Creator"
        avatarImage="1.png"
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />

      <footer className="text-center text-purple-600 dark:text-purple-300 text-xs sm:text-sm font-medium py-2 mt-auto">
        Made with 💙 by <a target="_blank" href="http://sohyunsbiggestfan.com" className="underline hover:text-purple-800 dark:hover:text-purple-200 transition-colors">zautumn</a>{' '}
        and <a target="_blank" href="https://apollo.cafe/@joeywerepyre" className="underline hover:text-purple-800 dark:hover:text-purple-200 transition-colors">joeywerepyre</a>
      </footer>
    </div>
  )
}

const Book = () => {
  return (
    <LightboxProvider>
      <BookContent />
    </LightboxProvider>
  )
}

export default Book
