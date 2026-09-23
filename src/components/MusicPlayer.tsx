import React, { useRef, useEffect, useState } from 'react'
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube'
import { Play, Pause, SkipForward, Volume2, VolumeX, Disc3 } from 'lucide-react'
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
    setIsReady,
  } = useMusicPlayer()

  const playerRef = useRef<YouTubePlayer | null>(null)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)

  const currentTrack = playlist[currentIndex]

  // YouTube player options
  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
    },
  }

  // Handle player ready
  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target
    setIsReady(true)
    if (volume !== undefined) {
      event.target.setVolume(volume)
    }
  }

  // Handle video end - auto next
  const onEnd: YouTubeProps['onEnd'] = () => {
    next()
  }

  // Handle errors - skip to next
  const onError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube player error:', event)
    // Skip to next track if current one fails
    setTimeout(() => {
      next()
    }, 1000)
  }

  // Control playback when isPlaying changes
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    }
  }, [isPlaying, currentIndex])

  // Update volume when it changes
  useEffect(() => {
    if (playerRef.current && volume !== undefined) {
      playerRef.current.setVolume(volume)
    }
  }, [volume])

  // Don't render if no playlist
  if (playlist.length === 0) {
    return null
  }

  return (
    <>
      {/* Hidden YouTube player */}
      {currentTrack && (
        <div className="hidden">
          <YouTube
            videoId={currentTrack.youtubeId}
            opts={opts}
            onReady={onReady}
            onEnd={onEnd}
            onError={onError}
          />
        </div>
      )}

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
