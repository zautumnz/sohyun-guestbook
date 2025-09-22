import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LightboxContextType {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  textContent: string
  textAuthor: string
  contentType: 'image' | 'text'
  openLightbox: (src: string, alt: string) => void
  openTextLightbox: (content: string, author: string) => void
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
  const [textContent, setTextContent] = useState('')
  const [textAuthor, setTextAuthor] = useState('')
  const [contentType, setContentType] = useState<'image' | 'text'>('image')

  const openLightbox = (src: string, alt: string) => {
    setImageSrc(src)
    setImageAlt(alt)
    setContentType('image')
    setIsOpen(true)
  }

  const openTextLightbox = (content: string, author: string) => {
    setTextContent(content)
    setTextAuthor(author)
    setContentType('text')
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
    // Clear all data after animation completes
    setTimeout(() => {
      setImageSrc('')
      setImageAlt('')
      setTextContent('')
      setTextAuthor('')
    }, 300)
  }

  const value: LightboxContextType = {
    isOpen,
    imageSrc,
    imageAlt,
    textContent,
    textAuthor,
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