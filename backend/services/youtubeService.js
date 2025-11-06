const { google } = require('googleapis');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey
    });
  }

  /**
   * Initialize YouTube API client with OAuth token
   * @param {string} accessToken - OAuth access token
   * @returns {Object} Authenticated YouTube client
   */
  getAuthenticatedClient(accessToken) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/youtube/callback`
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
  }

  /**
   * Get public channel details by channel ID (no authentication required)
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<Object>} Channel details
   */
  async getChannelDetails(channelId) {
    try {
      const response = await this.youtube.channels.list({
        id: channelId,
        part: ['snippet', 'statistics', 'contentDetails']
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0];
      } else {
        throw new Error('Channel not found');
      }
    } catch (error) {
      throw new Error(`Failed to fetch channel details: ${error.message}`);
    }
  }

  /**
   * Get public channel details by username (no authentication required)
   * @param {string} username - YouTube username
   * @returns {Promise<Object>} Channel details
   */
  async getChannelDetailsByUsername(username) {
    try {
      const response = await this.youtube.channels.list({
        forUsername: username,
        part: ['snippet', 'statistics', 'contentDetails']
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0];
      } else {
        throw new Error('Channel not found');
      }
    } catch (error) {
      throw new Error(`Failed to fetch channel details: ${error.message}`);
    }
  }

  /**
   * Get public channel details by custom URL (no authentication required)
   * @param {string} customUrl - YouTube custom URL
   * @returns {Promise<Object>} Channel details
   */
  async getChannelDetailsByCustomUrl(customUrl) {
    try {
      // For custom URLs, we need to search for the channel first
      const searchResponse = await this.youtube.search.list({
        q: customUrl,
        type: ['channel'],
        part: ['snippet'],
        maxResults: 1
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        const channelId = searchResponse.data.items[0].id.channelId;
        return await this.getChannelDetails(channelId);
      } else {
        throw new Error('Channel not found');
      }
    } catch (error) {
      throw new Error(`Failed to fetch channel details: ${error.message}`);
    }
  }

  /**
   * Search for channels by query
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results (default: 5)
   * @returns {Promise<Array>} List of channels
   */
  async searchChannels(query, maxResults = 5) {
    try {
      const response = await this.youtube.search.list({
        q: query,
        type: ['channel'],
        part: ['snippet'],
        maxResults: maxResults
      });

      return response.data.items || [];
    } catch (error) {
      throw new Error(`Failed to search channels: ${error.message}`);
    }
  }

  /**
   * Get videos by channel ID
   * @param {string} channelId - YouTube channel ID
   * @param {number} maxResults - Maximum number of results (default: 50)
   * @returns {Promise<Array>} List of videos
   */
  async getChannelVideos(channelId, maxResults = 50) {
    try {
      // First get the uploads playlist ID from the channel
      const channelResponse = await this.youtube.channels.list({
        id: channelId,
        part: ['contentDetails']
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

      // Then get the videos from the uploads playlist
      return await this.getPlaylistItems(uploadsPlaylistId, maxResults);
    } catch (error) {
      throw new Error(`Failed to fetch channel videos: ${error.message}`);
    }
  }

  /**
   * Get playlist items (videos) by playlist ID
   * @param {string} playlistId - YouTube playlist ID
   * @param {number} maxResults - Maximum number of results (default: 50)
   * @returns {Promise<Array>} List of videos
   */
  async getPlaylistItems(playlistId, maxResults = 50) {
    try {
      // YouTube API has a maximum of 50 results per request
      const actualMaxResults = Math.min(maxResults, 50);
      
      // First get playlist items (which contain video IDs)
      const playlistResponse = await this.youtube.playlistItems.list({
        playlistId: playlistId,
        part: ['snippet'],
        maxResults: actualMaxResults
      });

      // Extract video IDs from playlist items
      const videoIds = playlistResponse.data.items
        .map(item => item.snippet.resourceId.videoId)
        .filter(id => id)
        .join(',');

      if (!videoIds) {
        return [];
      }

      // Then get full video details including duration
      const videosResponse = await this.youtube.videos.list({
        id: videoIds,
        part: ['snippet', 'contentDetails', 'statistics']
      });

      return videosResponse.data.items || [];
    } catch (error) {
      throw new Error(`Failed to fetch playlist items: ${error.message}`);
    }
  }

  /**
   * Get user's own channels (requires OAuth)
   * @param {string} accessToken - OAuth access token
   * @returns {Promise<Array>} List of user's channels
   */
  async getMyChannels(accessToken) {
    try {
      const authClient = this.getAuthenticatedClient(accessToken);
      const response = await authClient.channels.list({
        mine: true,
        part: ['snippet', 'statistics', 'contentDetails']
      });

      return response.data.items || [];
    } catch (error) {
      throw new Error(`Failed to fetch user's channels: ${error.message}`);
    }
  }
}

module.exports = YouTubeService;