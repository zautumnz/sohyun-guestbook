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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-gray-800">Add Your Entry</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType('text')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      entryType === 'text'
                        ? 'bg-amber-100 border-amber-500 text-amber-700'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Type size={18} />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('image')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      entryType === 'image'
                        ? 'bg-amber-100 border-amber-500 text-amber-700'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Image size={18} />
                    Image
                  </button>
                </div>
              </div>

              {entryType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Share your thoughts..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {imageUrl ? (
                      <div>
                        <img src={imageUrl} alt="Preview" className="max-w-full h-32 object-cover mx-auto rounded" />
                        <p className="text-sm text-gray-600 mt-2">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600">
                          {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Entry'}
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