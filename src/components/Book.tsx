import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, AlertCircle, RefreshCw, Printer, Hash, Moon, Sun, Shield, Clock, CheckCircle } from 'lucide-react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { LightboxProvider, useLightbox } from '@/contexts/LightboxContext'
import { useTheme } from '@/contexts/ThemeContext'
import BookPage from './BookPage'
import AddEntryModal from './AddEntryModal'
import ImageLightbox from './ImageLightbox'
import TextLightbox from './TextLightbox'

const BookContent = () => {
  const { currentPage, totalPages, nextPage, prevPage, loading, error, refreshEntries, goToPage, contentItems, isAdmin, pendingEntries, entries } = useGuestbook()
  const { isOpen, imageSrc, imageAlt, imageAuthor, imageAvatarImage, textContent, textAuthor, textAvatarImage, contentType, openLightbox, closeLightbox } = useLightbox()
  const { isDark, toggleTheme } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showJumpModal, setShowJumpModal] = useState(false)
  const [jumpPageInput, setJumpPageInput] = useState('')
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)

  const handlePrint = () => {
    window.print()
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
      // Mobile: Direct page to spread mapping
      targetSpread = inputPageNum - 1
    }

    if (targetSpread >= 0 && targetSpread < totalPages) {
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
          className="w-24 h-24 rounded-full shadow-lg border-4 border-white/80 hover:scale-105 transition-transform duration-300"
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
                  {/* Mobile: Single Page View */}
                  <div className="w-full h-full relative sm:hidden">
                    <BookPage pageNumber={currentPage} side="single" />
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

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6 px-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsPageTransitioning(true)
                  prevPage()
                }}
                disabled={currentPage === 0 || isPageTransitioning}
                className="kawaii-button flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 text-white font-medium text-sm sm:text-base rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">←</span> <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
              </motion.button>

              <div className="flex items-center gap-2 sm:gap-6">
                {(loading || isPageTransitioning) && (
                  <RefreshCw className="animate-spin h-5 w-5 text-purple-400" />
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJumpModal(true)}
                  className="kawaii-button hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-400 to-blue-400 text-white font-medium text-sm rounded-full transition-all"
                >
                  <Hash size={14} />
                  Jump
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="kawaii-button flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-sm sm:text-base rounded-full transition-all"
                >
                  <Plus size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">💝</span> <span className="hidden sm:inline">Add Entry</span><span className="sm:hidden">Add</span>
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
                className="kawaii-button flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 text-white font-medium text-sm sm:text-base rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">Next</span><span className="sm:hidden">Next</span> <span className="hidden xs:inline">→</span>
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
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
              className="kawaii-modal bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900 rounded-xl p-6 shadow-2xl max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 text-center">
                🔍 Jump to Page
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Page Number (1-{window.innerWidth >= 640 ? totalPages * 2 : totalPages})
                </label>
                <input
                  type="number"
                  min="1"
                  max={window.innerWidth >= 640 ? totalPages * 2 : totalPages}
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
                  disabled={!jumpPageInput || parseInt(jumpPageInput) < 1 || parseInt(jumpPageInput) > (window.innerWidth >= 640 ? totalPages * 2 : totalPages)}
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
