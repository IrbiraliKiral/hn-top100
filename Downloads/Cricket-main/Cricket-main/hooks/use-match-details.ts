"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MatchDetails, Ball } from "@/types";

export function useMatchDetails(matchId: string) {
    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (matchId) fetchMatch();
    }, [matchId]);

    const fetchMatch = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // Fetch match
            const { data: matchData, error: matchError } = await supabase
                .from("matches")
                .select("*")
                .eq("id", matchId)
                .single();

            if (matchError) throw matchError;

            // Fetch teams with players
            const { data: teamsData, error: teamsError } = await supabase
                .from("teams")
                .select("*, players(*)")
                .eq("match_id", matchId);

            if (teamsError) throw teamsError;

            // Fetch balls
            const { data: ballsData, error: ballsError } = await supabase
                .from("balls")
                .select("*")
                .eq("match_id", matchId)
                .order("created_at", { ascending: true });

            if (ballsError) throw ballsError;

            const team1 = teamsData?.find((t) => t.id === matchData.team1_id);
            const team2 = teamsData?.find((t) => t.id === matchData.team2_id);

            if (team1 && team2) {
                setMatch({
                    ...matchData,
                    team1,
                    team2,
                    balls: ballsData || [],
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch match");
        } finally {
            setLoading(false);
        }
    };

    const updateMatch = async (updates: Partial<MatchDetails>) => {
        try {
            const supabase = createClient();

            await supabase
                .from("matches")
                .update({
                    current_over: updates.current_over,
                    current_ball: updates.current_ball,
                    current_batting_team: updates.current_batting_team,
                    status: updates.status,
                })
                .eq("id", matchId);

            await fetchMatch();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Failed to update match",
            };
        }
    };

    return {
        match,
        loading,
        error,
        refetch: fetchMatch,
        updateMatch,
    };
}
