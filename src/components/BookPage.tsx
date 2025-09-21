import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { Calendar, User, Trash2 } from 'lucide-react'

interface BookPageProps {
  pageNumber: number;
}

const BookPage: React.FC<BookPageProps> = ({ pageNumber }) => {
  const { entries, deleteEntry } = useGuestbook()
  const [showDeleteButtons, setShowDeleteButtons] = useState(false)

  // Check for password query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const password = urlParams.get('pw')
    setShowDeleteButtons(password === '20250514')
  }, [])

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId)
      } catch (error) {
        alert('Failed to delete entry. Please try again.')
      }
    }
  }

  // Get entries for this page (3 entries per page)
  const pageEntries = entries.slice(pageNumber * 3, (pageNumber + 1) * 3)

  return (
    <div className="w-full h-full p-8 book-page relative overflow-hidden">
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

      {/* Page Header */}
      <div className="relative z-10 mb-6">
        <div className="kawaii-border bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-full px-6 py-3 mx-auto w-fit">
          <h2 className="text-2xl font-serif text-purple-800 text-center flex items-center gap-2">
            ✨ Sohyun's Birthday Book - Page {pageNumber + 1} ✨
          </h2>
        </div>
      </div>

      {/* Entries */}
      <div className="relative z-10 space-y-6">
        {pageEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {entry.type === 'text' ? (
              <div className="kawaii-entry p-5 relative group hover:scale-[1.02] transition-all">
                {showDeleteButtons && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl"
                    title="Delete entry"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="mb-3">
                  <p className="text-purple-800 font-serif leading-relaxed text-base">
                    "{entry.content}"
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-purple-600 bg-purple-50/50 rounded-full px-4 py-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-400" />
                    <span className="font-medium">{entry.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-purple-400" />
                    <span>{entry.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="kawaii-entry p-5 relative group hover:scale-[1.02] transition-all">
                {showDeleteButtons && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl z-10"
                    title="Delete entry"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="mb-3 relative">
                  <img
                      src={entry.type === 'image' ? `/storage/images/${entry.content}` : entry.content}
                    alt="Guest entry"
                    className="max-w-full h-32 object-cover rounded-lg shadow-md border-2 border-purple-100"
                  />
                  <div className="absolute -top-1 -right-1 text-purple-300 text-xs">✨</div>
                </div>
                <div className="flex items-center gap-4 text-sm text-purple-600 bg-purple-50/50 rounded-full px-4 py-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-400" />
                    <span className="font-medium">{entry.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-purple-400" />
                    <span>{entry.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Empty page message */}
        {pageEntries.length === 0 && (
          <div className="text-center mt-20">
            <div className="kawaii-border bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mx-auto w-fit">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-purple-500 font-serif italic text-lg">
                This page is waiting for your message...
              </p>
              <div className="text-2xl mt-2">💝</div>
            </div>
          </div>
        )}
      </div>

      {/* Page number at bottom */}
      <div className="absolute bottom-4 right-8">
        <div className="kawaii-border bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 py-1">
          <span className="text-purple-600 font-serif text-sm flex items-center gap-1">
            ⭐ {pageNumber + 1}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookPage
