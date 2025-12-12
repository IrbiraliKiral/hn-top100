"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MatchCard } from "@/components/visitor/match-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/utils/constants";
import { Search, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MatchWithTeams } from "@/types";

export default function VisitorPage() {
    const [matches, setMatches] = useState<MatchWithTeams[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");

    useEffect(() => {
        fetchMatches();

        // Set up real-time subscription
        const supabase = createClient();
        const subscription = supabase
            .channel("matches-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "matches" },
                () => {
                    fetchMatches();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "teams" },
                () => {
                    fetchMatches();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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

    const filteredMatches = matches.filter((match) => {
        const matchesSearch =
            match.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.team1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.team2.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === "all" || match.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const liveCount = matches.filter((m) => m.status === "live").length;

    return (
        <>
            <Header showPanelLogin />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-16 px-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

                    <div className="container mx-auto max-w-7xl relative">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <Trophy className="w-12 h-12 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                {APP_NAME}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Watch live matches, track scores, and follow your favorite teams
                            </p>
                            {liveCount > 0 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Badge variant="live" className="text-sm px-4 py-1">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                                        {liveCount} Live {liveCount === 1 ? "Match" : "Matches"}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Matches Section */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-7xl">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search matches or teams..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(["all", "live", "upcoming", "completed"] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Match Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-48 w-full rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredMatches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMatches.map((match) => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                                <p className="text-muted-foreground">
                                    {searchQuery || activeFilter !== "all"
                                        ? "Try adjusting your search or filter"
                                        : "Matches will appear here when created"}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
