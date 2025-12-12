"use client";

import { RoleSelectionModal } from "@/components/modals/role-selection-modal";

export default function HomePage() {
    return (
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
            </div>
            <RoleSelectionModal />
        </main>
    );
}
