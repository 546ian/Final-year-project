const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get gamer profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gamer_profiles WHERE user_id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gamer profile' });
  }
});

// Update gamer profile
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, phone_number, location, bio, avatar_url } = req.body;
    
    const result = await pool.query(
      `UPDATE gamer_profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           location = COALESCE($4, location),
           bio = COALESCE($5, bio),
           avatar_url = COALESCE($6, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING *`,
      [first_name, last_name, phone_number, location, bio, avatar_url, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get gamer statistics
router.get('/:userId/stats', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        total_wins, 
        total_losses, 
        rating,
        (total_wins + total_losses) as total_matches
       FROM gamer_profiles WHERE user_id = $1`,
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get gamer progress over time
router.get('/:userId/progress', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT date, wins, losses, rating_change 
       FROM gamer_progress 
       WHERE gamer_id = (SELECT id FROM gamer_profiles WHERE user_id = $1)
       ORDER BY date DESC
       LIMIT 365`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get gamer tournament registrations
router.get('/:userId/tournaments', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, tr.status 
       FROM tournaments t
       JOIN tournament_registrations tr ON t.id = tr.tournament_id
       WHERE tr.gamer_id = (SELECT id FROM gamer_profiles WHERE user_id = $1)
       ORDER BY t.start_date DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

module.exports = router;
