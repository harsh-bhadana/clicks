import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "harsh2025bERSERK";
const SESSION_COOKIE_NAME = "clicks_admin_session";
const SESSION_TOKEN = "clicks_authorized_session_token_2026";

// Helper to check if authorized
async function isAuthorized() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session && session.value === SESSION_TOKEN;
}

export async function GET() {
    // Check if the user is logged in
    const auth = await isAuthorized();
    return NextResponse.json({ authorized: !!auth });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        // ── 1. Admin Login ───────────────────────────────────────────────────
        if (action === "login") {
            const { password } = body;
            if (password === ADMIN_PASSWORD) {
                const cookieStore = await cookies();
                cookieStore.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                    path: "/",
                });
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // ── 2. Admin Logout ──────────────────────────────────────────────────
        if (action === "logout") {
            const cookieStore = await cookies();
            cookieStore.delete(SESSION_COOKIE_NAME);
            return NextResponse.json({ success: true });
        }

        // All other actions require authorization
        if (!(await isAuthorized())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // ── 3. Save Metadata Map ─────────────────────────────────────────────
        if (action === "saveMetadata") {
            const { metadataMap } = body;
            if (!metadataMap) {
                return NextResponse.json({ error: "Metadata map is required" }, { status: 400 });
            }

            // Write metadata.json to Vercel Blob with constant pathname
            const blob = await put("gallery/metadata.json", JSON.stringify(metadataMap, null, 2), {
                access: "public",
                addRandomSuffix: false,
                contentType: "application/json",
            });

            // Revalidate Next.js cache
            revalidatePath("/");

            return NextResponse.json({ success: true, url: blob.url });
        }

        // ── 4. Delete Image Blob ─────────────────────────────────────────────
        if (action === "deleteImage") {
            const { url } = body;
            if (!url) {
                return NextResponse.json({ error: "URL is required for deletion" }, { status: 400 });
            }

            await del(url);

            // Revalidate Next.js cache
            revalidatePath("/");

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err: any) {
        console.error("Error in admin API route:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
