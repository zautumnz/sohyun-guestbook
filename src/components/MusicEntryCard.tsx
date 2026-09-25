import React from 'react'
import { Music, ExternalLink, Calendar, Trash2, Check, Clock } from 'lucide-react'
import { MusicRecommendation } from '@/services/guestbookApi'
import { getYouTubeThumbnail } from '@/utils/youtube'

interface MusicEntryCardProps {
  music: MusicRecommendation
  author: string
  timestamp: Date
  colorIndex: number
  drawingIndex: number
  groupInfo: {
    isGrouped: boolean
    isFirst: boolean
    isLast: boolean
  }
  approvalStatus: {
    isPending: boolean
    isApproved: boolean
  }
  showDeleteButtons: boolean
  isAdmin: boolean
  onApprove: () => void
  onDelete: () => void
}

const MusicEntryCard: React.FC<MusicEntryCardProps> = ({
  music,
  author,
  timestamp,
  colorIndex,
  drawingIndex,
  groupInfo,
  approvalStatus,
  showDeleteButtons,
  isAdmin,
  onApprove,
  onDelete,
}) => {
  const thumbnailUrl = music.youtubeId
    ? getYouTubeThumbnail(music.youtubeId)
    : '/assets/vinyl-placeholder.png'

  return (
    <div className={`kawaii-entry kawaii-entry-${colorIndex} p-3 xl:p-3 2xl:p-4 relative group transition-all flex-1 ${
      groupInfo.isGrouped ? 'grouped-item' : 'hover:scale-[1.02]'
    } hover:shadow-lg ${
      approvalStatus.isPending ? 'ring-2 ring-yellow-300/50 bg-yellow-50/30 dark:bg-yellow-900/20' :
      (!approvalStatus.isApproved && isAdmin) ? 'ring-2 ring-red-300/50 bg-red-50/30 dark:bg-red-900/20' : ''
    }`}>
      {/* Group border highlight */}
      {groupInfo.isGrouped && (
        <div className={`group-border group-border-${colorIndex} ${
          groupInfo.isFirst ? 'group-border-first' :
          groupInfo.isLast ? 'group-border-last' :
          'group-border-middle'
        }`} />
      )}

      {/* Admin controls */}
      {showDeleteButtons && (
        <div className="absolute top-3 right-3 flex gap-1 z-10">
          {!approvalStatus.isApproved && !approvalStatus.isPending && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onApprove()
              }}
              className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white transition-all shadow-lg hover:shadow-xl"
              title="Approve entry"
            >
              <Check size={12} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 rounded-full bg-gradient-to-r from-amber-400 to-red-400 hover:from-amber-500 hover:to-red-500 text-white transition-all shadow-lg hover:shadow-xl"
            title="Delete entry"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Approval status indicator */}
      {(approvalStatus.isPending || (!approvalStatus.isApproved && isAdmin)) && (
        <div className={`absolute top-3 left-3 p-1 rounded-full ${
          approvalStatus.isPending ? 'bg-yellow-100/80 dark:bg-yellow-900/80' : 'bg-red-100/80 dark:bg-red-900/80'
        } backdrop-blur-sm`} title={approvalStatus.isPending ? "Pending approval" : "Needs approval"}>
          {approvalStatus.isPending ? (
            <Clock size={12} className="text-yellow-600 dark:text-yellow-300" />
          ) : (
            <Clock size={12} className="text-red-600 dark:text-red-300" />
          )}
        </div>
      )}

      {/* Album art / vinyl */}
      <div className="relative mb-3 rounded-lg overflow-hidden aspect-square bg-gradient-to-br from-amber-900 to-amber-700 dark:from-neutral-800 dark:to-neutral-900">
        <img
          src={thumbnailUrl}
          alt={music.songTitle || 'Album art'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to vinyl icon if thumbnail fails
            e.currentTarget.src = '/assets/vinyl-placeholder.png'
          }}
        />
        <div className="absolute top-2 right-2 bg-amber-900/80 backdrop-blur-sm rounded-full p-1.5">
          <Music size={14} className="text-amber-100" />
        </div>
      </div>

      {/* Song info */}
      <div className="mb-2">
        <div className="text-amber-900 dark:text-amber-100 font-semibold text-sm truncate">
          {music.songTitle || 'Unknown Song'}
        </div>
        <div className="text-amber-700 dark:text-amber-300 text-xs truncate">
          {music.artist || 'Unknown Artist'}
        </div>
      </div>

      {/* YouTube link */}
      {music.youtubeUrl && (
        <a
          href={music.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors mb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={10} />
          Listen on YouTube
        </a>
      )}

      {/* Author info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-900/40 rounded-lg sm:rounded-full px-3 py-2 mt-auto">
        <div className="flex items-center gap-2">
          <img
            src={`/assets/drawings/${drawingIndex}.png`}
            alt="Author avatar"
            className="w-8 h-8 rounded-full object-cover border border-amber-300/50"
          />
          <span className="font-medium truncate">{author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={10} className="text-amber-400" />
          <span>{timestamp.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default MusicEntryCard
