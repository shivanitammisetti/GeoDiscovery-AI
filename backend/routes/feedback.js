const express  = require('express');
const router   = express.Router();
const Feedback = require('../models/Feedback');
const { authMiddleware } = require('./users');

// POST /api/feedback  (protected — must be logged in)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { rating, comment, dataset = 'general' } = req.body;
    if (!rating || !comment)
      return res.status(400).json({ error: 'rating and comment are required' });

    const fb = await Feedback.create({
      userId:   req.user.id,
      userName: req.user.name || 'User',
      rating,
      comment,
      dataset
    });
    res.status(201).json({ message: 'Feedback submitted', feedback: fb });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit feedback', detail: err.message });
  }
});

// GET /api/feedback  (public — anyone can read reviews)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name role');
    res.json({ count: feedbacks.length, feedbacks });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch feedback', detail: err.message });
  }
});

module.exports = router;