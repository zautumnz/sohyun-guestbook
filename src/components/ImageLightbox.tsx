import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt: string
  author: string
  avatarImage: string
  isOpen: boolean
  onClose: () => void
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, author, avatarImage, isOpen, onClose }) => {

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])



  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={onClose}
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-60">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
              title="Close (ESC)"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Image container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl w-full max-h-[95vh] kawaii-modal bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-purple-200 dark:border-purple-600">
              <div className="flex items-center gap-3">
                <div style={{ borderRadius: '9999px' }} className="rounded-full kawaii-border bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-700 dark:to-indigo-700 p-2">
                  <img
                    src={`/assets/drawings/${avatarImage}`}
                    alt="Author avatar"
                    className="w-12 h-12 rounded-full object-cover border border-purple-300/50"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                    {author}'s Image
                  </h3>
                </div>
              </div>
            </div>

            {/* Image content */}
            <div className="p-4 flex items-center justify-center bg-white dark:bg-slate-900">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Footer with decorative elements */}
            <div className="p-3 bg-purple-100/50 dark:bg-purple-800/50 border-t border-purple-200 dark:border-purple-600">
              <div className="flex justify-center gap-2 text-purple-400 dark:text-purple-300">
                <span>✨</span>
                <span>📷</span>
                <span>✨</span>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-white/70 text-sm backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2 hidden sm:block">
            Click outside or press ESC to close
          </div>

          {/* Mobile instructions */}
          <div className="absolute bottom-4 left-4 text-white/70 text-xs backdrop-blur-sm bg-black/20 rounded-lg px-3 py-2 sm:hidden">
            Tap outside to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ImageLightbox
