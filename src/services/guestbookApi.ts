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
  content: string;
  author: string;
  position: { x: number; y: number };
}

const API_BASE_URL = 'http://localhost:3001'

class GuestbookAPI {
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
    return this.request<GuestbookEntry>('/entry', {
      method: 'POST',
      body: JSON.stringify(entryData),
    })
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }
}

export const guestbookApi = new GuestbookAPI()