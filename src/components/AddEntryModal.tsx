import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Type, Image, Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useGuestbook } from '@/contexts/GuestbookContext'
import { useToast } from '@/hooks/use-toast'

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose }) => {
  const { addEntry } = useGuestbook()
  const { toast } = useToast()
  const [entryType, setEntryType] = useState<'text' | 'image'>('text')
  const [author, setAuthor] = useState('')
  const [textContent, setTextContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // In a real app, you'd upload this to your server
      // For demo purposes, we'll create a local URL
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      console.log('File selected:', file.name)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

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

    if (entryType === 'text' && !textContent.trim()) {
      toast({
        title: "Please enter your message",
        variant: "destructive"
      })
      return
    }

    if (entryType === 'image' && !imageUrl) {
      toast({
        title: "Please select an image",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)

      await addEntry({
        type: entryType,
        content: entryType === 'text' ? textContent : imageUrl,
        author: author.trim(),
        position: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 }
      })

      toast({
        title: "Entry added successfully!",
        description: "Your message has been added to the guestbook."
      })

      // Reset form
      setAuthor('')
      setTextContent('')
      setImageUrl('')
      setEntryType('text')
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
                <label className="block text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                  💭 Entry Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEntryType('text')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                      entryType === 'text'
                        ? 'kawaii-border bg-purple-100 text-purple-700 shadow-md'
                        : 'border-purple-200 bg-purple-50/30 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <Type size={18} />
                    📝 Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('image')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                      entryType === 'image'
                        ? 'kawaii-border bg-purple-100 text-purple-700 shadow-md'
                        : 'border-purple-200 bg-purple-50/30 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <Image size={18} />
                    🖼️ Image
                  </button>
                </div>
              </div>

              {entryType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                    💌 Your Message
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-purple-50/50 text-purple-800 placeholder-purple-400 resize-none"
                    placeholder="Share your thoughts... ✨"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                    🖼️ Upload Image
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-purple-400 bg-purple-100/50 scale-105'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {imageUrl ? (
                      <div>
                        <img src={imageUrl} alt="Preview" className="max-w-full h-32 object-cover mx-auto rounded-lg border-2 border-purple-200 shadow-md" />
                        <p className="text-sm text-purple-600 mt-3 flex items-center justify-center gap-1">
                          ✨ Click to change image ✨
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-purple-400 mb-3" />
                        <p className="text-purple-600 flex items-center justify-center gap-2">
                          {isDragActive ? '🌟 Drop the image here! 🌟' : '📸 Drag & drop an image, or click to select ✨'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

export default AddEntryModal
