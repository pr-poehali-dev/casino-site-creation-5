CREATE TABLE room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  player_id VARCHAR(64) NOT NULL,
  player_name VARCHAR(64) NOT NULL,
  chips INT NOT NULL DEFAULT 10000,
  seat INT,
  status VARCHAR(16) NOT NULL DEFAULT 'waiting',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE poker_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID UNIQUE NOT NULL,
  phase VARCHAR(16) NOT NULL DEFAULT 'waiting',
  deck TEXT NOT NULL DEFAULT '[]',
  community_cards TEXT NOT NULL DEFAULT '[]',
  pot INT NOT NULL DEFAULT 0,
  current_seat INT NOT NULL DEFAULT 0,
  dealer_seat INT NOT NULL DEFAULT 0,
  round_bets TEXT NOT NULL DEFAULT '{}',
  hands TEXT NOT NULL DEFAULT '{}',
  last_action TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);