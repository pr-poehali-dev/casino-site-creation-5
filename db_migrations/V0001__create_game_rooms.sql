CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  game_type VARCHAR(32) NOT NULL DEFAULT 'poker',
  host_name VARCHAR(64) NOT NULL,
  host_id VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'waiting',
  max_players INT NOT NULL DEFAULT 6,
  small_blind INT NOT NULL DEFAULT 100,
  big_blind INT NOT NULL DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);