"use client";

import { createClient } from "@/lib/supabase/client";
import { BALLS_PER_OVER } from "@/utils/constants";
import type { BallOutcome, MatchDetails } from "@/types";

export function useBallTracking(match: MatchDetails | null) {
    const supabase = createClient();

    const addBall = async (
        outcome: BallOutcome,
        strikerId: string,
        onSuccess: () => void
    ) => {
        if (!match) return { success: false, error: "No match loaded" };

        try {
            const battingTeam =
                match.current_batting_team === match.team1.id
                    ? match.team1
                    : match.team2;

            // Calculate runs and flags
            let runs = 0;
            let isWicket = false;
            let isNoBall = false;

            if (outcome === "OUT") {
                isWicket = true;
            } else if (outcome === "NOBALL") {
                isNoBall = true;
                runs = 1;
            } else {
                runs = outcome as number;
            }

            // Calculate new ball/over
            let newBall = match.current_ball + (isNoBall ? 0 : 1);
            let newOver = match.current_over;

            if (newBall >= BALLS_PER_OVER) {
                newBall = 0;
                newOver++;
            }

            // Insert ball record
            await supabase.from("balls").insert({
                match_id: match.id,
                team_id: battingTeam.id,
                batsman_id: strikerId,
                over_number: match.current_over,
                ball_number: match.current_ball + 1,
                runs,
                is_wicket: isWicket,
                is_no_ball: isNoBall,
            });

            // Update match
            await supabase
                .from("matches")
                .update({
                    current_over: newOver,
                    current_ball: newBall,
                })
                .eq("id", match.id);

            // Update team runs and wickets
            await supabase
                .from("teams")
                .update({
                    runs: battingTeam.runs + runs,
                    wickets: battingTeam.wickets + (isWicket ? 1 : 0),
                })
                .eq("id", battingTeam.id);

            // Update player stats
            const striker = battingTeam.players.find((p) => p.id === strikerId);
            if (striker) {
                await supabase
                    .from("players")
                    .update({
                        runs_scored: striker.runs_scored + (isNoBall ? 0 : runs),
                        balls_faced: striker.balls_faced + (isNoBall ? 0 : 1),
                        is_out: isWicket,
                        is_on_strike: !isWicket && runs % 2 === 0,
                    })
                    .eq("id", strikerId);
            }

            onSuccess();
            return { success: true, isWicket };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Failed to add ball",
            };
        }
    };

    const removeBall = async (onSuccess: () => void) => {
        if (!match || match.balls.length === 0) {
            return { success: false, error: "No balls to remove" };
        }

        try {
            const lastBall = match.balls[match.balls.length - 1];
            const battingTeam =
                match.current_batting_team === match.team1.id
                    ? match.team1
                    : match.team2;

            // Calculate previous ball/over
            let newBall = match.current_ball - 1;
            let newOver = match.current_over;

            if (newBall < 0) {
                newBall = BALLS_PER_OVER - 1;
                newOver = Math.max(0, newOver - 1);
            }

            // Delete ball record
            await supabase.from("balls").delete().eq("id", lastBall.id);

            // Update match
            await supabase
                .from("matches")
                .update({
                    current_over: newOver,
                    current_ball: newBall,
                })
                .eq("id", match.id);

            // Revert team stats
            await supabase
                .from("teams")
                .update({
                    runs: battingTeam.runs - lastBall.runs,
                    wickets: battingTeam.wickets - (lastBall.is_wicket ? 1 : 0),
                })
                .eq("id", battingTeam.id);

            // Revert player stats
            const striker = battingTeam.players.find(
                (p) => p.id === lastBall.batsman_id
            );
            if (striker) {
                await supabase
                    .from("players")
                    .update({
                        runs_scored:
                            striker.runs_scored - (lastBall.is_no_ball ? 0 : lastBall.runs),
                        balls_faced: striker.balls_faced - (lastBall.is_no_ball ? 0 : 1),
                        is_out: false,
                    })
                    .eq("id", lastBall.batsman_id);
            }

            onSuccess();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Failed to remove ball",
            };
        }
    };

    const setStriker = async (playerId: string, onSuccess: () => void) => {
        if (!match) return { success: false, error: "No match loaded" };

        try {
            const battingTeam =
                match.current_batting_team === match.team1.id
                    ? match.team1
                    : match.team2;

            // Reset all players' strike status
            await supabase
                .from("players")
                .update({ is_on_strike: false })
                .eq("team_id", battingTeam.id);

            // Set new striker
            await supabase
                .from("players")
                .update({ is_on_strike: true })
                .eq("id", playerId);

            onSuccess();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Failed to set striker",
            };
        }
    };

    return {
        addBall,
        removeBall,
        setStriker,
    };
}
