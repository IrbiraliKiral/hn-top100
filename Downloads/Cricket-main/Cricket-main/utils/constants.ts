// Application constants
export const APP_NAME = "2025 Cricket Tournament";

export const BALL_OUTCOMES = [0, 1, 2, 3, 4, 5, 6, "OUT", "NOBALL"] as const;

export const BALLS_PER_OVER = 6;

export const MIN_PLAYERS_PER_TEAM = 5;
export const MAX_PLAYERS_PER_TEAM = 12;

export const PANEL_PASSWORD_LENGTH = 16;

export const MATCH_STATUS_LABELS: Record<string, string> = {
    upcoming: "Upcoming",
    live: "Live",
    completed: "Completed",
};

export const LOCAL_STORAGE_KEYS = {
    USER_ROLE: "cricket_user_role",
    PANEL_AUTH: "cricket_panel_auth",
    THEME: "cricket_theme",
} as const;
