const express = require('express');
const router = express.Router();
const YouTubeService = require('../services/youtubeService');
const YouTubeChannel = require('../models/YouTubeChannel');
const passport = require('passport');

// Initialize YouTube service
const youtubeService = new YouTubeService();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Connect YouTube channel via OAuth
router.get('/connect/oauth', isAuthenticated, (req, res) => {
  // Redirect to YouTube OAuth
  res.redirect('/auth/youtube');
});

// Connect YouTube channel via channel ID or URL (public data only)
router.post('/connect', isAuthenticated, async (req, res) => {
  try {
    const { channelId } = req.body;
    const userId = req.user._id;

    // Get channel details from YouTube API
    let channelDetails;
    
    // Try different methods to get channel details
    if (channelId.startsWith('UC')) {
      // It's likely a channel ID
      channelDetails = await youtubeService.getChannelDetails(channelId);
    } else if (channelId.startsWith('@')) {
      // It's a custom URL
      channelDetails = await youtubeService.getChannelDetailsByCustomUrl(channelId);
    } else {
      // Try as username
      try {
        channelDetails = await youtubeService.getChannelDetailsByUsername(channelId);
      } catch (error) {
        // If that fails, try as custom URL
        channelDetails = await youtubeService.getChannelDetailsByCustomUrl(channelId);
      }
    }

    // Prepare channel data for saving
    const channelData = {
      userId: userId,
      channelId: channelDetails.id,
      title: channelDetails.snippet.title,
      description: channelDetails.snippet.description,
      customUrl: channelDetails.snippet.customUrl || '',
      publishedAt: new Date(channelDetails.snippet.publishedAt),
      thumbnailUrl: channelDetails.snippet.thumbnails?.default?.url || '',
      subscriberCount: channelDetails.statistics?.subscriberCount || 0,
      videoCount: channelDetails.statistics?.videoCount || 0,
      viewCount: channelDetails.statistics?.viewCount || 0,
      uploadsPlaylistId: channelDetails.contentDetails?.relatedPlaylists?.uploads || ''
    };

    // Check if channel already exists in database
    let existingChannel = await YouTubeChannel.findOne({ channelId: channelDetails.id });
    
    if (existingChannel) {
      // Update existing channel
      existingChannel = await YouTubeChannel.findByIdAndUpdate(
        existingChannel._id,
        channelData,
        { new: true }
      );
      return res.json({
        message: 'YouTube channel updated successfully',
        channel: existingChannel
      });
    } else {
      // Create new channel
      const newChannel = new YouTubeChannel(channelData);
      await newChannel.save();
      return res.status(201).json({
        message: 'YouTube channel connected successfully',
        channel: newChannel
      });
    }
  } catch (error) {
    console.error('Error connecting YouTube channel:', error);
    res.status(500).json({ 
      message: 'Failed to connect YouTube channel',
      error: error.message 
    });
  }
});

// Get user's connected YouTube channels
router.get('/channels', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const channels = await YouTubeChannel.find({ userId: userId });
    res.json(channels);
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    res.status(500).json({ 
      message: 'Failed to fetch YouTube channels',
      error: error.message 
    });
  }
});

// Get specific YouTube channel details
router.get('/channels/:channelId', isAuthenticated, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    // First, try to find channel in database
    let channel = await YouTubeChannel.findOne({ 
      channelId: channelId,
      userId: userId 
    });

    // If not found in database, try to fetch from YouTube API
    if (!channel) {
      try {
        const channelDetails = await youtubeService.getChannelDetails(channelId);
        
        // Prepare channel data
        const channelData = {
          userId: userId,
          channelId: channelDetails.id,
          title: channelDetails.snippet.title,
          description: channelDetails.snippet.description,
          customUrl: channelDetails.snippet.customUrl || '',
          publishedAt: new Date(channelDetails.snippet.publishedAt),
          thumbnailUrl: channelDetails.snippet.thumbnails?.default?.url || '',
          subscriberCount: channelDetails.statistics?.subscriberCount || 0,
          videoCount: channelDetails.statistics?.videoCount || 0,
          viewCount: channelDetails.statistics?.viewCount || 0,
          uploadsPlaylistId: channelDetails.contentDetails?.relatedPlaylists?.uploads || ''
        };

        // Create new channel in database
        channel = new YouTubeChannel(channelData);
        await channel.save();
      } catch (apiError) {
        console.error('Error fetching channel from YouTube API:', apiError);
        return res.status(404).json({ message: 'Channel not found' });
      }
    }

    // Get fresh data from YouTube API
    try {
      const channelDetails = await youtubeService.getChannelDetails(channelId);
      
      // Update database with fresh data
      const updatedChannel = await YouTubeChannel.findByIdAndUpdate(
        channel._id,
        {
          title: channelDetails.snippet.title,
          description: channelDetails.snippet.description,
          thumbnailUrl: channelDetails.snippet.thumbnails?.default?.url || '',
          subscriberCount: channelDetails.statistics?.subscriberCount || 0,
          videoCount: channelDetails.statistics?.videoCount || 0,
          viewCount: channelDetails.statistics?.viewCount || 0,
          updatedAt: Date.now()
        },
        { new: true }
      );

      res.json(updatedChannel);
    } catch (apiError) {
      // If API call fails, return stored data
      console.error('Error fetching fresh data from YouTube API:', apiError);
      res.json(channel);
    }
  } catch (error) {
    console.error('Error fetching YouTube channel:', error);
    res.status(500).json({ 
      message: 'Failed to fetch YouTube channel',
      error: error.message 
    });
  }
});

// Search for YouTube channels
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const channels = await youtubeService.searchChannels(query, parseInt(maxResults));
    res.json(channels);
  } catch (error) {
    console.error('Error searching YouTube channels:', error);
    res.status(500).json({ 
      message: 'Failed to search YouTube channels',
      error: error.message 
    });
  }
});

// Get videos for a specific channel
router.get('/channels/:channelId/videos', isAuthenticated, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { maxResults = 50 } = req.query;
    
    const videos = await youtubeService.getChannelVideos(channelId, parseInt(maxResults));
    res.json(videos);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({ 
      message: 'Failed to fetch YouTube videos',
      error: error.message 
    });
  }
});

// Disconnect YouTube channel
router.delete('/channels/:channelId', isAuthenticated, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const result = await YouTubeChannel.findOneAndDelete({ 
      channelId: channelId,
      userId: userId 
    });

    if (!result) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ message: 'YouTube channel disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting YouTube channel:', error);
    res.status(500).json({ 
      message: 'Failed to disconnect YouTube channel',
      error: error.message 
    });
  }
});

module.exports = router;