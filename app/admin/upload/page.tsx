import { getImages } from "../../lib/images";
import UploadClient from "./UploadClient";

export const revalidate = 0; // Dynamic rendering for upload

export default async function UploadPage() {
    // Fetch current images to append newly uploaded image to the list
    const initialImages = await getImages();

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-purple-500/20">
            <UploadClient initialImages={initialImages} />
        </main>
    );
}
