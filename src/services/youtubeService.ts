import { YouTubeChannel, YouTubeVideo } from '@/types/youtube';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/youtube';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Define the type for search results
interface YouTubeSearchResult {
  id: {
    channelId?: string;
    videoId?: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    publishedAt: string;
    channelTitle: string;
  };
}

class YouTubeService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Connect a YouTube channel via OAuth
  async connectChannelOAuth(): Promise<void> {
    // Redirect to backend YouTube OAuth route
    window.location.href = `${BACKEND_URL}/auth/youtube`;
  }

  // Connect a YouTube channel via channel ID
  async connectChannel(channelId: string): Promise<{ message: string; channel: YouTubeChannel }> {
    return this.request('/connect', {
      method: 'POST',
      body: JSON.stringify({ channelId }),
    });
  }

  // Get user's connected YouTube channels
  async getConnectedChannels(): Promise<YouTubeChannel[]> {
    return this.request('/channels');
  }

  // Get specific YouTube channel details
  async getChannelDetails(channelId: string): Promise<YouTubeChannel> {
    return this.request(`/channels/${channelId}`);
  }

  // Search for YouTube channels
  async searchChannels(query: string, maxResults: number = 10): Promise<YouTubeSearchResult[]> {
    const params = new URLSearchParams({ query, maxResults: maxResults.toString() });
    return this.request(`/search?${params}`);
  }

  // Get videos for a specific channel
  async getChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({ maxResults: maxResults.toString() });
    return this.request(`/channels/${channelId}/videos?${params}`);
  }

  // Disconnect a YouTube channel
  async disconnectChannel(channelId: string): Promise<{ message: string }> {
    return this.request(`/channels/${channelId}`, {
      method: 'DELETE',
    });
  }
}

export default new YouTubeService();