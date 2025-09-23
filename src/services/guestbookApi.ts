export interface ContentItem {
  type: 'text' | 'image';
  content: string;
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
  type: 'text' | 'image';
  content: string | File | Blob;
}

export interface CreateEntryPayload {
  content: CreateContentItem[];
  author: string;
  position: { x: number; y: number };
}

const API_BASE_URL = globals.environment === 'production' ? '' : 'http://localhost:3001'

class GuestbookAPI {
  private async convertToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Keep the full data URL format for server compatibility
        resolve(result)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const blob = await response.blob()
      return this.convertToBase64(blob)
    } catch (error) {
      throw new Error(`Failed to fetch and convert image: ${error}`)
    }
  }

  private isDataUrl(str: string): boolean {
    return str.startsWith('data:image/') && str.includes('base64,')
  }

  private isUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
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

    // Process each content item
    for (const item of entryData.content) {
      if (item.type === 'image') {
        let processedImageContent = item.content

        if (item.content instanceof File || item.content instanceof Blob) {
          // Convert File or Blob to data URL format
          processedImageContent = await this.convertToBase64(item.content)
        } else if (typeof item.content === 'string') {
          if (this.isUrl(item.content)) {
            // Fetch image from URL and convert to data URL format
            processedImageContent = await this.fetchImageAsBase64(item.content)
          } else if (!this.isDataUrl(item.content)) {
            // If it's raw base64 data, wrap it in data URL format
            // Assume JPEG if no format specified
            if (!item.content.startsWith('data:')) {
              processedImageContent = `data:image/jpeg;base64,${item.content}`
            }
          }
          // If it's already a data URL, leave it as-is
        }

        processedContent.push({
          type: 'image',
          content: processedImageContent as string
        })
      } else {
        processedContent.push({
          type: 'text',
          content: item.content as string
        })
      }
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
