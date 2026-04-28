const express = require('express');
const pool = require('../config/database');

const router = express.Router();
// Get all games
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, image_url, genre, platform, created_at
       FROM games
       ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});
// Get game by ID
router.get('/:gameId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, image_url, genre, platform, created_at
       FROM games
       WHERE id = $1`,
      [req.params.gameId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});



module.exports = router;