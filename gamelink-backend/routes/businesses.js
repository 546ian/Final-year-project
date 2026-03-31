const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

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
    const { business_name, owner_name, phone_number, location, address, city, postal_code, mpesa_phone, mpesa_paybill } = req.body;
    
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
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $10
       RETURNING *`,
      [business_name, owner_name, phone_number, location, address, city, postal_code, mpesa_phone, mpesa_paybill, req.params.userId]
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
    const result = await pool.query(
      `SELECT t.*, gp.first_name, gp.last_name, u.email
       FROM team_members tm
       JOIN team_rosters t ON tm.team_roster_id = t.id
       JOIN gamer_profiles gp ON tm.gamer_id = gp.id
       JOIN users u ON gp.user_id = u.id
       WHERE t.business_id = (SELECT id FROM business_profiles WHERE user_id = $1)
       AND tm.contract_status = 'active'`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team roster' });
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
