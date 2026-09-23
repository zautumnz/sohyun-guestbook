// v2.0: Music recommendation metadata
export interface MusicRecommendation {
  youtubeUrl: string;
  youtubeId?: string;
  songTitle?: string;
  artist?: string;
  albumArtUrl?: string;
}

export interface ContentItem {
  type: 'text' | 'music';  // v2.0: removed 'image', added 'music'
  content: string | MusicRecommendation;
}

export interface GuestbookEntry {
  id: string;
  content: ContentItem[];
  author: string;
  timestamp: string;
  pageNumber: number;
  position: { x: number; y: number };
  approved?: boolean;
}

export interface CreateContentItem {
  type: 'text' | 'music';  // v2.0: removed 'image', added 'music'
  content: string | MusicRecommendation;
}

export interface CreateEntryPayload {
  content: CreateContentItem[];
  author: string;
  position: { x: number; y: number };
}

const API_BASE_URL = globals.environment === 'production' ? '' : 'http://localhost:3001'

class GuestbookAPI {
  // v2.0: Helper to extract YouTube video ID from URL
  private extractYouTubeId(url: string): string | null {
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
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getEntries(password?: string): Promise<GuestbookEntry[]> {
    const url = password ? `/entries?pw=${encodeURIComponent(password)}` : '/entries'
    return this.request<GuestbookEntry[]>(url)
  }

  async createEntry(entryData: CreateEntryPayload): Promise<GuestbookEntry> {
    const processedContent: ContentItem[] = []

    // v2.0: Process each content item (text or music, no images)
    for (const item of entryData.content) {
      if (item.type === 'music') {
        const musicContent = item.content as MusicRecommendation

        // Validate YouTube URL
        if (!musicContent.youtubeUrl) {
          throw new Error('Music entry must have a YouTube URL')
        }

        // Extract video ID
        const youtubeId = this.extractYouTubeId(musicContent.youtubeUrl)
        if (!youtubeId) {
          throw new Error('Invalid YouTube URL format')
        }

        processedContent.push({
          type: 'music',
          content: {
            youtubeUrl: musicContent.youtubeUrl,
            youtubeId,
            songTitle: musicContent.songTitle || '',
            artist: musicContent.artist || '',
            albumArtUrl: musicContent.albumArtUrl || ''
          }
        })
      } else if (item.type === 'text') {
        // Text content
        if (typeof item.content !== 'string') {
          throw new Error('Text content must be a string')
        }
        processedContent.push({
          type: 'text',
          content: item.content as string
        })
      }
    }

    // Validate that entry has at least one content item
    if (processedContent.length === 0) {
      throw new Error('Entry must have at least one music or text item')
    }

    const payload = {
      ...entryData,
      content: processedContent,
    }

    return this.request<GuestbookEntry>('/entry', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async deleteEntry(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/entry/${id}`, {
      method: 'DELETE',
    })
  }

  async approveEntry(id: string, password: string): Promise<{ success: boolean; message: string; entry: GuestbookEntry }> {
    return this.request(`/entry/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    })
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }
}

export const guestbookApi = new GuestbookAPI()
