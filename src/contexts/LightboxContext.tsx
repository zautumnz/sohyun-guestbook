import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LightboxContextType {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  imageAuthor: string
  imageAvatarImage: string
  textContent: string
  textAuthor: string
  textAvatarImage: string
  contentType: 'image' | 'text'
  openLightbox: (src: string, alt: string, author: string, avatarImage: string) => void
  openTextLightbox: (content: string, author: string, avatarImage: string) => void
  closeLightbox: () => void
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined)

interface LightboxProviderProps {
  children: ReactNode
}

export const LightboxProvider: React.FC<LightboxProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageAuthor, setImageAuthor] = useState('')
  const [imageAvatarImage, setImageAvatarImage] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textAuthor, setTextAuthor] = useState('')
  const [textAvatarImage, setTextAvatarImage] = useState('')
  const [contentType, setContentType] = useState<'image' | 'text'>('image')

  const openLightbox = (src: string, alt: string, author: string, avatarImage: string) => {
    setImageSrc(src)
    setImageAlt(alt)
    setImageAuthor(author)
    setImageAvatarImage(avatarImage)
    setContentType('image')
    setIsOpen(true)
  }

  const openTextLightbox = (content: string, author: string, avatarImage: string) => {
    setTextContent(content)
    setTextAuthor(author)
    setTextAvatarImage(avatarImage)
    setContentType('text')
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
    // Clear all data after animation completes
    setTimeout(() => {
      setImageSrc('')
      setImageAlt('')
      setImageAuthor('')
      setImageAvatarImage('')
      setTextContent('')
      setTextAuthor('')
      setTextAvatarImage('')
    }, 300)
  }

  const value: LightboxContextType = {
    isOpen,
    imageSrc,
    imageAlt,
    imageAuthor,
    imageAvatarImage,
    textContent,
    textAuthor,
    textAvatarImage,
    contentType,
    openLightbox,
    openTextLightbox,
    closeLightbox
  }

  return (
    <LightboxContext.Provider value={value}>
      {children}
    </LightboxContext.Provider>
  )
}

export const useLightbox = () => {
  const context = useContext(LightboxContext)
  if (context === undefined) {
    throw new Error('useLightbox must be used within a LightboxProvider')
  }
  return context
}