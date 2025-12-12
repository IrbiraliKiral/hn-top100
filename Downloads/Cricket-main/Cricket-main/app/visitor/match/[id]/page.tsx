"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LiveScoreboard } from "@/components/visitor/live-scoreboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MatchDetails } from "@/types";

export default function MatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchMatch();

            // Set up real-time subscription
            const supabase = createClient();
            const subscription = supabase
                .channel(`match-${params.id}`)
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "matches", filter: `id=eq.${params.id}` },
                    () => fetchMatch()
                )
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "teams" },
                    () => fetchMatch()
                )
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "players" },
                    () => fetchMatch()
                )
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "balls" },
                    () => fetchMatch()
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [params.id]);

    const fetchMatch = async () => {
        try {
            const supabase = createClient();
            const matchId = params.id as string;

            // Fetch match
            const { data: matchData, error: matchError } = await supabase
                .from("matches")
                .select("*")
                .eq("id", matchId)
                .single();

            if (matchError) {
                console.error("Error fetching match:", matchError);
                setLoading(false);
                return;
            }

            // Fetch teams
            const { data: teamsData } = await supabase
                .from("teams")
                .select("*")
                .eq("match_id", matchId);

            // Fetch players for each team
            const team1Data = teamsData?.find((t) => t.id === matchData.team1_id);
            const team2Data = teamsData?.find((t) => t.id === matchData.team2_id);

            let team1Players: any[] = [];
            let team2Players: any[] = [];

            if (team1Data) {
                const { data } = await supabase
                    .from("players")
                    .select("*")
                    .eq("team_id", team1Data.id);
                team1Players = data || [];
            }

            if (team2Data) {
                const { data } = await supabase
                    .from("players")
                    .select("*")
                    .eq("team_id", team2Data.id);
                team2Players = data || [];
            }

            // Fetch balls
            const { data: ballsData } = await supabase
                .from("balls")
                .select("*")
                .eq("match_id", matchId)
                .order("created_at", { ascending: true });

            if (team1Data && team2Data) {
                setMatch({
                    ...matchData,
                    team1: { ...team1Data, players: team1Players },
                    team2: { ...team2Data, players: team2Players },
                    balls: ballsData || [],
                });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header showPanelLogin />
            <main className="flex-1 py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="mb-6 gap-2"
                        onClick={() => router.push("/visitor")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Matches
                    </Button>

                    {loading ? (
                        <div className="space-y-6">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    ) : match ? (
                        <>
                            {/* Match Header */}
                            <div className="mb-8">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Match #{match.match_number}
                                </p>
                                <h1 className="text-2xl md:text-3xl font-bold">{match.heading}</h1>
                            </div>

                            {/* Live Scoreboard */}
                            <LiveScoreboard match={match} />

                            {/* Completed Match Banner */}
                            {match.status === "completed" && (
                                <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        You are currently viewing a completed match
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold mb-2">Match not found</h3>
                            <p className="text-muted-foreground">
                                The match you&apos;re looking for doesn&apos;t exist.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
