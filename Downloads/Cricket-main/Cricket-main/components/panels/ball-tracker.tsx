"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { BALL_OUTCOMES } from "@/utils/constants";
import { Plus, Minus, Target } from "lucide-react";
import type { BallOutcome } from "@/types";

interface BallTrackerProps {
    currentOver: number;
    currentBall: number;
    onAddBall: (outcome: BallOutcome) => void;
    onRemoveBall: () => void;
    disabled?: boolean;
}

export function BallTracker({
    currentOver,
    currentBall,
    onAddBall,
    onRemoveBall,
    disabled = false,
}: BallTrackerProps) {
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);

    const handleAddClick = () => {
        setShowOutcomeModal(true);
    };

    const handleOutcomeSelect = (outcome: BallOutcome) => {
        onAddBall(outcome);
        setShowOutcomeModal(false);
    };

    const getOutcomeStyle = (outcome: BallOutcome) => {
        switch (outcome) {
            case 4:
                return "bg-cricket-green/20 text-cricket-green border-cricket-green/30 hover:bg-cricket-green/30";
            case 6:
                return "bg-cricket-gold/20 text-cricket-gold border-cricket-gold/30 hover:bg-cricket-gold/30";
            case "OUT":
                return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
            case "NOBALL":
                return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30";
            default:
                return "bg-muted hover:bg-muted/80";
        }
    };

    return (
        <>
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Ball Tracker
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Over</p>
                            <p className="text-3xl font-bold tabular-nums">
                                {currentOver}.{currentBall}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 text-center opacity-60">
                            <p className="text-sm text-muted-foreground mb-1">Auto Updated</p>
                            <p className="text-xl font-medium text-muted-foreground">
                                Runs & Overs
                            </p>
                        </div>
                    </div>

                    {/* Ball Controls */}
                    <div className="flex items-center justify-center gap-6">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-20 h-20 rounded-full text-2xl"
                            onClick={onRemoveBall}
                            disabled={disabled || (currentOver === 0 && currentBall === 0)}
                        >
                            <Minus className="w-8 h-8" />
                        </Button>

                        <Button
                            variant="default"
                            size="lg"
                            className="w-24 h-24 rounded-full text-2xl button-glow"
                            onClick={handleAddClick}
                            disabled={disabled}
                        >
                            <Plus className="w-10 h-10" />
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Use <span className="font-medium">+</span> to add a ball,{" "}
                        <span className="font-medium">-</span> to undo
                    </p>
                </CardContent>
            </Card>

            {/* Outcome Selection Modal */}
            <Dialog open={showOutcomeModal} onOpenChange={setShowOutcomeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ball Outcome</DialogTitle>
                        <DialogDescription>
                            Select the outcome for this ball
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-3 py-4">
                        {BALL_OUTCOMES.map((outcome) => (
                            <Button
                                key={outcome.toString()}
                                variant="outline"
                                className={`h-16 text-lg font-bold ${getOutcomeStyle(outcome)}`}
                                onClick={() => handleOutcomeSelect(outcome)}
                            >
                                {outcome}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
