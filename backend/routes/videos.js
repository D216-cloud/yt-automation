const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// GET all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('userId', 'name email');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET video by ID
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('userId', 'name email');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new video
router.post('/', async (req, res) => {
  const { title, url, userId } = req.body;
  
  try {
    const video = new Video({
      title,
      url,
      userId
    });
    
    const newVideo = await video.save();
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update video
router.put('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const { title, url } = req.body;
    video.title = title || video.title;
    video.url = url || video.url;
    
    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE video
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    await video.remove();
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;