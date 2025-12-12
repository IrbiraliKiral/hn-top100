"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import { formatScore } from "@/helpers/cricket-utils";
import { createClient } from "@/lib/supabase/client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Settings, ChevronRight, Trophy, Play, History } from "lucide-react";
import type { MatchWithTeams } from "@/types";

export default function PanelDashboardPage() {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchWithTeams[]>([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
            fetchMatches();
        } catch (error) {
            console.error("Auth check failed:", error);
            router.push("/panel/login");
        }
    };

    const fetchMatches = async () => {
        try {
            const supabase = createClient();

            const { data: matchesData, error: matchesError } = await supabase
                .from("matches")
                .select("*")
                .order("created_at", { ascending: false });

            if (matchesError) {
                console.error("Error fetching matches:", matchesError);
                setLoading(false);
                return;
            }

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

    const filteredMatches = matches.filter(
        (match) =>
            match.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.team1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.team2.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!authChecked) {
        return (
            <>
                <Header />
                <main className="flex-1 py-8 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <Skeleton className="h-12 w-48 mb-8" />
                        <Skeleton className="h-10 w-64 mb-8" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
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
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Settings className="w-8 h-8 text-primary" />
                                Control Panel
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage matches and update scores
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="lg" className="gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Match
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/panel/create-match" className="flex items-center gap-3 cursor-pointer">
                                        <Play className="w-4 h-4 text-cricket-green" />
                                        <div>
                                            <p className="font-medium">Create Live Match</p>
                                            <p className="text-xs text-muted-foreground">Track match ball-by-ball</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/panel/create-match?type=completed" className="flex items-center gap-3 cursor-pointer">
                                        <History className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="font-medium">Already Played Match</p>
                                            <p className="text-xs text-muted-foreground">Add completed match data</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search matches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Matches List */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Your Matches
                        </h2>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : filteredMatches.length > 0 ? (
                            <div className="space-y-3">
                                {filteredMatches.map((match) => (
                                    <Link key={match.id} href={`/panel/match/${match.id}`}>
                                        <Card className="match-card-hover glass-card cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                #{match.match_number}
                                                            </span>
                                                            <span className="font-medium">{match.heading}</span>
                                                            {match.status === "live" && (
                                                                <Badge variant="live" className="text-xs">
                                                                    LIVE
                                                                </Badge>
                                                            )}
                                                            {match.status === "upcoming" && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Upcoming
                                                                </Badge>
                                                            )}
                                                            {match.status === "completed" && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Completed
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span>
                                                                {match.team1.name}: {formatScore(match.team1.runs, match.team1.wickets)}
                                                            </span>
                                                            <span className="text-muted-foreground">vs</span>
                                                            <span>
                                                                {match.team2.name}: {formatScore(match.team2.runs, match.team2.wickets)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="glass-card">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <Trophy className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first match to get started
                                    </p>
                                    <Link href="/panel/create-match">
                                        <Button className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Create Match
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
