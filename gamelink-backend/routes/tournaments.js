const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, COALESCE(bp.business_name, u.username) as host_name
       FROM tournaments t
       LEFT JOIN business_profiles bp ON t.host_business_id = bp.id
       LEFT JOIN gamer_profiles gp ON t.host_gamer_id = gp.id
       LEFT JOIN users u ON gp.user_id = u.id
       WHERE t.status != 'completed'
       ORDER BY t.start_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Create tournament (business or gamer)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tournament_name, description, game_id, tournament_format, max_players, entry_fee, start_date, host_type = 'business' } = req.body;
    
    let hostId;
    if (host_type === 'gamer') {
      const gamerResult = await pool.query('SELECT id FROM gamer_profiles WHERE user_id = $1', [req.user.id]);
      if (gamerResult.rows.length === 0) return res.status(403).json({ error: 'No gamer profile' });
      hostId = gamerResult.rows[0].id;
    } else {
      const businessResult = await pool.query('SELECT id FROM business_profiles WHERE user_id = $1', [req.user.id]);
      if (businessResult.rows.length === 0) return res.status(403).json({ error: 'Only businesses can host tournaments' });
      hostId = businessResult.rows[0].id;
    }

    // Store host_type for display
    const result = await pool.query(
      `INSERT INTO tournaments (host_gamer_id, host_business_id, tournament_name, description, game_id, tournament_format, max_players, entry_fee, start_date, host_type)
       VALUES (CASE WHEN $9 = 'gamer' THEN $1::integer ELSE NULL END, CASE WHEN $9 != 'gamer' THEN $1::integer ELSE NULL END, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [hostId, tournament_name, description, game_id, tournament_format, max_players, entry_fee, start_date, host_type]
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
      `SELECT t.*, 
       COALESCE(bp.business_name, gp.username) as host_name,
       g.name as game_name
       FROM tournaments t
       LEFT JOIN business_profiles bp ON t.host_business_id = bp.id
       LEFT JOIN gamer_profiles gp ON t.host_gamer_id = gp.id
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

// Start tournament (generate matches and bracket)
router.post('/:tournamentId/start', authMiddleware, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Check if host
    const tournament = await pool.query(
      'SELECT host_business_id FROM tournaments WHERE id = $1',
      [tournamentId]
    );
    if (tournament.rows[0].host_business_id !== (await pool.query('SELECT id FROM business_profiles WHERE user_id = $1', [req.user.id])).rows[0].id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update status
    await pool.query('UPDATE tournaments SET status = $1 WHERE id = $2', ['active', tournamentId]);

    // Generate bracket
    await generateBracket(tournamentId);

    res.json({ message: 'Tournament started and bracket generated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start tournament' });
  }
});

// Get tournament bracket
router.get('/:tournamentId/bracket', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const result = await pool.query(
      `SELECT 
        tm.*,
        p1.username as player1_name,
        p2.username as player2_name,
        w1.username as winner_name
       FROM tournament_matches tm
       LEFT JOIN gamer_profiles gp1 ON tm.player1_id = gp1.id
       LEFT JOIN users p1 ON gp1.user_id = p1.id
       LEFT JOIN gamer_profiles gp2 ON tm.player2_id = gp2.id  
       LEFT JOIN users p2 ON gp2.user_id = p2.id
       LEFT JOIN gamer_profiles gw ON tm.winner_id = gw.id
       LEFT JOIN users w1 ON gw.user_id = w1.id
       WHERE tm.tournament_id = $1
       ORDER BY tm.round_number, tm.match_number`,
      [tournamentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bracket' });
  }
});

// Helper function to generate single-elim bracket
async function generateBracket(tournamentId) {
  // Clear existing matches
  await pool.query('DELETE FROM tournament_matches WHERE tournament_id = $1', [tournamentId]);

  // Get participants
  const participants = await pool.query(
    `SELECT gp.id, u.username
     FROM tournament_registrations tr
     JOIN gamer_profiles gp ON tr.gamer_id = gp.id
     JOIN users u ON gp.user_id = u.id
     WHERE tr.tournament_id = $1`,
    [tournamentId]
  );

  const numPlayers = participants.rows.length;
  if (numPlayers < 2) return;

  // Pad to power of 2 with byes
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
  const players = participants.rows.concat(
    Array(bracketSize - numPlayers).fill({ id: null, username: 'BYE' })
  );

  // Shuffle for random seeding
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }

  let round = 1;
  let numMatches = bracketSize / 2;
  let playerIndex = 0;

  while (numMatches > 0) {
    for (let matchNum = 1; matchNum <= numMatches; matchNum++) {
      await pool.query(
        `INSERT INTO tournament_matches (tournament_id, round_number, match_number, player1_id, player2_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tournamentId, round, matchNum, players[playerIndex].id, players[playerIndex + 1].id, 'pending']
      );
      playerIndex += 2;
    }
    numMatches /= 2;
    round++;
  }
}


module.exports = router;
