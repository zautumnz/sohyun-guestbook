import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LightboxContextType {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  openLightbox: (src: string, alt: string) => void
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

  const openLightbox = (src: string, alt: string) => {
    setImageSrc(src)
    setImageAlt(alt)
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
    // Clear the image data after animation completes
    setTimeout(() => {
      setImageSrc('')
      setImageAlt('')
    }, 300)
  }

  const value: LightboxContextType = {
    isOpen,
    imageSrc,
    imageAlt,
    openLightbox,
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