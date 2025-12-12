"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Trophy, Users, CheckCircle, AlertCircle, History } from "lucide-react";
import type { MatchDetails, Player } from "@/types";

export default function EditMatchPage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Editable state
    const [heading, setHeading] = useState("");
    const [matchNumber, setMatchNumber] = useState("");
    const [tossWinner, setTossWinner] = useState<string>("");
    const [team1Runs, setTeam1Runs] = useState("");
    const [team1Wickets, setTeam1Wickets] = useState("");
    const [team2Runs, setTeam2Runs] = useState("");
    const [team2Wickets, setTeam2Wickets] = useState("");
    const [team1Players, setTeam1Players] = useState<Player[]>([]);
    const [team2Players, setTeam2Players] = useState<Player[]>([]);

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

            const team1Data = teamsData?.find((t) => t.id === matchData.team1_id);
            const team2Data = teamsData?.find((t) => t.id === matchData.team2_id);

            let team1PlayersList: Player[] = [];
            let team2PlayersList: Player[] = [];

            if (team1Data) {
                const { data } = await supabase
                    .from("players")
                    .select("*")
                    .eq("team_id", team1Data.id);
                team1PlayersList = data || [];
            }

            if (team2Data) {
                const { data } = await supabase
                    .from("players")
                    .select("*")
                    .eq("team_id", team2Data.id);
                team2PlayersList = data || [];
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
                    team1: { ...team1Data, players: team1PlayersList },
                    team2: { ...team2Data, players: team2PlayersList },
                    balls: ballsData || [],
                };

                setMatch(matchDetails);

                // Initialize form state
                setHeading(matchData.heading);
                setMatchNumber(matchData.match_number.toString());
                setTossWinner(matchData.toss_winner || "");
                setTeam1Runs(team1Data.runs.toString());
                setTeam1Wickets(team1Data.wickets.toString());
                setTeam2Runs(team2Data.runs.toString());
                setTeam2Wickets(team2Data.wickets.toString());
                setTeam1Players(team1PlayersList);
                setTeam2Players(team2PlayersList);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
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

    const updatePlayerStats = (
        teamPlayers: Player[],
        setTeamPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
        playerId: string,
        field: 'runs_scored' | 'balls_faced' | 'is_out',
        value: number | boolean
    ) => {
        setTeamPlayers(players =>
            players.map(p =>
                p.id === playerId ? { ...p, [field]: value } : p
            )
        );
    };

    const getWinner = () => {
        const t1Runs = parseInt(team1Runs) || 0;
        const t2Runs = parseInt(team2Runs) || 0;

        if (t1Runs > t2Runs && match) {
            return match.team1.name;
        } else if (t2Runs > t1Runs && match) {
            return match.team2.name;
        } else {
            return "Tie";
        }
    };

    const handleSave = async () => {
        if (!match) return;

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const supabase = createClient();

            // Update match
            const { error: matchError } = await supabase
                .from("matches")
                .update({
                    heading,
                    match_number: parseInt(matchNumber),
                    toss_winner: tossWinner || null,
                    status: "completed",
                })
                .eq("id", match.id);

            if (matchError) throw new Error(`Failed to update match: ${matchError.message}`);

            // Update Team 1
            const { error: team1Error } = await supabase
                .from("teams")
                .update({
                    runs: parseInt(team1Runs) || 0,
                    wickets: parseInt(team1Wickets) || 0,
                })
                .eq("id", match.team1.id);

            if (team1Error) throw new Error(`Failed to update Team 1: ${team1Error.message}`);

            // Update Team 2
            const { error: team2Error } = await supabase
                .from("teams")
                .update({
                    runs: parseInt(team2Runs) || 0,
                    wickets: parseInt(team2Wickets) || 0,
                })
                .eq("id", match.team2.id);

            if (team2Error) throw new Error(`Failed to update Team 2: ${team2Error.message}`);

            // Update all players from both teams
            for (const player of team1Players) {
                const { error: playerError } = await supabase
                    .from("players")
                    .update({
                        runs_scored: player.runs_scored,
                        balls_faced: player.balls_faced,
                        is_out: player.is_out,
                    })
                    .eq("id", player.id);

                if (playerError) console.error(`Failed to update player ${player.name}:`, playerError);
            }

            for (const player of team2Players) {
                const { error: playerError } = await supabase
                    .from("players")
                    .update({
                        runs_scored: player.runs_scored,
                        balls_faced: player.balls_faced,
                        is_out: player.is_out,
                    })
                    .eq("id", player.id);

                if (playerError) console.error(`Failed to update player ${player.name}:`, playerError);
            }

            setSuccess("Match updated successfully!");

            setTimeout(() => {
                setSuccess("");
            }, 3000);

        } catch (err) {
            console.error("Error saving match:", err);
            setError(err instanceof Error ? err.message : "Failed to save match");
        } finally {
            setSaving(false);
        }
    };

    const renderPlayerEditor = (
        players: Player[],
        setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
        teamName: string
    ) => (
        <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                {teamName} - Player Stats
            </h4>
            <div className="space-y-3">
                {players.map((player) => (
                    <div
                        key={player.id}
                        className="p-4 rounded-lg bg-muted/30 border"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 min-w-[150px]">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                                    {player.name.charAt(0)}
                                </div>
                                <span className="font-medium">{player.name}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs text-muted-foreground">Runs</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={player.runs_scored}
                                        onChange={(e) => updatePlayerStats(
                                            players,
                                            setPlayers,
                                            player.id,
                                            'runs_scored',
                                            parseInt(e.target.value) || 0
                                        )}
                                        className="w-20 h-8"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs text-muted-foreground">Balls</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={player.balls_faced}
                                        onChange={(e) => updatePlayerStats(
                                            players,
                                            setPlayers,
                                            player.id,
                                            'balls_faced',
                                            parseInt(e.target.value) || 0
                                        )}
                                        className="w-20 h-8"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs text-muted-foreground">Out</Label>
                                    <Button
                                        type="button"
                                        variant={player.is_out ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => updatePlayerStats(
                                            players,
                                            setPlayers,
                                            player.id,
                                            'is_out',
                                            !player.is_out
                                        )}
                                        className="h-8"
                                    >
                                        {player.is_out ? "Yes" : "No"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!authChecked || loading) {
        return (
            <>
                <Header showPanelNav />
                <main className="flex-1 py-8 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <Skeleton className="h-10 w-48 mb-8" />
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                </main>
            </>
        );
    }

    if (!match) {
        return (
            <>
                <Header showPanelNav onLogout={handleLogout} />
                <main className="flex-1 py-8 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <Button
                            variant="ghost"
                            className="mb-6 gap-2"
                            onClick={() => router.push("/panel")}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold mb-2">Match not found</h3>
                            <p className="text-muted-foreground">
                                The match you&apos;re looking for doesn&apos;t exist.
                            </p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header showPanelNav onLogout={handleLogout} />
            <main className="flex-1 py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    <Button
                        variant="ghost"
                        className="mb-6 gap-2"
                        onClick={() => router.push("/panel")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">
                                <History className="w-3 h-3 mr-1" />
                                Edit Completed Match
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold">{match.heading}</h1>
                        <p className="text-muted-foreground">
                            Edit match details, scores, and player statistics
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Match Details Card */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Match Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="heading">Match Heading</Label>
                                        <Input
                                            id="heading"
                                            value={heading}
                                            onChange={(e) => setHeading(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="matchNumber">Match Number</Label>
                                        <Input
                                            id="matchNumber"
                                            type="number"
                                            value={matchNumber}
                                            onChange={(e) => setMatchNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Toss Winner</Label>
                                    <Select value={tossWinner} onValueChange={setTossWinner}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select toss winner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={match.team1.id}>{match.team1.name}</SelectItem>
                                            <SelectItem value={match.team2.id}>{match.team2.name}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Scores Card */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Final Scores</CardTitle>
                                <CardDescription>
                                    Enter the final score for each team
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Team 1 Score */}
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {match.team1.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold">{match.team1.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Runs</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={team1Runs}
                                                    onChange={(e) => setTeam1Runs(e.target.value)}
                                                    className="text-2xl font-bold h-14 text-center"
                                                />
                                            </div>
                                            <span className="text-3xl text-muted-foreground pt-6">/</span>
                                            <div className="w-20 space-y-2">
                                                <Label className="text-xs">Wickets</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    value={team1Wickets}
                                                    onChange={(e) => setTeam1Wickets(e.target.value)}
                                                    className="text-2xl font-bold h-14 text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team 2 Score */}
                                    <div className="p-4 rounded-xl bg-muted/30 border">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {match.team2.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold">{match.team2.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Runs</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={team2Runs}
                                                    onChange={(e) => setTeam2Runs(e.target.value)}
                                                    className="text-2xl font-bold h-14 text-center"
                                                />
                                            </div>
                                            <span className="text-3xl text-muted-foreground pt-6">/</span>
                                            <div className="w-20 space-y-2">
                                                <Label className="text-xs">Wickets</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    value={team2Wickets}
                                                    onChange={(e) => setTeam2Wickets(e.target.value)}
                                                    className="text-2xl font-bold h-14 text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Winner Display */}
                                <div className="mt-6 p-4 rounded-lg bg-cricket-green/10 border border-cricket-green/20 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Trophy className="w-5 h-5 text-cricket-green" />
                                        <span className="font-semibold text-cricket-green">
                                            Winner: {getWinner()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Player Statistics Cards */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Player Statistics</CardTitle>
                                <CardDescription>
                                    Edit individual player runs, balls faced, and dismissal status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {renderPlayerEditor(team1Players, setTeam1Players, match.team1.name)}
                                <Separator />
                                {renderPlayerEditor(team2Players, setTeam2Players, match.team2.name)}
                            </CardContent>
                        </Card>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-cricket-green/10 text-cricket-green text-sm">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                {success}
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex gap-4">
                            <Button
                                size="lg"
                                className="flex-1 gap-2"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.push("/panel")}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
