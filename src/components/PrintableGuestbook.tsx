import React from 'react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { Calendar, User } from 'lucide-react'

const PrintableGuestbook = () => {
  const { entries, loading, error } = useGuestbook()

  // Don't render anything if still loading or if there's an error
  if (loading || error || entries.length === 0) {
    return null
  }

  return (
    <div className="print-only">
      {/* Print Header */}
      <div className="print-header">
        <h1>✨ Sohyun's Birthday Guestbook ✨</h1>
        <p>A collection of birthday wishes and memories</p>
        <div className="print-date">
          {entries.length} entries printed on {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* All Entries Grid */}
      <div className="print-entries-grid">
        {entries.map((entry, index) => (
          <div key={entry.id} className="print-entry">
            <div className="print-entry-number">#{index + 1}</div>

            {entry.type === 'text' ? (
              <div className="print-text-entry">
                <div className="print-entry-content">
                  "{entry.content}"
                </div>
              </div>
            ) : (
              <div className="print-image-entry">
                <div className="print-entry-content">
                  <img
                    src={entry.type === 'image' ? `/storage/images/${entry.content}` : entry.content}
                    alt="Guest entry"
                    className="print-image"
                  />
                </div>
              </div>
            )}

            <div className="print-entry-meta">
              <div className="print-author">
                <User size={12} />
                <span>{entry.author}</span>
              </div>
              <div className="print-date">
                <Calendar size={12} />
                <span>{entry.timestamp.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PrintableGuestbook
