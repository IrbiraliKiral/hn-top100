import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PANEL_PASSWORD = process.env.PANEL_PASSWORD || "1234567890123456";
const AUTH_COOKIE_NAME = "panel_session";
const AUTH_TOKEN = "authenticated_panel_user_" + Date.now();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { error: "Password is required" },
                { status: 400 }
            );
        }

        if (password !== PANEL_PASSWORD) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        // Create a secure session token
        const sessionToken = Buffer.from(
            JSON.stringify({
                authenticated: true,
                timestamp: Date.now(),
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            })
        ).toString("base64");

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60, // 24 hours
            path: "/",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
