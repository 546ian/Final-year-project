-- Gamelink Database Schema
-- PostgreSQL

-- Users table (base for both gamers and business accounts)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('gamer', 'business')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gamer profiles
CREATE TABLE gamer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar_url TEXT,
  phone_number VARCHAR(20),
  location VARCHAR(100),
  bio TEXT,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  rating FLOAT DEFAULT 1200,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles
CREATE TABLE business_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_name VARCHAR(100),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  location VARCHAR(150),
  address VARCHAR(255),
  city VARCHAR(50),
  postal_code VARCHAR(20),
  website VARCHAR(255),
  logo_url VARCHAR(255),
  mpesa_phone VARCHAR(20),
  mpesa_paybill VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gaming devices (linked to businesses)
CREATE TABLE gaming_devices (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  device_name VARCHAR(100),
  device_type VARCHAR(50), -- e.g., 'PS5', 'Xbox', 'PC', 'Nintendo'
  serial_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
  remote_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  genre VARCHAR(50),
  platform VARCHAR(50), -- 'Multi', 'PS5', 'Xbox', 'PC', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO games (name, description, genre, platform) VALUES
('Valorant', 'Tactical 5v5 shooter', 'FPS', 'PC'),
('CS:GO', 'Counter-Strike Global Offensive', 'FPS', 'Multi'),
('League of Legends', 'MOBA game', 'MOBA', 'PC'),
('Dota 2', 'Defense of the Ancients 2', 'MOBA', 'PC'),
('Fortnite', 'Battle Royale', 'Battle Royale', 'Multi');

-- Business activities (manually monitored and remotely from consoles)
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  game_id INT REFERENCES games(id),
  activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('manual', 'remote')),
  player_names TEXT, -- JSON or comma-separated
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team rosters (business team management)
CREATE TABLE team_rosters (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members (players signed by business)
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_roster_id INT NOT NULL REFERENCES team_rosters(id) ON DELETE CASCADE,
  gamer_id INT NOT NULL REFERENCES gamer_profiles(id) ON DELETE CASCADE,
  role VARCHAR(50), -- 'captain', 'member'
  joined_date DATE,
  contract_status VARCHAR(20) DEFAULT 'active', -- 'active', 'terminated'
  termination_requested BOOLEAN DEFAULT FALSE,
  termination_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  host_gamer_id INT REFERENCES gamer_profiles(id) ON DELETE SET NULL,
  host_business_id INT REFERENCES business_profiles(id) ON DELETE SET NULL,
  tournament_name VARCHAR(100) NOT NULL,
  description TEXT,
  game_id INT REFERENCES games(id),
  tournament_format VARCHAR(50), -- 'single_elimination', 'double_elimination', 'round_robin'
  max_players INT,
  entry_fee FLOAT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'registration', -- 'registration', 'active', 'completed'
  host_type VARCHAR(20), -- 'gamer' or 'business'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tournament registrations
CREATE TABLE tournament_registrations (
  id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  gamer_id INT REFERENCES gamer_profiles(id) ON DELETE CASCADE,
  team_member_id INT REFERENCES team_members(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'playing', 'eliminated', 'won'
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament brackets/matches
CREATE TABLE tournament_matches (
  id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INT,
  match_number INT,
  player1_id INT REFERENCES gamer_profiles(id),
  player2_id INT REFERENCES team_members(id),
  winner_id INT,
  player1_score INT,
  player2_score INT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  scheduled_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PVP Takeons (1v1 challenges between gamers)
CREATE TABLE pvp_takeons (
  id SERIAL PRIMARY KEY,
  challenger_id INT NOT NULL REFERENCES gamer_profiles(id) ON DELETE CASCADE,
  opponent_id INT REFERENCES gamer_profiles(id) ON DELETE CASCADE,
  opponent_display_name VARCHAR(100), -- Can be custom or suggested
  game_id INT NOT NULL REFERENCES games(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'in_progress', 'completed'
  winner_id INT,
  challenger_score INT,
  opponent_score INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts/Media (shared by both gamers and businesses)
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT, -- JSON array of URLs
  post_type VARCHAR(20) DEFAULT 'general', -- 'general', 'tournament', 'activity'
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'private'
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments on posts
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes on posts
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Gamer progress/statistics
CREATE TABLE gamer_progress (
  id SERIAL PRIMARY KEY,
  gamer_id INT NOT NULL REFERENCES gamer_profiles(id) ON DELETE CASCADE,
  date DATE,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  rating_change FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business logs
CREATE TABLE business_logs (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  log_type VARCHAR(50), -- 'tournament', 'activity', 'payment', 'system'
  description TEXT,
  related_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  business_id INT REFERENCES business_profiles(id),
  amount FLOAT NOT NULL,
  payment_method VARCHAR(50), -- 'mpesa', 'card'
  mpesa_phone VARCHAR(20),
  transaction_ref VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_gamer_profiles_user_id ON gamer_profiles(user_id);
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_activities_business_id ON activities(business_id);
CREATE INDEX idx_tournaments_host_business_id ON tournaments(host_business_id);
CREATE INDEX idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_gamer_progress_gamer_id ON gamer_progress(gamer_id);
CREATE INDEX idx_business_logs_business_id ON business_logs(business_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
