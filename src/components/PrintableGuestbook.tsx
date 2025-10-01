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
        <h1>✨ #소현과_사랑에빠지다 ✨</h1>
        <p>A collection of birthday wishes and memories</p>

        {/* Footer */}
        <div className="print-footer">
          <div className="print-date">
            {contentItems.length} messages printed on {new Date().toLocaleDateString()}
          </div>
          Made with 💙 by <span className="font-semibold">zautumn</span>{' '}
          and <span className="font-semibold">joeywerepyre</span>.
          Thanks to <span className="font-semibold">Nites</span>{' '}
          and <span className="font-semibold">YL2002</span> for testing.
        </div>
      </div>

      {/* All Content Items */}
      <div className="print-entries-container">
        {contentItems.map((item, index) => {
          // Add clear div before images to prevent gaps
          const needsClearBefore = item.type === 'image' && index > 0 &&
            contentItems.slice(0, index).some(prevItem => prevItem.type === 'text')

          return (
            <React.Fragment key={item.id}>
              {needsClearBefore && (
                <div style={{ clear: 'both', height: '0', margin: '0', padding: '0', pageBreakInside: 'avoid' }}></div>
              )}

              {item.type === 'text' ? (
                <div className="print-entry print-text-entry">
                  <div className="print-entry-number">#{index + 1}</div>
                  <div className="print-entry-content">
                    "{item.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < item.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}"
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
                <div className="print-image-page">
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
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default PrintableGuestbook
