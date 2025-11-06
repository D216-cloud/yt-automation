const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test MongoDB connection
router.get('/db-status', async (req, res) => {
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

module.exports = router;