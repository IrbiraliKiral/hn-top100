"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Settings, Trophy } from "lucide-react";
import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import type { UserRole } from "@/types";

export function RoleSelectionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedRole = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ROLE);
        if (!savedRole) {
            setIsOpen(true);
        } else if (savedRole === "visitor") {
            router.push("/visitor");
        } else if (savedRole === "panel") {
            const isAuthed = localStorage.getItem(LOCAL_STORAGE_KEYS.PANEL_AUTH);
            if (isAuthed) {
                router.push("/panel");
            } else {
                router.push("/panel/login");
            }
        }
    }, [router]);

    const handleRoleSelect = (role: UserRole) => {
        if (role) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ROLE, role);
            setIsOpen(false);

            if (role === "visitor") {
                router.push("/visitor");
            } else {
                router.push("/panel/login");
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" hideCloseButton>
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Welcome to Cricket Dashboard
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Choose how you want to access the tournament
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-6">
                    <Button
                        variant="outline"
                        className="h-auto p-6 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                        onClick={() => handleRoleSelect("visitor")}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Eye className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">I&apos;m a Viewer</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Watch live matches and scores
                            </p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-6 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                        onClick={() => handleRoleSelect("panel")}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Settings className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">Access Control Panel</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage matches and update scores
                            </p>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
