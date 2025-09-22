import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Type, Image, Upload, Plus, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { useToast } from '@/hooks/use-toast'
import { CreateContentItem } from '@/services/guestbookApi'

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContentItemInput {
  type: 'text' | 'image';
  content: string | File;
  id: string;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose }) => {
  const { addEntry } = useGuestbook()
  const { toast } = useToast()
  const [author, setAuthor] = useState('')
  const [contentItems, setContentItems] = useState<ContentItemInput[]>([
    { type: 'text', content: '', id: 'item-0' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addContentItem = (type: 'text' | 'image') => {
    const newId = `item-${Date.now()}`
    setContentItems(prev => [...prev, { type, content: '', id: newId }])
  }

  const removeContentItem = (id: string) => {
    if (contentItems.length > 1) {
      setContentItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateContentItem = (id: string, content: string | File) => {
    setContentItems(prev => prev.map(item =>
      item.id === id ? { ...item, content } : item
    ))
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

    // Validate all content items
    const hasEmptyContent = contentItems.some(item =>
      (item.type === 'text' && !item.content.toString().trim()) ||
      (item.type === 'image' && !item.content)
    )

    if (hasEmptyContent) {
      toast({
        title: "Please fill in all content items",
        description: "All text fields must have content and all images must be selected",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Convert contentItems to the format expected by the API
      const contentForAPI: CreateContentItem[] = contentItems.map(item => ({
        type: item.type,
        content: item.content as string | File | Blob
      }))

      await addEntry({
        content: contentForAPI,
        author: author.trim(),
        position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 }
      })

      toast({
        title: "Entry added successfully!",
        description: "Your message has been added to the guestbook."
      })

      // Reset form
      setAuthor('')
      setContentItems([{ type: 'text', content: '', id: 'item-0' }])
      onClose()
    } catch (error) {
      toast({
        title: "Failed to add entry",
        description: error instanceof Error ? error.message : "Something went wrong",
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
          className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="kawaii-modal rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kawaii decorative stars */}
            <div className="absolute top-4 left-4 text-purple-300/30 text-sm kawaii-star">✨</div>
            <div className="absolute top-4 right-16 text-pink-300/30 text-xs kawaii-star">⭐</div>
            <div className="absolute bottom-4 left-8 text-purple-300/30 text-xs kawaii-star">💫</div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-serif text-purple-800 flex items-center gap-2">
                💝 Add Your Entry ✨
              </h2>
              <button
                onClick={onClose}
                className="kawaii-button p-2 rounded-full hover:scale-110 transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                  ⭐ Your Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-purple-50/50 text-purple-800 placeholder-purple-400"
                  placeholder="Enter your name ✨"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-purple-700 flex items-center gap-2">
                    💭 Content Items
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addContentItem('text')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all"
                    >
                      <Plus size={12} />
                      📝 Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentItem('image')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all"
                    >
                      <Plus size={12} />
                      🖼️ Image
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {contentItems.map((item, index) => (
                    <ContentItemInput
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={(content) => updateContentItem(item.id, content)}
                      onRemove={() => removeContentItem(item.id)}
                      canRemove={contentItems.length > 1}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-medium"
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="kawaii-button flex-1 px-6 py-3 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? '✨ Adding... ✨' : '💝 Add Entry 🌟'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ContentItemInputProps {
  item: ContentItemInput;
  index: number;
  onUpdate: (content: string | File) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ContentItemInput: React.FC<ContentItemInputProps> = ({ 
  item, 
  index, 
  onUpdate, 
  onRemove, 
  canRemove 
}) => {
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onUpdate(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

  return (
    <div className="kawaii-border bg-purple-50/30 rounded-xl p-4 relative">
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full hover:from-red-500 hover:to-red-600 transition-all shadow-sm"
          title="Remove item"
        >
          <Trash2 size={12} />
        </button>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
          {index + 1}. {item.type === 'text' ? '📝 Text' : '🖼️ Image'}
        </span>
      </div>

      {item.type === 'text' ? (
        <textarea
          value={item.content as string}
          onChange={(e) => onUpdate(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-purple-800 placeholder-purple-400 resize-none text-sm"
          placeholder="Enter your text... ✨"
        />
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-purple-400 bg-purple-100/50 scale-105'
              : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30'
          }`}
        >
          <input {...getInputProps()} />
          {item.content ? (
            <div>
              <img 
                src={item.content instanceof File ? URL.createObjectURL(item.content) : item.content as string} 
                alt="Preview" 
                className="max-w-full h-20 object-cover mx-auto rounded-lg border-2 border-purple-200 shadow-sm" 
              />
              <p className="text-xs text-purple-600 mt-2">
                ✨ Click to change ✨
              </p>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-8 w-8 text-purple-400 mb-2" />
              <p className="text-purple-600 text-xs">
                {isDragActive ? '🌟 Drop here! 🌟' : '📸 Click or drop image ✨'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddEntryModal
