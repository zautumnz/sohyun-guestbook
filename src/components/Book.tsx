import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import BookPage from './BookPage'
import AddEntryModal from './AddEntryModal'

const Book = () => {
  const { currentPage, totalPages, nextPage, prevPage } = useGuestbook()
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-8">
      <div className="relative">
        {/* Book Shadow */}
        <div className="absolute inset-0 bg-black/20 blur-xl transform translate-y-8 scale-95" />
        
        {/* Book Container */}
        <div className="relative bg-amber-900 p-6 rounded-lg shadow-2xl">
          <div className="bg-gradient-to-r from-amber-100 to-yellow-50 rounded border-4 border-amber-800 shadow-inner">
            
            {/* Book Pages */}
            <div className="relative w-[800px] h-[600px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ rotateY: currentPage > 0 ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: currentPage > 0 ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <BookPage pageNumber={currentPage} />
                </motion.div>
              </AnimatePresence>
              
              {/* Page binding effect */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-800/30 to-transparent pointer-events-none" />
              
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-700/30" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-700/30" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-700/30" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-700/30" />
            </div>
            
            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-4 px-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-800 transition-colors"
              >
                <ChevronLeft size={20} />
                Previous
              </motion.button>
              
              <div className="flex items-center gap-4">
                <span className="text-amber-800 font-medium">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Entry
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-800 transition-colors"
              >
                Next
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
    </div>
  )
}

export default Book