const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const { Op } = require('sequelize');
const Sentiment = require('sentiment'); // New
const sentiment = new Sentiment(); // New

// Validation schema
const reviewSchema = Joi.object({
  movieName: Joi.string().min(2).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  reviewText: Joi.string().min(10).required(),
});

router.get('/', async (req, res) => {
  try {
    const { rating, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    let where = {};
    if (rating && rating !== 'all') {
      where.rating = rating;
    }

    const reviews = await Review.findAll({
      where,
      include: [{ model: require('../models/User'), attributes: ['email'] }],
      order: [[sortBy, sortOrder]],
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  try {
    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
    });

    // Compute and add sentiment
    const analysis = sentiment.analyze(req.body.reviewText);
    const sentimentLabel = analysis.score > 0 ? 'positive' : analysis.score < 0 ? 'negative' : 'neutral';
    await review.update({ sentiment: sentimentLabel });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: require('../models/User'), attributes: ['email'] }],
    });
    res.json(fullReview);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;