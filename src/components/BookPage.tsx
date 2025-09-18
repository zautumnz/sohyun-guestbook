import React from 'react'
import { motion } from 'framer-motion'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { Calendar, User } from 'lucide-react'

interface BookPageProps {
  pageNumber: number;
}

const BookPage: React.FC<BookPageProps> = ({ pageNumber }) => {
  const { entries } = useGuestbook()

  // Get entries for this page (6 entries per page)
  const pageEntries = entries.slice(pageNumber * 3, (pageNumber + 1) * 6)

  return (
    <div className="w-full h-full p-8 bg-gradient-to-br from-yellow-50 to-amber-50 relative">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      {/* Ruled lines for writing */}
      <div className="absolute inset-8 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-blue-200/30"
            style={{ top: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* Page Header */}
      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-serif text-amber-800 text-center border-b border-amber-300 pb-2">
          Guest Book - Page {pageNumber + 1}
        </h2>
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
              <div className="bg-white/50 p-4 rounded-lg border border-amber-200 shadow-sm">
                <p className="text-gray-800 font-serif leading-relaxed mb-2">
                  "{entry.content}"
                </p>
                <div className="flex items-center gap-4 text-sm text-amber-700">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{entry.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{entry.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 p-4 rounded-lg border border-amber-200 shadow-sm">
                <img
                    src={entry.type === 'image' ? `/storage/images/${entry.content}` : entry.content}
                  alt="Guest entry"
                  className="max-w-full h-32 object-cover rounded mb-2"
                />
                <div className="flex items-center gap-4 text-sm text-amber-700">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{entry.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{entry.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Empty page message */}
        {pageEntries.length === 0 && (
          <div className="text-center text-amber-600/60 font-serif italic mt-20">
            This page is waiting for your message...
          </div>
        )}
      </div>

      {/* Page number at bottom */}
      <div className="absolute bottom-4 right-8 text-amber-600 font-serif text-sm">
        {pageNumber + 1}
      </div>
    </div>
  )
}

export default BookPage
