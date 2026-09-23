import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { MusicRecommendation } from '@/services/guestbookApi'

interface PlaylistTrack {
  id: string  // entry ID
  youtubeId: string
  songTitle: string
  artist: string
  albumArtUrl: string
  author: string  // person who recommended it
}

interface MusicPlayerContextType {
  playlist: PlaylistTrack[]
  currentIndex: number
  isPlaying: boolean
  volume: number
  isReady: boolean
  setPlaylist: (tracks: PlaylistTrack[]) => void
  play: () => void
  pause: () => void
  next: () => void
  setVolume: (volume: number) => void
  setCurrentIndex: (index: number) => void
  setIsReady: (ready: boolean) => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null)

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylistState] = useState<PlaylistTrack[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(50)
  const [isReady, setIsReady] = useState(false)

  // Shuffle playlist on mount (re-shuffle on each visit)
  const setPlaylist = useCallback((tracks: PlaylistTrack[]) => {
    // Fisher-Yates shuffle
    const shuffled = [...tracks]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setPlaylistState(shuffled)
    setCurrentIndex(0)
  }, [])

  const play = useCallback(() => {
    if (playlist.length > 0) {
      setIsPlaying(true)
    }
  }, [playlist.length])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const next = useCallback(() => {
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }
  }, [playlist.length])

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume))
    setVolumeState(clampedVolume)
    // Store in localStorage
    localStorage.setItem('music-player-volume', clampedVolume.toString())
  }, [])

  // Load volume from localStorage on mount
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem('music-player-volume')
      if (savedVolume) {
        setVolumeState(parseInt(savedVolume, 10))
      }
    } catch (error) {
      console.error('Error loading volume from localStorage:', error)
    }
  }, [])

  const value = {
    playlist,
    currentIndex,
    isPlaying,
    volume,
    isReady,
    setPlaylist,
    play,
    pause,
    next,
    setVolume,
    setCurrentIndex,
    setIsReady,
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}
