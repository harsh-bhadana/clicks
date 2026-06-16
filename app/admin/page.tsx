import { getImages } from "../lib/images";
import AdminClient from "./AdminClient";

export const revalidate = 0; // Dynamic rendering for admin dashboard

export default async function AdminPage() {
    // Fetch current images and metadata to bootstrap the editor
    const initialImages = await getImages();

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-purple-500/20">
            <AdminClient initialImages={initialImages} />
        </main>
    );
}
