const { Pool } = require('pg');
const pool = require('./config/database');

async function seedGames() {
  const games = [
    ['Valorant', 'Tactical 5v5 shooter', 'FPS', 'PC'],
    ['CS:GO', 'Counter-Strike Global Offensive', 'FPS', 'Multi'],
    ['League of Legends', 'MOBA game', 'MOBA', 'PC'],
    ['Dota 2', 'Defense of the Ancients 2', 'MOBA', 'PC'],
    ['Fortnite', 'Battle Royale', 'Battle Royale', 'Multi']
  ];

  for (const game of games) {
    try {
      await pool.query(
        `INSERT INTO games (name, description, genre, platform) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT DO NOTHING`,
        game
      );
      console.log(`✅ Seeded ${game[0]}`);
    } catch (err) {
      console.error(`❌ Failed to seed ${game[0]}:`, err);
    }
  }
  await pool.end();
  console.log('🎮 Games seeding complete!');
}

seedGames().catch(console.error);

