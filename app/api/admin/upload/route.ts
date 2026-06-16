import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const SESSION_COOKIE_NAME = "clicks_admin_session";
const SESSION_TOKEN = "clicks_authorized_session_token_2026";

async function isAuthorized() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session && session.value === SESSION_TOKEN;
}

export async function POST(request: Request) {
    try {
        // Check authentication
        if (!(await isAuthorized())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Sanitize filename and construct Vercel Blob path
        const originalName = file.name;
        const extension = originalName.split(".").pop();
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `gallery/${timestamp}_${randomStr}.${extension}`;

        // Upload directly to Vercel Blob
        const blob = await put(fileName, file, {
            access: "public",
            contentType: file.type,
        });

        // Revalidate Next.js cache
        revalidatePath("/");

        return NextResponse.json({
            success: true,
            url: blob.url,
            pathname: blob.pathname,
            filename: originalName,
        });
    } catch (err) {
        console.error("Error uploading image to Vercel Blob:", err);
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
