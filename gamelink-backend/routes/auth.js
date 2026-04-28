const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const config = require('../config/constants');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      account_type,
      first_name,
      last_name,
      phone_number,
      business_name,
      description,
      owner_name,
      location,
      address
    } = req.body;

    if (!['gamer', 'business'].includes(account_type)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt_rounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, account_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, account_type]
    );

    const userId = userResult.rows[0].id;

    // Create profile based on account type
    if (account_type === 'gamer') {
      await pool.query(
        'INSERT INTO gamer_profiles (user_id, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4)',
        [userId, first_name || null, last_name || null, phone_number || null]
      );
    } else if (account_type === 'business') {
      await pool.query(
        'INSERT INTO business_profiles (user_id, business_name, description, owner_name, phone_number, location, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, business_name || username, description || null, owner_name || null, phone_number || null, location || null, address || null]
      );
    }

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

let avatarUrl = null;
    console.log(`🎮 FETCHING AVATAR for ${user.account_type}`);
    if (user.account_type === 'gamer') {
      const profileResult = await pool.query(
        'SELECT avatar_url FROM gamer_profiles WHERE user_id = $1',
        [user.id]
      );
      console.log(`👤 GAMER PROFILE: found ${profileResult.rows.length}, avatar: ${profileResult.rows[0]?.avatar_url || 'none'}`);
      if (profileResult.rows.length > 0) {
        avatarUrl = profileResult.rows[0].avatar_url;
      }
    } else {
      console.log('🏢 BUSINESS: no avatar fetch');
    }

const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, account_type: user.account_type },
      config.jwt_secret,
      { expiresIn: config.jwt_expiry }
    );

    console.log(`🎉 LOGIN SUCCESS: ${user.username} (${user.account_type}) token issued`);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        account_type: user.account_type,
        avatarUrl
      }
    });
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

module.exports = router;
