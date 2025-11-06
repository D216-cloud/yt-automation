const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const passport = require('passport');
const session = require('express-session');
require('./config/passport');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Use FRONTEND_URL to allow CORS from the deployed frontend origin.
// In production set FRONTEND_URL in your hosting environment.
const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MERN Stack Backend Server is running!' });
});

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/auth', require('./routes/auth'));
app.use('/test', require('./routes/test'));

// Test route
app.get('/test-db', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      res.json({
        status: 'Connected',
        message: 'MongoDB is successfully connected',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port
      });
    } else {
      res.status(503).json({
        status: 'Disconnected',
        message: 'MongoDB is not connected'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// Default route for authentication check
app.get('/auth/user', (req, res) => {
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

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});