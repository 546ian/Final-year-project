const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;
