const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

async function getOrCreateTeamRoster(businessId) {
  const rosterResult = await pool.query(
    'SELECT id FROM team_rosters WHERE business_id = $1 LIMIT 1',
    [businessId]
  );
  if (rosterResult.rows.length > 0) {
    return rosterResult.rows[0].id;
  }
  const insertResult = await pool.query(
    'INSERT INTO team_rosters (business_id, team_name) VALUES ($1, $2) RETURNING id',
    [businessId, 'Main Team']
  );
  return insertResult.rows[0].id;
}

// Get business profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business profile' });
  }
});

// Update business profile
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    const { business_name, owner_name, phone_number, location, address, city, postal_code, mpesa_phone, mpesa_paybill, mpesa_till } = req.body;
    
    const result = await pool.query(
      `UPDATE business_profiles 
       SET business_name = COALESCE($1, business_name),
           owner_name = COALESCE($2, owner_name),
           phone_number = COALESCE($3, phone_number),
           location = COALESCE($4, location),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           postal_code = COALESCE($7, postal_code),
           mpesa_phone = COALESCE($8, mpesa_phone),
           mpesa_paybill = COALESCE($9, mpesa_paybill),
           mpesa_till = COALESCE($10, mpesa_till),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $11
       RETURNING *`,
      [business_name, owner_name, phone_number, location, address, city, postal_code, mpesa_phone, mpesa_paybill, mpesa_till, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get business team roster
router.get('/:userId/team-roster', authMiddleware, async (req, res) => {
  try {
    const view = req.query.view || 'all';
    let statusCondition = '';
    if (view === 'team') {
      statusCondition = "AND tm.contract_status = 'active'";
    } else if (view === 'monitor') {
      statusCondition = "AND tm.contract_status != 'active'";
    }
    const result = await pool.query(
      `SELECT tm.id AS team_member_id,
              t.id AS team_roster_id,
              gp.id AS gamer_profile_id,
              gp.first_name,
              gp.last_name,
              u.id AS user_id,
              u.username,
              u.email,
              tm.role,
              tm.contract_status,
              t.team_name
       FROM team_members tm
       JOIN team_rosters t ON tm.team_roster_id = t.id
       JOIN gamer_profiles gp ON tm.gamer_id = gp.id
       JOIN users u ON gp.user_id = u.id
       WHERE t.business_id = (SELECT id FROM business_profiles WHERE user_id = $1)
       ${statusCondition}`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team roster' });
  }
});

// Add gamer to team roster / monitoring list
router.post('/:userId/team-roster/members', authMiddleware, async (req, res) => {
  try {
    const { gamer_profile_id, action, role } = req.body;
    if (!gamer_profile_id || !['monitor', 'team'].includes(action)) {
      return res.status(400).json({ error: 'Missing gamer_profile_id or invalid action' });
    }

    const businessResult = await pool.query(
      'SELECT id FROM business_profiles WHERE user_id = $1',
      [req.params.userId]
    );
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    const businessId = businessResult.rows[0].id;

    const gamerResult = await pool.query(
      'SELECT id FROM gamer_profiles WHERE id = $1',
      [gamer_profile_id]
    );
    if (gamerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gamer profile not found' });
    }

    const teamRosterId = await getOrCreateTeamRoster(businessId);
    const contractStatus = action === 'team' ? 'active' : 'monitored';
    const teamRole = role || (action === 'team' ? 'Team player' : 'Monitored player');

    const existingMemberResult = await pool.query(
      `SELECT tm.id
       FROM team_members tm
       JOIN team_rosters tr ON tm.team_roster_id = tr.id
       WHERE tm.gamer_id = $1 AND tr.business_id = $2`,
      [gamer_profile_id, businessId]
    );

    if (existingMemberResult.rows.length > 0) {
      const updateResult = await pool.query(
        `UPDATE team_members
         SET contract_status = $1,
             role = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id`,
        [contractStatus, teamRole, existingMemberResult.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO team_members (team_roster_id, gamer_id, role, joined_date, contract_status)
         VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
        [teamRosterId, gamer_profile_id, teamRole, contractStatus]
      );
    }

    const result = await pool.query(
      `SELECT tm.id AS team_member_id,
              tr.id AS team_roster_id,
              gp.id AS gamer_profile_id,
              gp.first_name,
              gp.last_name,
              u.id AS user_id,
              u.username,
              u.email,
              tm.role,
              tm.contract_status,
              tr.team_name
       FROM team_members tm
       JOIN team_rosters tr ON tm.team_roster_id = tr.id
       JOIN gamer_profiles gp ON tm.gamer_id = gp.id
       JOIN users u ON gp.user_id = u.id
       WHERE tm.gamer_id = $1 AND tr.business_id = $2`,
      [gamer_profile_id, businessId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add player to roster' });
  }
});

// Remove gamer from business roster
router.delete('/:userId/team-roster/members', authMiddleware, async (req, res) => {
  try {
    const { gamer_profile_id } = req.body;
    if (!gamer_profile_id) {
      return res.status(400).json({ error: 'Missing gamer_profile_id' });
    }

    const businessResult = await pool.query(
      'SELECT id FROM business_profiles WHERE user_id = $1',
      [req.params.userId]
    );
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    const businessId = businessResult.rows[0].id;

    const deleteResult = await pool.query(
      `DELETE FROM team_members tm
       USING team_rosters tr
       WHERE tm.team_roster_id = tr.id
         AND tr.business_id = $1
         AND tm.gamer_id = $2
       RETURNING tm.id`,
      [businessId, gamer_profile_id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Search gamers for business roster and monitoring
router.get('/:userId/player-search', authMiddleware, async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const gamerId = req.query.gamerId;
    const view = req.query.view || 'all';
    const businessResult = await pool.query(
      'SELECT id FROM business_profiles WHERE user_id = $1',
      [req.params.userId]
    );
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    const businessId = businessResult.rows[0].id;

    let queryText = `
            SELECT gp.id AS gamer_profile_id,
              gp.first_name,
              gp.last_name,
              u.id AS user_id,
              u.username,
              u.email,
             gp.avatar_url,
             tm.id AS team_member_id,
             tm.role,
             tm.contract_status,
             tr.team_name,
             CASE WHEN tm.contract_status = 'active' THEN TRUE ELSE FALSE END AS is_team_player,
             CASE WHEN tm.contract_status <> 'active' AND tm.contract_status IS NOT NULL THEN TRUE ELSE FALSE END AS is_monitored
      FROM gamer_profiles gp
      JOIN users u ON gp.user_id = u.id
      LEFT JOIN team_members tm ON tm.gamer_id = gp.id AND tm.team_roster_id IN (
        SELECT id FROM team_rosters WHERE business_id = $1
      )
      LEFT JOIN team_rosters tr ON tm.team_roster_id = tr.id
    `;

    if (view === 'team') {
      queryText += ' WHERE tm.contract_status = \'active\'';
    } else if (view === 'monitor') {
      queryText += ' WHERE tm.contract_status IS NOT NULL AND tm.contract_status != \'active\'';
    } else {
      queryText += ' WHERE 1=1';
    }

    const params = [businessId];
    const shouldUseGamerId = gamerId !== undefined && gamerId !== null && gamerId !== '' && gamerId !== 'null';
    if (shouldUseGamerId) {
      queryText += ' AND gp.id = $2';
      params.push(gamerId);
    } else {
      queryText += ' AND (gp.first_name ILIKE $2 OR gp.last_name ILIKE $2 OR u.username ILIKE $2 OR u.email ILIKE $2)';
      params.push(`%${searchQuery}%`);
    }
    queryText += ' ORDER BY gp.first_name, gp.last_name LIMIT 20';

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search gamers' });
  }
});

// Get gaming devices
router.get('/:userId/devices', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM gaming_devices 
       WHERE business_id = (SELECT id FROM business_profiles WHERE user_id = $1)`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Add gaming device
router.post('/:userId/devices', authMiddleware, async (req, res) => {
  try {
    const { device_name, device_type, serial_number, remote_enabled } = req.body;
    
    const businessResult = await pool.query(
      'SELECT id FROM business_profiles WHERE user_id = $1',
      [req.params.userId]
    );
    
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const result = await pool.query(
      `INSERT INTO gaming_devices (business_id, device_name, device_type, serial_number, remote_enabled)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [businessResult.rows[0].id, device_name, device_type, serial_number, remote_enabled]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add device' });
  }
});

module.exports = router;
