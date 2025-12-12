"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatScore, calculateOvers, calculateRunRate } from "@/helpers/cricket-utils";
import type { MatchDetails, Team, Player } from "@/types";
import { Target, Users, Timer, TrendingUp, Trophy, CheckCircle } from "lucide-react";

interface LiveScoreboardProps {
    match: MatchDetails;
}

export function LiveScoreboard({ match }: LiveScoreboardProps) {
    const isLive = match.status === "live";
    const isCompleted = match.status === "completed";

    const getBattingTeam = (): Team & { players: Player[] } => {
        if (match.current_batting_team === match.team1.id) {
            return match.team1;
        }
        return match.team2;
    };

    const getBowlingTeam = (): Team & { players: Player[] } => {
        if (match.current_batting_team === match.team1.id) {
            return match.team2;
        }
        return match.team1;
    };

    const battingTeam = getBattingTeam();
    const bowlingTeam = getBowlingTeam();
    const totalBalls = match.current_over * 6 + match.current_ball;
    const runRate = calculateRunRate(battingTeam.runs, totalBalls);

    // Get batsmen on crease (not out)
    const batsmenOnCrease = battingTeam.players.filter(
        (p) => !p.is_out && p.balls_faced > 0
    );

    // For completed matches, determine the winner
    const getWinner = () => {
        if (match.team1.runs > match.team2.runs) {
            return { team: match.team1.name, margin: `${match.team1.runs - match.team2.runs} runs` };
        } else if (match.team2.runs > match.team1.runs) {
            return { team: match.team2.name, margin: `${10 - match.team2.wickets} wickets` };
        } else {
            return { team: "Tie", margin: "" };
        }
    };

    // Calculate total balls for a team based on player stats
    const calculateTeamBalls = (team: Team & { players: Player[] }) => {
        return team.players.reduce((total, p) => total + p.balls_faced, 0);
    };

    // Completed Match View
    if (isCompleted) {
        const winner = getWinner();
        const team1Balls = calculateTeamBalls(match.team1);
        const team2Balls = calculateTeamBalls(match.team2);
        const team1RunRate = calculateRunRate(match.team1.runs, team1Balls);
        const team2RunRate = calculateRunRate(match.team2.runs, team2Balls);

        return (
            <div className="space-y-6">
                {/* Match Result Banner */}
                <Card className="glass-card overflow-hidden border-cricket-green/30">
                    <CardContent className="py-6">
                        <div className="text-center">
                            <Badge variant="secondary" className="mb-4">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Match Completed
                            </Badge>
                            {winner.team !== "Tie" ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Trophy className="w-6 h-6 text-cricket-gold" />
                                    <span className="text-xl font-bold text-cricket-green">
                                        {winner.team} won by {winner.margin}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xl font-bold">Match Tied!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Final Scores */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Final Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Team 1 */}
                        <div className={`p-4 rounded-xl ${match.team1.runs > match.team2.runs ? 'bg-cricket-green/10 border border-cricket-green/20' : 'bg-muted/30'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                                        {match.team1.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg flex items-center gap-2">
                                            {match.team1.name}
                                            {match.team1.runs > match.team2.runs && (
                                                <Trophy className="w-4 h-4 text-cricket-gold" />
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {calculateOvers(team1Balls)} overs • RR: {team1RunRate}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold tabular-nums">
                                        {match.team1.runs}<span className="text-xl text-muted-foreground">/{match.team1.wickets}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center gap-3 px-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs font-medium text-muted-foreground">VS</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Team 2 */}
                        <div className={`p-4 rounded-xl ${match.team2.runs > match.team1.runs ? 'bg-cricket-green/10 border border-cricket-green/20' : 'bg-muted/30'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                                        {match.team2.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg flex items-center gap-2">
                                            {match.team2.name}
                                            {match.team2.runs > match.team1.runs && (
                                                <Trophy className="w-4 h-4 text-cricket-gold" />
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {calculateOvers(team2Balls)} overs • RR: {team2RunRate}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold tabular-nums">
                                        {match.team2.runs}<span className="text-xl text-muted-foreground">/{match.team2.wickets}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scorecard - All Players */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Scorecard
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Team 1 Players */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                    {match.team1.name.charAt(0)}
                                </div>
                                {match.team1.name}
                            </h4>
                            <div className="space-y-2">
                                {match.team1.players.map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                                {player.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    {player.name}
                                                    {player.is_out && (
                                                        <span className="text-xs text-cricket-red">out</span>
                                                    )}
                                                    {!player.is_out && player.balls_faced > 0 && (
                                                        <span className="text-xs text-cricket-green">not out</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{player.runs_scored}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ({player.balls_faced} balls)
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Team 2 Players */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                    {match.team2.name.charAt(0)}
                                </div>
                                {match.team2.name}
                            </h4>
                            <div className="space-y-2">
                                {match.team2.players.map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                                {player.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    {player.name}
                                                    {player.is_out && (
                                                        <span className="text-xs text-cricket-red">out</span>
                                                    )}
                                                    {!player.is_out && player.balls_faced > 0 && (
                                                        <span className="text-xs text-cricket-green">not out</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{player.runs_scored}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ({player.balls_faced} balls)
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Live Match View (Original)
    return (
        <div className="space-y-6">
            {/* Main Scoreboard */}
            <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Live Score</CardTitle>
                        {isLive && (
                            <Badge variant="live">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5" />
                                LIVE
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Batting Team Score */}
                    <div className="text-center py-6 bg-muted/30 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">{battingTeam.name}</p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="cricket-score text-5xl">{battingTeam.runs}</span>
                            <span className="text-3xl text-muted-foreground">/{battingTeam.wickets}</span>
                        </div>
                        <p className="text-lg text-muted-foreground mt-2">
                            ({calculateOvers(totalBalls)} overs)
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20">
                            <div className="p-2 rounded-full bg-primary/10">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Run Rate</p>
                                <p className="text-xl font-bold">{runRate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Wickets Left</p>
                                <p className="text-xl font-bold">
                                    {Math.max(0, battingTeam.players.length - 1 - battingTeam.wickets)}
                                </p>
                            </div>
                        </div>
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
                        <div className="text-right">
                            <p className="text-xl font-bold tabular-nums">
                                {formatScore(bowlingTeam.runs, bowlingTeam.wickets)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Batsmen on Crease */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Batsmen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {batsmenOnCrease.length > 0 ? (
                        <div className="space-y-3">
                            {batsmenOnCrease.map((player) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center justify-between p-4 rounded-lg ${player.is_on_strike ? "bg-primary/10 border border-primary/20" : "bg-muted/20"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                            {player.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium flex items-center gap-2">
                                                {player.name}
                                                {player.is_on_strike && (
                                                    <span className="text-xs bg-cricket-green/20 text-cricket-green px-2 py-0.5 rounded-full">
                                                        On Strike
                                                    </span>
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
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            No batsmen on crease yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Current Over */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Timer className="w-5 h-5" />
                        Current Over
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                        {match.balls
                            .filter((b) => b.over_number === match.current_over)
                            .map((ball, idx) => (
                                <div
                                    key={ball.id}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${ball.is_wicket
                                        ? "bg-cricket-red/20 text-cricket-red border border-cricket-red/30"
                                        : ball.runs === 4
                                            ? "bg-cricket-green/20 text-cricket-green border border-cricket-green/30"
                                            : ball.runs === 6
                                                ? "bg-cricket-gold/20 text-cricket-gold border border-cricket-gold/30"
                                                : ball.is_no_ball
                                                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                                                    : "bg-muted border border-border"
                                        }`}
                                >
                                    {ball.is_wicket ? "W" : ball.is_no_ball ? "NB" : ball.runs}
                                </div>
                            ))}
                        {Array.from({ length: 6 - match.current_ball }).map((_, idx) => (
                            <div
                                key={`empty-${idx}`}
                                className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/20"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
