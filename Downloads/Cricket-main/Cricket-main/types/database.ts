// Match status types
export type MatchStatus = "upcoming" | "live" | "completed";

// Ball outcome types
export type BallOutcome = 0 | 1 | 2 | 3 | 4 | 5 | 6 | "OUT" | "NOBALL";

// Database types
export interface Match {
    id: string;
    match_number: number;
    heading: string;
    team1_id: string;
    team2_id: string;
    current_batting_team: string | null;
    current_over: number;
    current_ball: number;
    status: MatchStatus;
    toss_winner?: string | null;
    created_at: string;
}

export interface Team {
    id: string;
    name: string;
    match_id: string;
    runs: number;
    wickets: number;
    created_at: string;
}

export interface Player {
    id: string;
    name: string;
    team_id: string;
    is_out: boolean;
    runs_scored: number;
    balls_faced: number;
    is_on_strike: boolean;
    created_at: string;
}

export interface Ball {
    id: string;
    match_id: string;
    team_id: string;
    batsman_id: string;
    over_number: number;
    ball_number: number;
    runs: number;
    is_wicket: boolean;
    is_no_ball: boolean;
    created_at: string;
}

// Extended types for UI
export interface MatchWithTeams extends Match {
    team1: Team;
    team2: Team;
}

export interface TeamWithPlayers extends Team {
    players: Player[];
}

export interface MatchDetails extends Match {
    team1: TeamWithPlayers;
    team2: TeamWithPlayers;
    balls: Ball[];
}

// Form types
export interface CreateMatchFormData {
    heading: string;
    match_number: number;
    team1_name: string;
    team2_name: string;
    team1_players: string[];
    team2_players: string[];
}

// User role type
export type UserRole = "visitor" | "panel" | null;
