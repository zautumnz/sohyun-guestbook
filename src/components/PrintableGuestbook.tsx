import React from 'react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { Calendar, User } from 'lucide-react'

const PrintableGuestbook = () => {
  const { entries, contentItems, loading, error } = useGuestbook()

  // Don't render anything if still loading or if there's an error
  if (loading || error || contentItems.length === 0) {
    return null
  }

  return (
    <div className="print-only">
      {/* Print Header */}
      <div className="print-header">
        <h1>✨ Sohyun's Birthday Guestbook ✨</h1>
        <p>A collection of birthday wishes and memories</p>
        <div className="print-date">
          {contentItems.length} items printed on {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* All Content Items */}
      <div className="print-entries-container">
        {contentItems.map((item, index) => {
          const previousItem = index > 0 ? contentItems[index - 1] : null
          const isFirstImage = item.type === 'image' && (!previousItem || previousItem.type === 'text')
          const isConsecutiveImage = item.type === 'image' && previousItem?.type === 'image'
          
          return item.type === 'text' ? (
            <div key={item.id} className="print-entry print-text-entry">
              <div className="print-entry-number">#{index + 1}</div>
              <div className="print-entry-content">
                "{item.content}"
              </div>
              <div className="print-entry-meta">
                <div className="print-author">
                  <User size={12} />
                  <span>{item.author}</span>
                </div>
                <div className="print-date">
                  <Calendar size={12} />
                  <span>{item.timestamp.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div 
              key={item.id} 
              className={`print-image-page ${isFirstImage ? 'first-image' : ''} ${isConsecutiveImage ? 'consecutive-image' : ''}`}
            >
              <div className="print-image-header">
                <div className="print-entry-number">#{index + 1}</div>
                <div className="print-entry-meta">
                  <div className="print-author">
                    <User size={12} />
                    <span>{item.author}</span>
                  </div>
                  <div className="print-date">
                    <Calendar size={12} />
                    <span>{item.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="print-image-container">
                <img
                  src={`/storage/images/${item.content}`}
                  alt="Guest entry"
                  className="print-image-full-page"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PrintableGuestbook
