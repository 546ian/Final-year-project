const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, bp.business_name
       FROM tournaments t
       JOIN business_profiles bp ON t.host_business_id = bp.id
       WHERE t.status != 'completed'
       ORDER BY t.start_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Create tournament
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tournament_name, description, game_id, tournament_format, max_players, entry_fee, start_date } = req.body;
    
    const businessResult = await pool.query(
      'SELECT id FROM business_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (businessResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only businesses can host tournaments' });
    }

    const result = await pool.query(
      `INSERT INTO tournaments (host_business_id, tournament_name, description, game_id, tournament_format, max_players, entry_fee, start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [businessResult.rows[0].id, tournament_name, description, game_id, tournament_format, max_players, entry_fee, start_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Register for tournament
router.post('/:tournamentId/register', authMiddleware, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const gamerResult = await pool.query(
      'SELECT id FROM gamer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (gamerResult.rows.length === 0) {
      return res.status(403).json({ error: 'Only gamers can register' });
    }

    const result = await pool.query(
      `INSERT INTO tournament_registrations (tournament_id, gamer_id)
       VALUES ($1, $2)
       RETURNING *`,
      [tournamentId, gamerResult.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register for tournament' });
  }
});

// Get tournament details
router.get('/:tournamentId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, bp.business_name, g.name as game_name
       FROM tournaments t
       JOIN business_profiles bp ON t.host_business_id = bp.id
       LEFT JOIN games g ON t.game_id = g.id
       WHERE t.id = $1`,
      [req.params.tournamentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Get tournament participants
router.get('/:tournamentId/participants', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gp.*, u.email
       FROM tournament_registrations tr
       JOIN gamer_profiles gp ON tr.gamer_id = gp.id
       JOIN users u ON gp.user_id = u.id
       WHERE tr.tournament_id = $1`,
      [req.params.tournamentId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Start tournament (generate matches)
router.post('/:tournamentId/start', authMiddleware, async (req, res) => {
  try {
    // Update tournament status
    await pool.query(
      'UPDATE tournaments SET status = $1 WHERE id = $2',
      ['active', req.params.tournamentId]
    );

    res.json({ message: 'Tournament started' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start tournament' });
  }
});

module.exports = router;
