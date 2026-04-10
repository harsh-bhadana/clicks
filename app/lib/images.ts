import { unstable_cache } from "next/cache";
import { list } from "@vercel/blob";
import type { GalleryImage } from "../types";

/**
 * Fetches and processes all gallery images from Vercel Blob storage.
 *
 * Wrapped in Next.js `unstable_cache()` so the blob list is cached across 
 * all users and request navigations for 3600 seconds. This eliminates 
 * the delay of listing blobs every time a photo is clicked.
 */
export const getImages = unstable_cache(
    async (): Promise<GalleryImage[]> => {
        // console.log("Fetching blobs from server...");
        const { blobs } = await list({ prefix: "gallery/" });

        return blobs
            .filter((blob) => blob.pathname.match(/\.(jpg|jpeg|png|webp|heic|avif)$/i))
            .sort((a, b) => {
                const numA = parseInt(a.pathname.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.pathname.match(/\d+/)?.[0] || "0");
                return numA - numB;
            })
            .map((blob, index) => ({
                src: blob.url,
                id: parseInt(blob.pathname.match(/\d+/)?.[0] || String(index + 1)),
            }));
    },
    ["gallery-images"], // Cache key
    { revalidate: 3600, tags: ["gallery"] } // Cache for 1 hour
);
