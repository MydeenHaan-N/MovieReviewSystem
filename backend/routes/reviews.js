const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const { Op } = require('sequelize');
const vader = require('vader-sentiment');

// Validation schema for create
const createReviewSchema = Joi.object({
  movieName: Joi.string().min(2).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  reviewText: Joi.string().min(10).required(),
});

// Validation schema for update (movieName optional)
const updateReviewSchema = Joi.object({
  movieName: Joi.string().min(2).optional(),
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
  const { error } = createReviewSchema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  try {
    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
    });

    // Compute and add VADER sentiment (consistent)
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(req.body.reviewText);
    const compound = intensity.compound;
    let sentimentLabel = 'neutral';
    if (compound >= 0.05) {
      sentimentLabel = 'positive';
    } else if (compound <= -0.05) {
      sentimentLabel = 'negative';
    }
    await review.update({ sentiment: sentimentLabel });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: require('../models/User'), attributes: ['email'] }],
    });
    res.json(fullReview);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update review (PUT /api/reviews/:id)
router.put('/:id', auth, async (req, res) => {
  const { error } = updateReviewSchema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ msg: 'Review not found' });
    if (review.userId !== req.user.id) return res.status(403).json({ msg: 'Access denied' });

    await review.update(req.body);

    // Recompute sentiment if reviewText was provided/updated (consistent VADER)
    if (req.body.reviewText !== undefined) {
      const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(req.body.reviewText);
      const compound = intensity.compound;
      let sentimentLabel = 'neutral';
      if (compound >= 0.05) sentimentLabel = 'positive';
      else if (compound <= -0.05) sentimentLabel = 'negative';
      await review.update({ sentiment: sentimentLabel });
    }

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: require('../models/User'), attributes: ['email'] }],
    });
    res.json(fullReview);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete review (DELETE /api/reviews/:id)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ msg: 'Review not found' });
    if (review.userId !== req.user.id) return res.status(403).json({ msg: 'Access denied' });

    await review.destroy();
    res.json({ msg: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;