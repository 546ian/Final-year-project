const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create PVP takeon
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { opponent_display_name, game_id } = req.body;
    
    const challegnerResult = await pool.query(
      'SELECT id FROM gamer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (challegnerResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only gamers can create takeons' });
    }

    const result = await pool.query(
      `INSERT INTO pvp_takeons (challenger_id, opponent_display_name, game_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [challegnerResult.rows[0].id, opponent_display_name, game_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create takeon' });
  }
});

// Get PVP takeons for gamer
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, g.name as game_name, 
        gp1.first_name as challenger_name,
        gp2.first_name as opponent_name
       FROM pvp_takeons t
       JOIN games g ON t.game_id = g.id
       JOIN gamer_profiles gp1 ON t.challenger_id = gp1.id
       LEFT JOIN gamer_profiles gp2 ON t.opponent_id = gp2.id
       WHERE t.challenger_id = (SELECT id FROM gamer_profiles WHERE user_id = $1)
          OR t.opponent_id = (SELECT id FROM gamer_profiles WHERE user_id = $1)
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch takeons' });
  }
});

// Accept takeon
router.put('/:takeonId/accept', authMiddleware, async (req, res) => {
  try {
    const gamerResult = await pool.query(
      'SELECT id FROM gamer_profiles WHERE user_id = $1',
      [req.user.id]
    );

    const result = await pool.query(
      `UPDATE pvp_takeons 
       SET opponent_id = $1, status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [gamerResult.rows[0].id, req.params.takeonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Takeon not found or already accepted' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept takeon' });
  }
});

// Complete takeon with results
router.put('/:takeonId/complete', authMiddleware, async (req, res) => {
  try {
    const { challenger_score, opponent_score } = req.body;
    
    const winner_id = challenger_score > opponent_score ? req.user.id : null;

    const result = await pool.query(
      `UPDATE pvp_takeons 
       SET status = 'completed', 
           challenger_score = $1,
           opponent_score = $2,
           winner_id = $3,
           completed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [challenger_score, opponent_score, winner_id, req.params.takeonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Takeon not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete takeon' });
  }
});

module.exports = router;
