import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "panel_session";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

        if (!sessionCookie) {
            return NextResponse.json({ authenticated: false });
        }

        try {
            const sessionData = JSON.parse(
                Buffer.from(sessionCookie.value, "base64").toString()
            );

            // Check if session is expired
            if (sessionData.expires && sessionData.expires < Date.now()) {
                cookieStore.delete(AUTH_COOKIE_NAME);
                return NextResponse.json({ authenticated: false });
            }

            return NextResponse.json({
                authenticated: sessionData.authenticated === true
            });
        } catch {
            // Invalid cookie format
            cookieStore.delete(AUTH_COOKIE_NAME);
            return NextResponse.json({ authenticated: false });
        }
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json({ authenticated: false });
    }
}
