const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const CALLBACK_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE_URL}/auth/google/callback`,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our database
      let existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        // Update user with YouTube access token if available
        if (accessToken) {
          existingUser.youtubeAccessToken = accessToken;
          existingUser.youtubeRefreshToken = refreshToken;
          await existingUser.save();
        }
        return done(null, existingUser);
      }
      
      // If user doesn't exist, create a new user
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: "google_oauth_user" // Placeholder since Google OAuth doesn't provide a password
      });
      
      // Save YouTube access tokens if available
      if (accessToken) {
        newUser.youtubeAccessToken = accessToken;
        newUser.youtubeRefreshToken = refreshToken;
      }
      
      const savedUser = await newUser.save();
      return done(null, savedUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// YouTube OAuth strategy (for channel connection) - uses the same credentials but with YouTube scopes
const YouTubeStrategy = require('passport-google-oauth20').Strategy;

passport.use('youtube', new YouTubeStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE_URL}/auth/youtube/callback`,
    scope: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/userinfo.email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // For YouTube OAuth, we just want to get the access token
      // We'll store this with the user in our database
      return done(null, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;