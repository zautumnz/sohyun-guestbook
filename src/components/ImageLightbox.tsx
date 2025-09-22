import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, isOpen, onClose }) => {

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
            className="relative flex items-center justify-center max-w-[95vw] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
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
