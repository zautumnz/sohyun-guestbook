import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, Type, Plus, Trash2 } from 'lucide-react'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { useToast } from '@/hooks/use-toast'
import { CreateContentItem, MusicRecommendation } from '@/services/guestbookApi'

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContentItemInput {
  type: 'text' | 'music';
  content: string | MusicRecommendation;
  id: string;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose }) => {
  const { addEntry } = useGuestbook()
  const { toast } = useToast()
  const [author, setAuthor] = useState('')
  const [contentItems, setContentItems] = useState<ContentItemInput[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add content item (text or music)
  const addTextItem = () => {
    const newId = `item-${Date.now()}`
    setContentItems(prev => [...prev, { type: 'text', content: '', id: newId }])
  }

  const addMusicItem = () => {
    const newId = `item-${Date.now()}`
    setContentItems(prev => [...prev, {
      type: 'music',
      content: {
        youtubeUrl: '',
        songTitle: '',
        artist: '',
        albumArtUrl: ''
      },
      id: newId
    }])
  }

  const removeContentItem = (id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id))
  }

  const updateTextContent = (id: string, content: string) => {
    setContentItems(prev => prev.map(item =>
      item.id === id ? { ...item, content } : item
    ))
  }

  const updateMusicContent = (id: string, field: keyof MusicRecommendation, value: string) => {
    setContentItems(prev => prev.map(item => {
      if (item.id === id && item.type === 'music') {
        const musicContent = item.content as MusicRecommendation
        return {
          ...item,
          content: { ...musicContent, [field]: value }
        }
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!author.trim()) {
      toast({
        title: "Please enter your name",
        variant: "destructive"
      })
      return
    }

    // v2.0: Validate that entry has at least one music OR text item
    if (contentItems.length === 0) {
      toast({
        title: "Add some content",
        description: "Please add at least one song recommendation or birthday message",
        variant: "destructive"
      })
      return
    }

    // Validate all content items
    const hasInvalidContent = contentItems.some(item => {
      if (item.type === 'text') {
        return !item.content.toString().trim()
      } else if (item.type === 'music') {
        const music = item.content as MusicRecommendation
        return !music.youtubeUrl.trim()
      }
      return false
    })

    if (hasInvalidContent) {
      toast({
        title: "Please fill in all fields",
        description: "Text messages cannot be empty, and music entries must have a YouTube URL",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Convert contentItems to the format expected by the API
      const contentForAPI: CreateContentItem[] = contentItems.map(item => ({
        type: item.type,
        content: item.content
      }))

      await addEntry({
        content: contentForAPI,
        author: author.trim(),
        position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 }
      })

      toast({
        title: "Entry submitted successfully!",
        description: "Your entry has been queued for review and will appear after approval."
      })

      // Reset form
      setAuthor('')
      setContentItems([])
      onClose()
    } catch (error) {
      let errorMessage = "Something went wrong"

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Failed to submit entry",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-amber-900/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-amber-50 dark:bg-neutral-900 border-4 border-amber-800 dark:border-amber-600 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vinyl-themed decorative elements */}
            <div className="absolute top-4 left-4 text-amber-300/30 text-sm">🎵</div>
            <div className="absolute top-4 right-16 text-amber-300/30 text-xs">🎶</div>
            <div className="absolute bottom-4 left-8 text-amber-300/30 text-xs">💿</div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-serif text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Music className="w-6 h-6" />
                Add Your Entry
              </h2>
              <button
                onClick={onClose}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Author name */}
              <div>
                <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-800 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Content items */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-amber-900 dark:text-amber-200">
                  Content (add at least one)
                </label>

                {contentItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-neutral-800/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        {item.type === 'music' ? '🎵 Song Recommendation' : '💌 Birthday Message'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeContentItem(item.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.type === 'text' ? (
                      <textarea
                        value={item.content as string}
                        onChange={(e) => updateTextContent(item.id, e.target.value)}
                        placeholder="Write your birthday message here..."
                        rows={4}
                        className="w-full px-3 py-2 rounded border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={(item.content as MusicRecommendation).youtubeUrl}
                          onChange={(e) => updateMusicContent(item.id, 'youtubeUrl', e.target.value)}
                          placeholder="YouTube URL (required) *"
                          className="w-full px-3 py-2 rounded border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          type="text"
                          value={(item.content as MusicRecommendation).songTitle}
                          onChange={(e) => updateMusicContent(item.id, 'songTitle', e.target.value)}
                          placeholder="Song Title (optional)"
                          className="w-full px-3 py-2 rounded border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          type="text"
                          value={(item.content as MusicRecommendation).artist}
                          onChange={(e) => updateMusicContent(item.id, 'artist', e.target.value)}
                          placeholder="Artist (optional)"
                          className="w-full px-3 py-2 rounded border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Paste any YouTube link - we'll extract the song info automatically
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addMusicItem}
                    disabled={contentItems.some(item => item.type === 'music')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-amber-400 dark:border-amber-600 bg-white dark:bg-neutral-800 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-800"
                  >
                    <Music className="w-4 h-4" />
                    Add Song {contentItems.some(item => item.type === 'music') && '✓'}
                  </button>
                  <button
                    type="button"
                    onClick={addTextItem}
                    disabled={contentItems.some(item => item.type === 'text')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-amber-400 dark:border-amber-600 bg-white dark:bg-neutral-800 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-neutral-800"
                  >
                    <Type className="w-4 h-4" />
                    Add Message {contentItems.some(item => item.type === 'text') && '✓'}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-neutral-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                </button>
              </div>

              <p className="text-xs text-center text-amber-700 dark:text-amber-400">
                Your entry will be reviewed before appearing on the page
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddEntryModal
