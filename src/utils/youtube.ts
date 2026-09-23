// YouTube utility functions for v2.0

export const extractYouTubeId = (url: string): string | null => {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  } catch (error) {
    console.error('Error extracting YouTube ID:', error)
    return null
  }
}

export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
}
