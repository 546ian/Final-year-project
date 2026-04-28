const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const gamerRoutes = require('./routes/gamers');
const businessRoutes = require('./routes/businesses');
const tournamentRoutes = require('./routes/tournaments');
const activityRoutes = require('./routes/activities');
const pvpRoutes = require('./routes/pvp');
const postRoutes = require('./routes/posts');
const paymentRoutes = require('./routes/payments');
const gameRoutes = require('./routes/games'); 

dotenv.config();

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gamers', gamerRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/pvp', pvpRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/games', gameRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
// Test DB connection on startup
const pool = require('./config/database');
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ DB Connection failed:', err.stack);
  } else {
    console.log('✅ DB Connected successfully');
    console.log('🔍 Checking users table...');
    client.query('SELECT COUNT(*) FROM users', (err, res) => {
      if (err) {
        console.error('⚠️  Users table query failed:', err);
      } else {
        console.log(`📈 Users table: ${res.rows[0].count} users exist`);
      }
      release();
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
