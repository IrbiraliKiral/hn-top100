-- Supabase Database Schema for Cricket Dashboard
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_number INT NOT NULL,
  heading TEXT NOT NULL,
  team1_id UUID,
  team2_id UUID,
  current_batting_team UUID,
  current_over INT DEFAULT 0,
  current_ball INT DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys for teams in matches
ALTER TABLE matches 
  ADD CONSTRAINT fk_team1 FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_team2 FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_batting_team FOREIGN KEY (current_batting_team) REFERENCES teams(id) ON DELETE SET NULL;

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  is_out BOOLEAN DEFAULT FALSE,
  runs_scored INT DEFAULT 0,
  balls_faced INT DEFAULT 0,
  is_on_strike BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Balls table (for ball-by-ball tracking)
CREATE TABLE IF NOT EXISTS balls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  batsman_id UUID REFERENCES players(id) ON DELETE CASCADE,
  over_number INT NOT NULL,
  ball_number INT NOT NULL,
  runs INT DEFAULT 0,
  is_wicket BOOLEAN DEFAULT FALSE,
  is_no_ball BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_teams_match_id ON teams(match_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_balls_match_id ON balls(match_id);
CREATE INDEX IF NOT EXISTS idx_balls_over ON balls(match_id, over_number);

-- Enable Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on matches" ON matches FOR ALL USING (true);
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all operations on balls" ON balls FOR ALL USING (true);

-- Enable realtime for live updates (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE balls;
