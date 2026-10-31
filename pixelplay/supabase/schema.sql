-- =============================================================================
-- PIXELPLAY Production Database Schema (PostgreSQL / Supabase)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Lightweight, anonymous & authenticated)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id VARCHAR(64) UNIQUE,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(32) NOT NULL DEFAULT 'PixelRunner',
  avatar VARCHAR(16) NOT NULL DEFAULT '👾',
  country VARCHAR(8) DEFAULT '🌐',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Games Registry
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(32) PRIMARY KEY, -- 'one-pixel', 'zero-zero-one', 'memory-5', 'dont-trust-ui'
  name VARCHAR(64) NOT NULL,
  slug VARCHAR(64) NOT NULL UNIQUE,
  category VARCHAR(32) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO games (id, name, slug, category) VALUES
  ('one-pixel', 'One Pixel', 'one-pixel', 'Observation'),
  ('zero-zero-one', '0.001 Second', 'zero-zero-one', 'Reflex'),
  ('memory-5', 'Memory 5', 'memory-5', 'Memory'),
  ('dont-trust-ui', 'Don''t Trust the UI', 'dont-trust-ui', 'Trolling / Reaction')
ON CONFLICT (id) DO NOTHING;

-- 3. Game Sessions & Scores (Anti-cheat audit trail)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id VARCHAR(64),
  game_id VARCHAR(32) REFERENCES games(id) ON DELETE CASCADE,
  score NUMERIC(10, 2) NOT NULL,
  level INTEGER DEFAULT 1,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_game_score ON game_sessions(game_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON game_sessions(created_at);

-- 4. Global Leaderboard Scores (Aggregated personal bests)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id VARCHAR(32) REFERENCES games(id) ON DELETE CASCADE,
  score NUMERIC(10, 2) NOT NULL,
  session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- 5. Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_date DATE NOT NULL UNIQUE,
  game_id VARCHAR(32) REFERENCES games(id) ON DELETE CASCADE,
  seed INTEGER NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Daily Scores (Leaderboard for each daily challenge)
CREATE TABLE IF NOT EXISTS daily_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(10, 2) NOT NULL,
  session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(daily_challenge_id, user_id)
);

-- 7. Achievements Catalog
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(16) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Unlocked Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(64) REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 9. Friend Challenge Invites
CREATE TABLE IF NOT EXISTS friend_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id VARCHAR(32) REFERENCES games(id) ON DELETE CASCADE,
  target_score NUMERIC(10, 2) NOT NULL,
  challenge_seed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. User Lifetime Stats Summary
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_games INTEGER DEFAULT 0,
  total_score NUMERIC(14, 2) DEFAULT 0,
  current_streak INTEGER DEFAULT 1,
  longest_streak INTEGER DEFAULT 1,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

