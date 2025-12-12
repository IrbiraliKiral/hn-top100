"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BallTracker } from "@/components/panels/ball-tracker";
import { BatsmanSelector } from "@/components/panels/batsman-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LOCAL_STORAGE_KEYS, BALLS_PER_OVER } from "@/utils/constants";
import { formatScore, calculateOvers } from "@/helpers/cricket-utils";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, Play, Edit, History } from "lucide-react";
import type { MatchDetails, Player, BallOutcome } from "@/types";

export default function MatchUpdatePage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [showBatsmanSelector, setShowBatsmanSelector] = useState(false);
    const [selectorMode, setSelectorMode] = useState<"striker" | "new_batsman">("striker");
    const [pendingOutcome, setPendingOutcome] = useState<BallOutcome | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch("/api/auth/verify");
            const data = await response.json();

            if (!data.authenticated) {
                router.push("/panel/login");
                return;
            }

            setAuthChecked(true);
            if (params.id) {
                fetchMatch();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            router.push("/panel/login");
        }
    };

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

            let team1Players: Player[] = [];
            let team2Players: Player[] = [];

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
                const matchDetails: MatchDetails = {
                    ...matchData,
                    team1: { ...team1Data, players: team1Players },
                    team2: { ...team2Data, players: team2Players },
                    balls: ballsData || [],
                };

                setMatch(matchDetails);

                // Check if we need to select a batting team first
                if (!matchData.current_batting_team && matchData.status === "upcoming") {
                    // Auto-select team1 as batting team and start match
                    await startMatch(matchId, team1Data.id);
                } else if (matchData.current_batting_team && matchData.status === "live") {
                    // Check if we need to select a striker
                    const battingTeam = matchData.current_batting_team === team1Data.id ? team1Players : team2Players;
                    const hasStriker = battingTeam.some((p: Player) => p.is_on_strike && !p.is_out);
                    if (!hasStriker) {
                        setSelectorMode("striker");
                        setShowBatsmanSelector(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const startMatch = async (matchId: string, battingTeamId: string) => {
        const supabase = createClient();
        await supabase
            .from("matches")
            .update({
                status: "live",
                current_batting_team: battingTeamId,
            })
            .eq("id", matchId);

        await fetchMatch();
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_ROLE);
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getBattingTeam = () => {
        if (!match) return null;
        return match.current_batting_team === match.team1.id ? match.team1 : match.team2;
    };

    const getBowlingTeam = () => {
        if (!match) return null;
        return match.current_batting_team === match.team1.id ? match.team2 : match.team1;
    };

    const handleAddBall = async (outcome: BallOutcome) => {
        if (!match) return;

        const battingTeam = getBattingTeam();
        if (!battingTeam) return;

        const striker = battingTeam.players.find((p) => p.is_on_strike && !p.is_out);

        if (!striker) {
            // Need to select a striker first
            setPendingOutcome(outcome);
            setSelectorMode("striker");
            setShowBatsmanSelector(true);
            return;
        }

        await processBall(outcome, striker.id);
    };

    const processBall = async (outcome: BallOutcome, strikerId: string) => {
        if (!match) return;

        const supabase = createClient();
        const battingTeam = getBattingTeam();
        if (!battingTeam) return;

        const striker = battingTeam.players.find((p) => p.id === strikerId);
        if (!striker) return;

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

        // Calculate new ball/over (no-ball doesn't count as a legal delivery)
        let newBall = match.current_ball + (isNoBall ? 0 : 1);
        let newOver = match.current_over;

        if (newBall >= BALLS_PER_OVER) {
            newBall = 0;
            newOver++;
        }

        try {
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

            // Update striker stats
            const shouldRotateStrike = !isWicket && runs % 2 === 1;
            const nonStriker = battingTeam.players.find((p) => !p.is_out && p.balls_faced > 0 && p.id !== strikerId);

            await supabase
                .from("players")
                .update({
                    runs_scored: striker.runs_scored + (isNoBall ? 0 : runs),
                    balls_faced: striker.balls_faced + (isNoBall ? 0 : 1),
                    is_out: isWicket,
                    is_on_strike: !isWicket && !shouldRotateStrike,
                })
                .eq("id", strikerId);

            // Rotate strike if odd runs
            if (shouldRotateStrike && nonStriker) {
                await supabase
                    .from("players")
                    .update({ is_on_strike: true })
                    .eq("id", nonStriker.id);
            }

            // If wicket, need to select new batsman
            if (isWicket) {
                setSelectorMode("new_batsman");
                setShowBatsmanSelector(true);
            }

            await fetchMatch();
        } catch (error) {
            console.error("Error adding ball:", error);
        }
    };

    const handleRemoveBall = async () => {
        if (!match || match.balls.length === 0) return;

        const supabase = createClient();
        const lastBall = match.balls[match.balls.length - 1];
        const battingTeam = getBattingTeam();
        if (!battingTeam) return;

        // Calculate previous ball/over
        let newBall = match.current_ball - 1;
        let newOver = match.current_over;

        if (newBall < 0 && newOver > 0) {
            newBall = BALLS_PER_OVER - 1;
            newOver--;
        } else if (newBall < 0) {
            newBall = 0;
        }

        try {
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
                    runs: Math.max(0, battingTeam.runs - lastBall.runs),
                    wickets: Math.max(0, battingTeam.wickets - (lastBall.is_wicket ? 1 : 0)),
                })
                .eq("id", battingTeam.id);

            // Revert player stats
            const striker = battingTeam.players.find((p) => p.id === lastBall.batsman_id);
            if (striker) {
                await supabase
                    .from("players")
                    .update({
                        runs_scored: Math.max(0, striker.runs_scored - (lastBall.is_no_ball ? 0 : lastBall.runs)),
                        balls_faced: Math.max(0, striker.balls_faced - (lastBall.is_no_ball ? 0 : 1)),
                        is_out: false,
                        is_on_strike: true,
                    })
                    .eq("id", lastBall.batsman_id);
            }

            await fetchMatch();
        } catch (error) {
            console.error("Error removing ball:", error);
        }
    };

    const handleBatsmanSelect = async (playerId: string) => {
        if (!match) return;

        const supabase = createClient();
        const battingTeam = getBattingTeam();
        if (!battingTeam) return;

        try {
            // Reset all players' strike status in this team
            await supabase
                .from("players")
                .update({ is_on_strike: false })
                .eq("team_id", battingTeam.id);

            // Set new striker
            await supabase
                .from("players")
                .update({ is_on_strike: true })
                .eq("id", playerId);

            setShowBatsmanSelector(false);

            // If we had a pending outcome, process it now
            if (pendingOutcome !== null) {
                await processBall(pendingOutcome, playerId);
                setPendingOutcome(null);
            } else {
                await fetchMatch();
            }
        } catch (error) {
            console.error("Error selecting batsman:", error);
        }
    };

    const handleStartMatch = async () => {
        if (!match) return;
        await startMatch(match.id, match.team1.id);
    };

    const battingTeam = getBattingTeam();
    const bowlingTeam = getBowlingTeam();

    return (
        <>
            <Header showPanelNav onLogout={handleLogout} />
            <main className="flex-1 py-8 px-4">
                <div className="container mx-auto max-w-5xl">
                    <Button
                        variant="ghost"
                        className="mb-6 gap-2"
                        onClick={() => router.push("/panel")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>

                    {loading ? (
                        <div className="space-y-6">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                    ) : match && match.status === "upcoming" ? (
                        // Show start match button for upcoming matches
                        <Card className="glass-card">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <Play className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{match.heading}</h2>
                                <p className="text-muted-foreground mb-2">Match #{match.match_number}</p>
                                <p className="text-lg mb-6">
                                    {match.team1.name} vs {match.team2.name}
                                </p>
                                <Button size="lg" onClick={handleStartMatch} className="gap-2">
                                    <Play className="w-5 h-5" />
                                    Start Match
                                </Button>
                                <p className="text-sm text-muted-foreground mt-4">
                                    {match.team1.name} will bat first
                                </p>
                            </CardContent>
                        </Card>
                    ) : match && match.status === "completed" ? (
                        // Show completed match with edit option
                        <Card className="glass-card">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                                    <History className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{match.heading}</h2>
                                <p className="text-muted-foreground mb-2">Match #{match.match_number}</p>
                                <p className="text-lg mb-2">
                                    {match.team1.name} vs {match.team2.name}
                                </p>
                                <div className="flex items-center justify-center gap-4 text-lg font-semibold mb-6">
                                    <span>{match.team1.runs}/{match.team1.wickets}</span>
                                    <span className="text-muted-foreground">-</span>
                                    <span>{match.team2.runs}/{match.team2.wickets}</span>
                                </div>
                                <Badge variant="secondary" className="mb-6">
                                    Match Completed
                                </Badge>
                                <div className="flex gap-4 justify-center">
                                    <Button size="lg" onClick={() => router.push(`/panel/match/${match.id}/edit`)} className="gap-2">
                                        <Edit className="w-5 h-5" />
                                        Edit Match Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : match && battingTeam && bowlingTeam ? (
                        <>
                            {/* Match Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        Match #{match.match_number}
                                    </span>
                                    <Badge variant="live">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5" />
                                        LIVE
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-bold">{match.heading}</h1>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Live Score Card */}
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle>Live Score</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Batting Team */}
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium">{battingTeam.name}</p>
                                                <Badge variant="success" className="text-xs">Batting</Badge>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold">{battingTeam.runs}</span>
                                                <span className="text-2xl text-muted-foreground">/{battingTeam.wickets}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                ({calculateOvers(match.current_over * 6 + match.current_ball)} overs)
                                            </p>
                                        </div>

                                        <Separator />

                                        {/* Bowling Team */}
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                                                    {bowlingTeam.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{bowlingTeam.name}</p>
                                                    <p className="text-xs text-muted-foreground">Bowling</p>
                                                </div>
                                            </div>
                                            <p className="text-xl font-bold">
                                                {formatScore(bowlingTeam.runs, bowlingTeam.wickets)}
                                            </p>
                                        </div>

                                        {/* Current Over Balls */}
                                        <div>
                                            <p className="text-sm font-medium mb-3">This Over</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {match.balls
                                                    .filter((b) => b.over_number === match.current_over)
                                                    .map((ball) => (
                                                        <div
                                                            key={ball.id}
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${ball.is_wicket
                                                                ? "bg-red-500/20 text-red-400"
                                                                : ball.runs === 4
                                                                    ? "bg-cricket-green/20 text-cricket-green"
                                                                    : ball.runs === 6
                                                                        ? "bg-cricket-gold/20 text-cricket-gold"
                                                                        : ball.is_no_ball
                                                                            ? "bg-yellow-500/20 text-yellow-500"
                                                                            : "bg-muted"
                                                                }`}
                                                        >
                                                            {ball.is_wicket ? "W" : ball.is_no_ball ? "NB" : ball.runs}
                                                        </div>
                                                    ))}
                                                {Array.from({ length: Math.max(0, 6 - match.current_ball) }).map((_, idx) => (
                                                    <div
                                                        key={`empty-${idx}`}
                                                        className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/20"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Ball Tracker */}
                                <BallTracker
                                    currentOver={match.current_over}
                                    currentBall={match.current_ball}
                                    onAddBall={handleAddBall}
                                    onRemoveBall={handleRemoveBall}
                                />
                            </div>

                            {/* Batsmen on Crease */}
                            <Card className="glass-card mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Batsmen on Crease
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {battingTeam.players
                                            .filter((p) => !p.is_out && (p.balls_faced > 0 || p.is_on_strike))
                                            .map((player) => (
                                                <div
                                                    key={player.id}
                                                    className={`p-4 rounded-lg ${player.is_on_strike
                                                        ? "bg-primary/10 border border-primary/20"
                                                        : "bg-muted/20"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                                                                {player.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium flex items-center gap-2">
                                                                    {player.name}
                                                                    {player.is_on_strike && (
                                                                        <Badge variant="success" className="text-xs">
                                                                            On Strike
                                                                        </Badge>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold">{player.runs_scored}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ({player.balls_faced} balls)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    {battingTeam.players.filter((p) => !p.is_out && (p.balls_faced > 0 || p.is_on_strike)).length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            Click + to add the first ball and select the opening batsman.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
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

            {/* Batsman Selector Modal */}
            {match && battingTeam && (
                <BatsmanSelector
                    players={battingTeam.players}
                    open={showBatsmanSelector}
                    onSelect={handleBatsmanSelect}
                    title={selectorMode === "striker" ? "Select Opening Batsman" : "Select New Batsman"}
                    description={
                        selectorMode === "striker"
                            ? "Choose who will be on strike"
                            : "Choose the new batsman after the wicket"
                    }
                />
            )}
        </>
    );
}
