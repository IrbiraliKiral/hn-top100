"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LOCAL_STORAGE_KEYS, MIN_PLAYERS_PER_TEAM, MAX_PLAYERS_PER_TEAM } from "@/utils/constants";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Trash2, Users, Trophy, AlertCircle, CheckCircle, History } from "lucide-react";

export default function CreateMatchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCompletedMatch = searchParams.get("type") === "completed";
    const [loading, setLoading] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        heading: "",
        matchNumber: "",
        team1Name: "",
        team2Name: "",
        team1Players: ["", "", "", "", ""],
        team2Players: ["", "", "", "", ""],
    });

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
        } catch (error) {
            console.error("Auth check failed:", error);
            router.push("/panel/login");
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

    const addPlayer = (team: "team1Players" | "team2Players") => {
        if (formData[team].length < MAX_PLAYERS_PER_TEAM) {
            setFormData({
                ...formData,
                [team]: [...formData[team], ""],
            });
        }
    };

    const removePlayer = (team: "team1Players" | "team2Players", index: number) => {
        if (formData[team].length > MIN_PLAYERS_PER_TEAM) {
            const newPlayers = formData[team].filter((_, i) => i !== index);
            setFormData({
                ...formData,
                [team]: newPlayers,
            });
        }
    };

    const updatePlayer = (team: "team1Players" | "team2Players", index: number, value: string) => {
        const newPlayers = [...formData[team]];
        newPlayers[index] = value;
        setFormData({
            ...formData,
            [team]: newPlayers,
        });
    };

    const validateForm = () => {
        if (!formData.heading.trim()) return "Match heading is required";
        if (!formData.matchNumber.trim()) return "Match number is required";
        if (!formData.team1Name.trim()) return "Team 1 name is required";
        if (!formData.team2Name.trim()) return "Team 2 name is required";

        const team1FilledPlayers = formData.team1Players.filter((p) => p.trim());
        const team2FilledPlayers = formData.team2Players.filter((p) => p.trim());

        if (team1FilledPlayers.length < MIN_PLAYERS_PER_TEAM) {
            return `Team 1 needs at least ${MIN_PLAYERS_PER_TEAM} players`;
        }
        if (team2FilledPlayers.length < MIN_PLAYERS_PER_TEAM) {
            return `Team 2 needs at least ${MIN_PLAYERS_PER_TEAM} players`;
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            // Step 1: Create the match first (without team IDs)
            const { data: match, error: matchError } = await supabase
                .from("matches")
                .insert({
                    heading: formData.heading.trim(),
                    match_number: parseInt(formData.matchNumber),
                    status: isCompletedMatch ? "completed" : "upcoming",
                    current_over: 0,
                    current_ball: 0,
                })
                .select()
                .single();

            if (matchError) {
                console.error("Match creation error:", matchError);
                throw new Error(`Failed to create match: ${matchError.message}`);
            }

            console.log("Match created:", match);

            // Step 2: Create Team 1
            const { data: team1, error: team1Error } = await supabase
                .from("teams")
                .insert({
                    name: formData.team1Name.trim(),
                    match_id: match.id,
                    runs: 0,
                    wickets: 0,
                })
                .select()
                .single();

            if (team1Error) {
                console.error("Team 1 creation error:", team1Error);
                throw new Error(`Failed to create Team 1: ${team1Error.message}`);
            }

            console.log("Team 1 created:", team1);

            // Step 3: Create Team 2
            const { data: team2, error: team2Error } = await supabase
                .from("teams")
                .insert({
                    name: formData.team2Name.trim(),
                    match_id: match.id,
                    runs: 0,
                    wickets: 0,
                })
                .select()
                .single();

            if (team2Error) {
                console.error("Team 2 creation error:", team2Error);
                throw new Error(`Failed to create Team 2: ${team2Error.message}`);
            }

            console.log("Team 2 created:", team2);

            // Step 4: Update match with team IDs
            const { error: updateError } = await supabase
                .from("matches")
                .update({
                    team1_id: team1.id,
                    team2_id: team2.id,
                })
                .eq("id", match.id);

            if (updateError) {
                console.error("Match update error:", updateError);
                throw new Error(`Failed to update match with teams: ${updateError.message}`);
            }

            // Step 5: Create players for Team 1
            const team1PlayerNames = formData.team1Players.filter((name) => name.trim());
            const team1PlayersData = team1PlayerNames.map((name) => ({
                name: name.trim(),
                team_id: team1.id,
                is_out: false,
                runs_scored: 0,
                balls_faced: 0,
                is_on_strike: false,
            }));

            if (team1PlayersData.length > 0) {
                const { error: players1Error } = await supabase
                    .from("players")
                    .insert(team1PlayersData);

                if (players1Error) {
                    console.error("Team 1 players error:", players1Error);
                    throw new Error(`Failed to create Team 1 players: ${players1Error.message}`);
                }
            }

            // Step 6: Create players for Team 2
            const team2PlayerNames = formData.team2Players.filter((name) => name.trim());
            const team2PlayersData = team2PlayerNames.map((name) => ({
                name: name.trim(),
                team_id: team2.id,
                is_out: false,
                runs_scored: 0,
                balls_faced: 0,
                is_on_strike: false,
            }));

            if (team2PlayersData.length > 0) {
                const { error: players2Error } = await supabase
                    .from("players")
                    .insert(team2PlayersData);

                if (players2Error) {
                    console.error("Team 2 players error:", players2Error);
                    throw new Error(`Failed to create Team 2 players: ${players2Error.message}`);
                }
            }

            console.log("Match created successfully!");

            if (isCompletedMatch) {
                setSuccess("Match created! Redirecting to editor...");
                setTimeout(() => {
                    router.push(`/panel/match/${match.id}/edit`);
                }, 1000);
            } else {
                setSuccess("Match created successfully! Redirecting...");
                setTimeout(() => {
                    router.push("/panel");
                }, 1500);
            }

        } catch (err) {
            console.error("Error creating match:", err);
            setError(err instanceof Error ? err.message : "Failed to create match. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderPlayerInputs = (team: "team1Players" | "team2Players", teamName: string) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {teamName || `Team ${team === "team1Players" ? "1" : "2"}`} Players
                </h3>
                <span className="text-sm text-muted-foreground">
                    {formData[team].filter((p) => p.trim()).length} / {formData[team].length}
                </span>
            </div>

            <div className="space-y-2">
                {formData[team].map((player, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <Input
                            placeholder={`Player ${index + 1} name`}
                            value={player}
                            onChange={(e) => updatePlayer(team, index, e.target.value)}
                        />
                        {formData[team].length > MIN_PLAYERS_PER_TEAM && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removePlayer(team, index)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {formData[team].length < MAX_PLAYERS_PER_TEAM && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPlayer(team)}
                    className="w-full gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Player
                </Button>
            )}

            <p className="text-xs text-muted-foreground">
                {MIN_PLAYERS_PER_TEAM}-{MAX_PLAYERS_PER_TEAM} players per team
            </p>
        </div>
    );

    return (
        <>
            <Header showPanelNav onLogout={handleLogout} />
            <main className="flex-1 py-8 px-4">
                <div className="container mx-auto max-w-3xl">
                    <Button
                        variant="ghost"
                        className="mb-6 gap-2"
                        onClick={() => router.push("/panel")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>

                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${isCompletedMatch ? 'bg-primary/10' : 'bg-cricket-green/10'}`}>
                                    {isCompletedMatch ? (
                                        <History className="w-6 h-6 text-primary" />
                                    ) : (
                                        <Trophy className="w-6 h-6 text-cricket-green" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">
                                        {isCompletedMatch ? 'Add Completed Match' : 'Create New Match'}
                                    </CardTitle>
                                    <CardDescription>
                                        {isCompletedMatch
                                            ? 'Add an already played match with final scores and stats'
                                            : 'Set up a new cricket match with teams and players'
                                        }
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Match Details */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Match Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heading">Match Heading</Label>
                                            <Input
                                                id="heading"
                                                placeholder="e.g., Opening Match - Group A"
                                                value={formData.heading}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, heading: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="matchNumber">Match Number</Label>
                                            <Input
                                                id="matchNumber"
                                                type="number"
                                                placeholder="e.g., 1"
                                                value={formData.matchNumber}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, matchNumber: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Team 1 */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="team1Name">Team 1 Name</Label>
                                        <Input
                                            id="team1Name"
                                            placeholder="e.g., Thunder Hawks"
                                            value={formData.team1Name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, team1Name: e.target.value })
                                            }
                                        />
                                    </div>
                                    {renderPlayerInputs("team1Players", formData.team1Name)}
                                </div>

                                <Separator />

                                {/* Team 2 */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="team2Name">Team 2 Name</Label>
                                        <Input
                                            id="team2Name"
                                            placeholder="e.g., Lightning Bolts"
                                            value={formData.team2Name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, team2Name: e.target.value })
                                            }
                                        />
                                    </div>
                                    {renderPlayerInputs("team2Players", formData.team2Name)}
                                </div>

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

                                <div className="flex gap-4">
                                    <Button type="submit" size="lg" disabled={loading || !!success} className="flex-1">
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating...
                                            </span>
                                        ) : (
                                            "Create Match"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
