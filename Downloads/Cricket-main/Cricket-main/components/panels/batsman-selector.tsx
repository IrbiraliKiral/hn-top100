"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Player } from "@/types";

interface BatsmanSelectorProps {
    players: Player[];
    open: boolean;
    onSelect: (playerId: string) => void;
    title?: string;
    description?: string;
}

export function BatsmanSelector({
    players,
    open,
    onSelect,
    title = "Select Batsman",
    description = "Choose the batsman who will be on strike",
}: BatsmanSelectorProps) {
    const availablePlayers = players.filter((p) => !p.is_out);

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" hideCloseButton>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4 max-h-80 overflow-y-auto">
                    {availablePlayers.map((player) => (
                        <Button
                            key={player.id}
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => onSelect(player.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                                    {player.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">{player.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {player.runs_scored} runs ({player.balls_faced} balls)
                                    </p>
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
