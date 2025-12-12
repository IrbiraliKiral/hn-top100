import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "panel_session";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(AUTH_COOKIE_NAME);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
