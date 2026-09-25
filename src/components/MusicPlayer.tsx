import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { motion, AnimatePresence } from 'framer-motion'

const MusicPlayer: React.FC = () => {
  const {
    playlist,
    currentIndex,
    isPlaying,
    volume,
    play,
    pause,
    next,
    setVolume,
  } = useMusicPlayer()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  const currentTrack = playlist[currentIndex]

  // Control playback when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err)
          setHasError(true)
          pause()
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, pause])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Handle audio end - auto next
  const handleEnded = () => {
    next()
  }

  // Handle audio error
  const handleError = () => {
    console.error('Audio loading error for:', currentTrack?.audioPath)
    setHasError(true)

    // Skip to next track if available
    if (playlist.length > 1) {
      setTimeout(() => {
        setHasError(false)
        next()
      }, 2000)
    } else {
      pause()
    }
  }

  // Load new track when currentIndex changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.audioPath) {
      setHasError(false)
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing new track:', err)
          setHasError(true)
        })
      }
    }
  }, [currentIndex, currentTrack, isPlaying])

  // Don't render if no playlist or invalid current track
  if (playlist.length === 0 || !currentTrack) {
    return null
  }

  const audioSrc = currentTrack.audioPath
    ? `http://localhost:3001${currentTrack.audioPath}`
    : null

  if (!audioSrc) {
    return null
  }

  return (
    <>
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      >
        <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Error notification */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-900 dark:bg-amber-800 text-white px-6 py-3 rounded-lg shadow-2xl max-w-md text-center"
          >
            <p className="text-sm font-medium mb-1">⚠️ Can't play this track</p>
            <p className="text-xs opacity-90">
              {playlist.length > 1 ? 'Skipping to next...' : 'Audio failed to load'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed music player bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-900 to-amber-800 dark:from-neutral-900 dark:to-neutral-800 border-t-4 border-amber-600 dark:border-amber-700 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Spinning vinyl disc */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: 'linear'
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg"
              >
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700" />
                {/* Vinyl grooves */}
                <div className="absolute inset-2 rounded-full border-2 border-gray-600 opacity-30" />
                <div className="absolute inset-4 rounded-full border-2 border-gray-500 opacity-20" />
              </motion.div>
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {currentTrack?.songTitle || 'Unknown Song'}
              </div>
              <div className="text-amber-200 dark:text-amber-400 text-sm truncate">
                {currentTrack?.artist || 'Unknown Artist'} • Recommended by {currentTrack?.author || 'Anonymous'}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={() => isPlaying ? pause() : play()}
                className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600 text-white flex items-center justify-center transition-all shadow-lg hover:scale-110"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              {/* Next */}
              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-amber-700/50 hover:bg-amber-600 dark:bg-amber-800/50 dark:hover:bg-amber-700 text-white flex items-center justify-center transition-all"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume control */}
              <div className="relative">
                <button
                  onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                  className="w-10 h-10 rounded-full bg-amber-700/50 hover:bg-amber-600 dark:bg-amber-800/50 dark:hover:bg-amber-700 text-white flex items-center justify-center transition-all"
                  aria-label="Volume"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {isVolumeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 p-3 bg-amber-800 dark:bg-neutral-800 rounded-lg shadow-xl"
                    >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="h-24 w-8 -rotate-90 origin-center"
                        style={{ transformOrigin: 'center' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Track counter */}
              <div className="hidden sm:block text-amber-200 dark:text-amber-400 text-sm">
                {currentIndex + 1} / {playlist.length}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default MusicPlayer
