const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create activity
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { game_id, activity_type, player_names, notes } = req.body;
    
    const businessResult = await pool.query(
      'SELECT id FROM business_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (businessResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only businesses can create activities' });
    }

    const result = await pool.query(
      `INSERT INTO activities (business_id, game_id, activity_type, player_names, start_time, notes)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
       RETURNING *`,
      [businessResult.rows[0].id, game_id, activity_type, player_names, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Get activities for business
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, g.name as game_name
       FROM activities a
       LEFT JOIN games g ON a.game_id = g.id
       WHERE a.business_id = (SELECT id FROM business_profiles WHERE user_id = $1)
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Update activity status
router.put('/:activityId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const result = await pool.query(
      `UPDATE activities 
       SET status = $1, end_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, req.params.activityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

module.exports = router;
