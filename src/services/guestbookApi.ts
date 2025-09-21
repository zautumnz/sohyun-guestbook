export interface GuestbookEntry {
  id: string;
  type: 'text' | 'image';
  content: string;
  author: string;
  timestamp: string;
  pageNumber: number;
  position: { x: number; y: number };
}

export interface CreateEntryPayload {
  type: 'text' | 'image';
  content: string | File | Blob;
  author: string;
  position: { x: number; y: number };
}

const API_BASE_URL = 'http://localhost:3001'

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

  async getEntries(): Promise<GuestbookEntry[]> {
    return this.request<GuestbookEntry[]>('/entries')
  }

  async createEntry(entryData: CreateEntryPayload): Promise<GuestbookEntry> {
    let processedContent = entryData.content

    // Base64 encode images
    if (entryData.type === 'image') {
      if (entryData.content instanceof File || entryData.content instanceof Blob) {
        // Convert File or Blob to data URL format
        processedContent = await this.convertToBase64(entryData.content)
      } else if (typeof entryData.content === 'string') {
        if (this.isUrl(entryData.content)) {
          // Fetch image from URL and convert to data URL format
          processedContent = await this.fetchImageAsBase64(entryData.content)
        } else if (!this.isDataUrl(entryData.content)) {
          // If it's raw base64 data, wrap it in data URL format
          // Assume JPEG if no format specified
          if (!entryData.content.startsWith('data:')) {
            processedContent = `data:image/jpeg;base64,${entryData.content}`
          }
        }
        // If it's already a data URL, leave it as-is
      }
    }

    const payload = {
      ...entryData,
      content: processedContent as string,
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

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }
}

export const guestbookApi = new GuestbookAPI()
