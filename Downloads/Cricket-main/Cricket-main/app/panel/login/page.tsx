"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { PANEL_PASSWORD_LENGTH } from "@/utils/constants";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";

export default function PanelLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length !== PANEL_PASSWORD_LENGTH) {
            setError(`Password must be ${PANEL_PASSWORD_LENGTH} digits`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                router.push("/panel");
                router.refresh();
            } else {
                setError(data.error || "Invalid password. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to connect. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, PANEL_PASSWORD_LENGTH);
        setPassword(value);
        if (error) setError("");
    };

    return (
        <>
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                </div>

                <Card className="w-full max-w-md glass-card relative z-10">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Panel Access</CardTitle>
                        <CardDescription className="text-base">
                            Enter your 16-digit password to access the control panel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter 16-digit password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`text-center text-lg tracking-widest font-mono ${error ? "border-destructive" : ""
                                        }`}
                                    autoComplete="off"
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{password.length} / {PANEL_PASSWORD_LENGTH} digits</span>
                                    {password.length === PANEL_PASSWORD_LENGTH && (
                                        <span className="text-cricket-green flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Ready
                                        </span>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={password.length !== PANEL_PASSWORD_LENGTH || loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    "Access Panel"
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-xs text-muted-foreground mt-6">
                            Protected by server-side authentication
                        </p>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
