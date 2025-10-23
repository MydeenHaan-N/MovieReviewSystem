const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_BASE = 'http://www.omdbapi.com';
const API_KEY = process.env.OMDB_API_KEY;

// Search movies by name
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json({ Search: [], totalResults: '0', Response: 'False' });
  }

  try {
    const response = await axios.get(`${API_BASE}/?s=${encodeURIComponent(q)}&apikey=${API_KEY}`);
    res.json(response.data);
  } catch (err) {
    console.error('OMDB Search error:', err.message);
    res.status(500).json({ msg: 'Movie search failed' });
  }
});

// Get full movie details by IMDB ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/?i=${req.params.id}&apikey=${API_KEY}`);
    if (response.data.Response === 'False') {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json(response.data);
  } catch (err) {
    console.error('OMDB Fetch error:', err.message);
    res.status(500).json({ msg: 'Movie fetch failed' });
  }
});

module.exports = router;