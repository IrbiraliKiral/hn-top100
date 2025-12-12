"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MatchWithTeams, Match, Team } from "@/types";

export function useMatches() {
    const [matches, setMatches] = useState<MatchWithTeams[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: matchesData, error: matchesError } = await supabase
                .from("matches")
                .select("*")
                .order("created_at", { ascending: false });

            if (matchesError) throw matchesError;

            const matchesWithTeams: MatchWithTeams[] = [];

            for (const match of matchesData || []) {
                const { data: teamsData } = await supabase
                    .from("teams")
                    .select("*")
                    .eq("match_id", match.id);

                if (teamsData && teamsData.length === 2) {
                    const team1 = teamsData.find((t) => t.id === match.team1_id);
                    const team2 = teamsData.find((t) => t.id === match.team2_id);

                    if (team1 && team2) {
                        matchesWithTeams.push({
                            ...match,
                            team1,
                            team2,
                        });
                    }
                }
            }

            setMatches(matchesWithTeams);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch matches");
        } finally {
            setLoading(false);
        }
    };

    const createMatch = async (data: {
        heading: string;
        match_number: number;
        team1_name: string;
        team2_name: string;
        team1_players: string[];
        team2_players: string[];
    }) => {
        try {
            const supabase = createClient();

            // Create match
            const { data: match, error: matchError } = await supabase
                .from("matches")
                .insert({
                    heading: data.heading,
                    match_number: data.match_number,
                    status: "upcoming",
                })
                .select()
                .single();

            if (matchError) throw matchError;

            // Create teams
            const { data: team1, error: team1Error } = await supabase
                .from("teams")
                .insert({
                    name: data.team1_name,
                    match_id: match.id,
                })
                .select()
                .single();

            if (team1Error) throw team1Error;

            const { data: team2, error: team2Error } = await supabase
                .from("teams")
                .insert({
                    name: data.team2_name,
                    match_id: match.id,
                })
                .select()
                .single();

            if (team2Error) throw team2Error;

            // Update match with team IDs
            await supabase
                .from("matches")
                .update({
                    team1_id: team1.id,
                    team2_id: team2.id,
                })
                .eq("id", match.id);

            // Create players for team 1
            const team1PlayersInsert = data.team1_players
                .filter((name) => name.trim())
                .map((name) => ({
                    name: name.trim(),
                    team_id: team1.id,
                }));

            await supabase.from("players").insert(team1PlayersInsert);

            // Create players for team 2
            const team2PlayersInsert = data.team2_players
                .filter((name) => name.trim())
                .map((name) => ({
                    name: name.trim(),
                    team_id: team2.id,
                }));

            await supabase.from("players").insert(team2PlayersInsert);

            await fetchMatches();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Failed to create match",
            };
        }
    };

    return {
        matches,
        loading,
        error,
        refetch: fetchMatches,
        createMatch,
    };
}
