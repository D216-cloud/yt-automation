const express = require('express');
const router = express.Router();
const passport = require('passport');
const YouTubeChannel = require('../models/YouTubeChannel');
const YouTubeService = require('../services/youtubeService');

// Initialize YouTube service
const youtubeService = new YouTubeService();

// Get frontend URL from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/auth` }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(`${FRONTEND_URL}/auth/callback`);
  }
);

// YouTube OAuth route for channel connection
router.get('/youtube', passport.authenticate('youtube'));

// YouTube OAuth callback route
router.get('/youtube/callback', 
  passport.authenticate('youtube', { failureRedirect: `${FRONTEND_URL}/dashboard` }),
  async (req, res) => {
    try {
      // Store YouTube access token with user
      if (req.user && req.user.accessToken) {
        // Get the current user from the session
        const currentUser = req.session.passport.user;
        
        if (currentUser && currentUser._id) {
          // Update user with YouTube access tokens
          const User = require('../models/User');
          await User.findByIdAndUpdate(currentUser._id, {
            youtubeAccessToken: req.user.accessToken,
            youtubeRefreshToken: req.user.refreshToken || ''
          });
          
          // Get user's YouTube channels using the authenticated client
          const authClient = youtubeService.getAuthenticatedClient(req.user.accessToken);
          const response = await authClient.channels.list({
            mine: true,
            part: ['snippet', 'statistics', 'contentDetails']
          });
          
          const channels = response.data.items || [];
          
          // Save the first channel to the database (in a real app, you might want to let the user choose)
          if (channels && channels.length > 0) {
            const channel = channels[0];
            
            // Prepare channel data for saving
            const channelData = {
              userId: currentUser._id, // Get user ID from session
              channelId: channel.id,
              title: channel.snippet.title,
              description: channel.snippet.description,
              customUrl: channel.snippet.customUrl || '',
              publishedAt: new Date(channel.snippet.publishedAt),
              thumbnailUrl: channel.snippet.thumbnails?.default?.url || '',
              subscriberCount: channel.statistics?.subscriberCount || 0,
              videoCount: channel.statistics?.videoCount || 0,
              viewCount: channel.statistics?.viewCount || 0,
              uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || '',
              accessToken: req.user.accessToken,
              refreshToken: req.user.refreshToken || ''
            };

            // Check if channel already exists in database
            let existingChannel = await YouTubeChannel.findOne({ channelId: channel.id });
            
            if (existingChannel) {
              // Update existing channel
              await YouTubeChannel.findByIdAndUpdate(
                existingChannel._id,
                channelData,
                { new: true }
              );
            } else {
              // Create new channel
              const newChannel = new YouTubeChannel(channelData);
              await newChannel.save();
            }
          }
        }
        
        // Redirect back to the dashboard
        res.redirect(`${FRONTEND_URL}/youtube/callback`);
      } else {
        res.redirect(`${FRONTEND_URL}/dashboard`);
      }
    } catch (error) {
      console.error('Error handling YouTube OAuth callback:', error);
      res.redirect(`${FRONTEND_URL}/dashboard`);
    }
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(FRONTEND_URL);
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;