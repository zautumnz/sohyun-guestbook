import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, AlertCircle, RefreshCw, Printer } from 'lucide-react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import BookPage from './BookPage'
import AddEntryModal from './AddEntryModal'

const Book = () => {
  const { currentPage, totalPages, nextPage, prevPage, loading, error, refreshEntries } = useGuestbook()
  const [showAddModal, setShowAddModal] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  if (loading && totalPages === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center p-8 relative">
        <div className="kawaii-star absolute top-20 left-20">✨</div>
        <div className="kawaii-star absolute top-32 right-32">⭐</div>
        <div className="kawaii-star absolute bottom-40 left-40">💫</div>
        <div className="text-center kawaii-modal rounded-xl p-8 shadow-2xl">
          <RefreshCw className="animate-spin h-12 w-12 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-700 font-medium">Loading guestbook entries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center p-8 relative">
        <div className="kawaii-star absolute top-20 left-20">✨</div>
        <div className="kawaii-star absolute top-32 right-32">⭐</div>
        <div className="kawaii-star absolute bottom-40 left-40">💫</div>
        <div className="text-center max-w-md kawaii-modal rounded-xl p-8 shadow-2xl">
          <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-purple-800 mb-2">Failed to load guestbook</h2>
          <p className="text-purple-600 mb-4">{error}</p>
          <button
            onClick={refreshEntries}
            className="kawaii-button px-6 py-3 text-white font-medium rounded-full hover:scale-105 transition-all"
          >
            ✨ Try Again ✨
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex flex-col items-center justify-center p-8 relative overflow-hidden no-print">
      {/* Floating stars */}
      <div className="kawaii-star absolute top-10 left-10 text-2xl">✨</div>
      <div className="kawaii-star absolute top-20 right-20 text-xl">⭐</div>
      <div className="kawaii-star absolute top-40 left-1/4 text-lg">💫</div>
      <div className="kawaii-star absolute bottom-20 right-10 text-2xl">🌟</div>
      <div className="kawaii-star absolute bottom-40 left-20 text-lg">✨</div>

      {/* Chibi image in upper right */}
      <div className="absolute top-8 right-8 z-10 flex flex-col items-center gap-3">
        <img
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
          🖨️ PDF
        </motion.button>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        {/* Book Shadow */}
        <div className="absolute inset-0 bg-purple-300/30 blur-2xl transform translate-y-8 scale-95 rounded-3xl" />

        {/* Book Container */}
        <div className="relative kawaii-border bg-gradient-to-br from-purple-200 to-pink-200 p-8 rounded-2xl shadow-2xl">
          <div className="kawaii-border bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-inner lace-border">

            {/* Book Pages */}
            <div className="relative w-[800px] h-[600px] overflow-hidden rounded-xl">
              <AnimatePresence mode="wait" onExitComplete={() => setIsPageTransitioning(false)}>
                <motion.div
                  key={currentPage}
                  initial={{ rotateY: currentPage > 0 ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: currentPage > 0 ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-xl"
                  style={{ transformStyle: 'preserve-3d' }}
                  onAnimationStart={() => setIsPageTransitioning(true)}
                  onAnimationComplete={() => setIsPageTransitioning(false)}
                >
                  <BookPage pageNumber={currentPage} />
                </motion.div>
              </AnimatePresence>
              
              {/* Page transition loading overlay */}
              {isPageTransitioning && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                  <div className="text-center">
                    <RefreshCw className="animate-spin h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-600 text-sm">Turning page...</p>
                  </div>
                </div>
              )}

              {/* Page binding effect */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-purple-400/20 to-transparent pointer-events-none rounded-l-xl" />

              {/* Decorative corners with stars */}
              <div className="absolute top-4 left-4 text-purple-400/50 text-lg">✨</div>
              <div className="absolute top-4 right-4 text-purple-400/50 text-lg">⭐</div>
              <div className="absolute bottom-4 left-4 text-purple-400/50 text-lg">💫</div>
              <div className="absolute bottom-4 right-4 text-purple-400/50 text-lg">🌟</div>
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
                className="kawaii-button flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
                ← Previous
              </motion.button>

              <div className="flex items-center gap-6">
                <div className="kawaii-border bg-white/80 px-4 py-2 rounded-full">
                  <span className="text-purple-800 font-medium">
                    ✨ Page {currentPage + 1} of {totalPages} ✨
                  </span>
                </div>

                {(loading || isPageTransitioning) && (
                  <RefreshCw className="animate-spin h-5 w-5 text-purple-400" />
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="kawaii-button flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium rounded-full transition-all"
                >
                  <Plus size={20} />
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
                className="kawaii-button flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AddEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <footer className="text-center text-purple-600 text-sm font-medium py-4 mt-auto">
        Made with 💜 by <a target="_blank" href="http://sohyunsbiggestfan.com" className="underline hover:text-purple-800 transition-colors">zautumn</a>
      </footer>
    </div>
  )
}

export default Book
