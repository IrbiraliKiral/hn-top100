"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { APP_NAME } from "@/utils/constants";
import { Trophy, LayoutDashboard, LogOut, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    showPanelNav?: boolean;
    showPanelLogin?: boolean;
    onLogout?: () => void;
}

export function Header({ showPanelNav = false, showPanelLogin = false, onLogout }: HeaderProps) {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <Trophy className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
                        {APP_NAME}
                    </span>
                </Link>

                <nav className="flex items-center gap-2">
                    {/* Panel Login button for visitors */}
                    {showPanelLogin && (
                        <Link href="/panel/login">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Lock className="h-4 w-4" />
                                <span className="hidden sm:inline">Panel Login</span>
                            </Button>
                        </Link>
                    )}

                    {/* Panel navigation for authenticated users */}
                    {showPanelNav && (
                        <>
                            <Link href="/panel">
                                <Button
                                    variant={pathname === "/panel" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Button>
                            </Link>
                            {onLogout && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                    className="gap-2 text-destructive hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            )}
                        </>
                    )}
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
