import React from 'react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { Calendar, User } from 'lucide-react'
import { MusicRecommendation } from '@/services/guestbookApi'

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
          return (
            <React.Fragment key={item.id}>
              {item.type === 'text' ? (
                <div className="print-entry print-text-entry">
                  <div className="print-entry-number">#{index + 1}</div>
                  <div className="print-entry-content">
                    "{(item.content as string).split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < (item.content as string).split('\n').length - 1 && <br />}
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
              ) : item.type === 'music' ? (
                <div className="print-entry print-music-entry">
                  <div className="print-entry-number">#{index + 1} 🎵</div>
                  <div className="print-entry-content">
                    <div className="font-semibold">
                      {(item.content as MusicRecommendation).songTitle || 'Unknown Song'}
                    </div>
                    <div className="text-sm">
                      by {(item.content as MusicRecommendation).artist || 'Unknown Artist'}
                    </div>
                    {(item.content as MusicRecommendation).youtubeUrl && (
                      <div className="text-xs mt-1">
                        {(item.content as MusicRecommendation).youtubeUrl}
                      </div>
                    )}
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
              ) : null}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default PrintableGuestbook
