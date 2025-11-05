const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const auth = require('../middleware/auth');
const User = require('../models/User');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', async (req, res) => {
  console.log('Register body:', req.body); // Debug
  const { error } = registerSchema.validate(req.body);
  if (error) {
    console.log('Register validation error:', error.details[0].message); // Debug
    return res.status(400).json({ msg: error.details[0].message });
  }

  try {
    const { email, password } = req.body;
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ email, password: hashedPassword });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login body:', req.body); // Debug
  const { error } = loginSchema.validate(req.body);
  if (error) {
    console.log('Login validation error:', error.details[0].message); // Debug
    return res.status(400).json({ msg: error.details[0].message });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/auth/me - Fetch current user profile (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email'], // Only return necessary fields
    });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;