"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatScore, calculateOvers } from "@/helpers/cricket-utils";
import type { MatchWithTeams } from "@/types";
import { ChevronRight } from "lucide-react";

interface MatchCardProps {
    match: MatchWithTeams;
}

export function MatchCard({ match }: MatchCardProps) {
    const isLive = match.status === "live";
    const isCompleted = match.status === "completed";

    const getBattingTeam = () => {
        if (match.current_batting_team === match.team1.id) {
            return match.team1;
        }
        return match.team2;
    };

    const getBowlingTeam = () => {
        if (match.current_batting_team === match.team1.id) {
            return match.team2;
        }
        return match.team1;
    };

    const battingTeam = getBattingTeam();
    const bowlingTeam = getBowlingTeam();
    const totalBalls = match.current_over * 6 + match.current_ball;

    return (
        <Link href={`/visitor/match/${match.id}`}>
            <Card className="match-card-hover glass-card overflow-hidden group cursor-pointer">
                <CardContent className="p-0">
                    {/* Match Header */}
                    <div className="px-6 py-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Match #{match.match_number}
                            </span>
                            {isLive && (
                                <Badge variant="live" className="text-xs">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5" />
                                    LIVE
                                </Badge>
                            )}
                            {isCompleted && (
                                <Badge variant="secondary" className="text-xs">
                                    Completed
                                </Badge>
                            )}
                            {match.status === "upcoming" && (
                                <Badge variant="outline" className="text-xs">
                                    Upcoming
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-semibold mt-1 text-sm">{match.heading}</h3>
                    </div>

                    {/* Teams Display */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Team 1 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {match.team1.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{match.team1.name}</p>
                                    {isLive && match.current_batting_team === match.team1.id && (
                                        <span className="text-xs text-cricket-green">Batting</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold tabular-nums">
                                    {formatScore(match.team1.runs, match.team1.wickets)}
                                </p>
                                {match.current_batting_team === match.team1.id && isLive && (
                                    <p className="text-xs text-muted-foreground">
                                        ({calculateOvers(totalBalls)} ov)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs font-medium text-muted-foreground">VS</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Team 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {match.team2.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{match.team2.name}</p>
                                    {isLive && match.current_batting_team === match.team2.id && (
                                        <span className="text-xs text-cricket-green">Batting</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold tabular-nums">
                                    {formatScore(match.team2.runs, match.team2.wickets)}
                                </p>
                                {match.current_batting_team === match.team2.id && isLive && (
                                    <p className="text-xs text-muted-foreground">
                                        ({calculateOvers(totalBalls)} ov)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* View Match */}
                    <div className="px-6 py-3 bg-muted/30 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">View Details</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
