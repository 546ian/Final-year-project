const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '../uploads');
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const avatarUpload = multer({ storage: avatarStorage });

const router = express.Router();

// Get gamer profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gp.*, u.email, u.username 
       FROM gamer_profiles gp 
       JOIN users u ON gp.user_id = u.id 
       WHERE gp.user_id = $1`,
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
    const {
      first_name,
      last_name,
      phone_number,
      email,
      current_password,
      new_password,
      bio,
      avatar_url
    } = req.body;

    const userId = parseInt(req.params.userId, 10);

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'You may only update your own profile' });
    }

    if (!current_password) {
      return res.status(400).json({ error: 'Current password is required to save changes' });
    }

    const userResult = await pool.query('SELECT password_hash, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(current_password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (email && email !== user.email) {
      await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, userId]);
    }

    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
    }

    const result = await pool.query(
      `UPDATE gamer_profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           bio = COALESCE($4, bio),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING *`,
      [first_name, last_name, phone_number, bio, avatar_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer profile not found' });
    }

    const profileResult = await pool.query(
      `SELECT gp.*, u.email, u.username 
       FROM gamer_profiles gp 
       JOIN users u ON gp.user_id = u.id 
       WHERE gp.user_id = $1`,
      [userId]
    );

    res.json(profileResult.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

const uploadAvatarMiddleware = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return avatarUpload.single('avatar')(req, res, next);
  }
  return next();
};

// Update gamer avatar without requiring current password
router.put('/:userId/avatar', authMiddleware, uploadAvatarMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'You may only update your own avatar' });
    }

    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (Object.prototype.hasOwnProperty.call(req.body, 'avatar_url')) {
      avatarUrl = req.body.avatar_url;
    } else {
      return res.status(400).json({ error: 'No avatar data provided' });
    }

    const result = await pool.query(
      `UPDATE gamer_profiles
       SET avatar_url = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [avatarUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer profile not found' });
    }

    const profileResult = await pool.query(
      `SELECT gp.*, u.email, u.username
       FROM gamer_profiles gp
       JOIN users u ON gp.user_id = u.id
       WHERE gp.user_id = $1`,
      [userId]
    );

    res.json(profileResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Delete gamer account
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { current_password } = req.body;
    const userId = parseInt(req.params.userId, 10);

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'You may only delete your own account' });
    }

    if (!current_password) {
      return res.status(400).json({ error: 'Current password is required to delete account' });
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete account' });
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

// Get the gamer's active signed team membership
router.get('/:userId/team-membership', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tr.team_name,
              bp.business_name,
              tm.role,
              tm.contract_status,
              COUNT(tm2.id) AS team_size
       FROM gamer_profiles gp
       JOIN team_members tm ON tm.gamer_id = gp.id
       JOIN team_rosters tr ON tm.team_roster_id = tr.id
       JOIN business_profiles bp ON tr.business_id = bp.id
       LEFT JOIN team_members tm2 ON tm2.team_roster_id = tr.id
       WHERE gp.user_id = $1
         AND tm.contract_status = 'active'
       GROUP BY tm.id, tr.team_name, bp.business_name, tm.role, tm.contract_status, tm.joined_date
       ORDER BY tm.joined_date DESC
       LIMIT 1`,
      [req.params.userId]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Failed to fetch team membership:', error);
    res.status(500).json({ error: 'Failed to fetch team membership' });
  }
});

// Get tournaments hosted by this gamer
router.get('/:userId/hosted-tournaments', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, COALESCE(bp.business_name, u.username) as host_name
       FROM tournaments t
       LEFT JOIN business_profiles bp ON t.host_business_id = bp.id
       LEFT JOIN gamer_profiles gp ON t.host_gamer_id = gp.id
       LEFT JOIN users u ON gp.user_id = u.id
       WHERE t.host_gamer_id = (SELECT id FROM gamer_profiles WHERE user_id = $1)
       ORDER BY t.start_date DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hosted tournaments' });
  }
});

// Get comprehensive activity stats
router.get('/:userId/activity-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const gamerResult = await pool.query('SELECT id, created_at FROM gamer_profiles WHERE user_id = $1', [userId]);
    if (gamerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer not found' });
    }
    const gamer = gamerResult.rows[0];

    // Total takeons
    const totalTakeonsRes = await pool.query(
      `SELECT COUNT(*) as count FROM pvp_takeons 
       WHERE challenger_id = $1 OR opponent_id = $1`,
      [gamer.id]
    );

    // Greatest rival (most frequent opponent_display_name)
    const rivalRes = await pool.query(
      `SELECT opponent_display_name, COUNT(*) as count 
       FROM pvp_takeons 
       WHERE (challenger_id = $1 OR opponent_id = $1) AND opponent_display_name IS NOT NULL
       GROUP BY opponent_display_name 
       ORDER BY count DESC 
       LIMIT 1`,
      [gamer.id]
    );

    // Account status (signed or free)
    const signedRes = await pool.query(
      `SELECT COUNT(*) > 0 as is_signed 
       FROM team_members tm
       JOIN team_rosters tr ON tm.team_roster_id = tr.id
       WHERE tm.gamer_id = $1 AND tm.contract_status = 'active'`,
      [gamer.id]
    );

    // Tournament stats (simplified counts)
    const tourneyRes = await pool.query(
      `SELECT 
        COUNT(CASE WHEN tr.status = 'won' THEN 1 END) as tournaments_won,
        COUNT(CASE WHEN tr.status = 'eliminated' THEN 1 END) as tournaments_lost,
        COUNT(CASE WHEN t.host_gamer_id = $1 THEN 1 END) as tournaments_hosted
       FROM tournament_registrations tr
       JOIN tournaments t ON tr.tournament_id = t.id
       WHERE tr.gamer_id = $1`,
      [gamer.id]
    );

    // Takeons won/lost (completed)
    const takeonRes = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'completed' AND winner_id IS NOT NULL AND (winner_id = $2 OR challenger_score > opponent_score) THEN 1 END) as takeons_won,
        COUNT(CASE WHEN status = 'completed' AND (winner_id != $2 OR challenger_score < opponent_score) THEN 1 END) as takeons_lost
       FROM pvp_takeons 
       WHERE (challenger_id = $1 OR opponent_id = $1) AND status = 'completed'`,
      [gamer.id, gamer.id]
    );

    // Teams signed into (active contracts)
    const teamsRes = await pool.query(
      `SELECT COUNT(DISTINCT tr.id)::int as teams_count 
       FROM team_members tm
       JOIN team_rosters tr ON tm.team_roster_id = tr.id
       WHERE tm.gamer_id = $1 AND tm.contract_status = 'active'`,
      [gamer.id]
    );

    const stats = {
      accountActiveDuration: gamer.created_at ? new Date(gamer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
      totalTakeons: parseInt(totalTakeonsRes.rows[0].count),
      greatestRival: rivalRes.rows[0]?.opponent_display_name || 'None',
      takeonsWon: parseInt(takeonRes.rows[0].takeons_won || 0),
      takeonsLost: parseInt(takeonRes.rows[0].takeons_lost || 0),
      tournamentsWon: parseInt(tourneyRes.rows[0].tournaments_won || 0),
      tournamentsLost: parseInt(tourneyRes.rows[0].tournaments_lost || 0),
      tournamentsHosted: parseInt(tourneyRes.rows[0].tournaments_hosted || 0),
      accountStatusType: signedRes.rows[0].is_signed ? 'Signed agent' : 'Free agent',
      esportsTeamsSigned: teamsRes.rows[0].teams_count || 0,
      // Durations (approximate)
      durationSignedGamer: 'N/A', // Would need joined_date logic
      durationFreeAgent: 'N/A'    // Would need detailed tracking
    };

    res.json(stats);
  } catch (error) {
    console.error('Activity stats error:', error);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

module.exports = router;

