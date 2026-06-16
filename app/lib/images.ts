import { unstable_cache } from "next/cache";
import { list } from "@vercel/blob";
import type { GalleryImage, PhotoMetadata } from "../types";

// Dynamic default palette generator
const DEFAULT_PALETTES = [
    ["#09090b", "#18181b", "#3f3f46", "#71717a", "#d4d4d8"], // Slate Monochromatic
    ["#0f172a", "#1e293b", "#475569", "#94a3b8", "#cbd5e1"], // Slate Blue
    ["#1c1917", "#292524", "#57534e", "#a8a29e", "#e7e5e4"], // Stone Warm
    ["#022c22", "#064e3b", "#0f766e", "#14b8a6", "#99f6e4"], // Teal Forest
    ["#1e1b4b", "#312e81", "#4f46e5", "#818cf8", "#c7d2fe"], // Indigo Night
];

function generateDefaultMetadata(pathname: string, id: number): PhotoMetadata {
    const isClick = pathname.includes("click_");
    const nameClean = pathname
        .replace("gallery/", "")
        .replace(/\.(jpg|jpeg|png|webp|heic|avif)$/i, "");
    
    // Category mapping based on ID for visual diversity
    const categories = ["Street", "Landscape", "Travel", "Minimal", "Portrait"];
    const category = categories[id % categories.length];

    const cameras = ["Sony A7IV", "Fujifilm X-T5", "iPhone 15 Pro", "Canon R6 Mark II"];
    const camera = cameras[id % cameras.length];

    const lenses = ["35mm f/1.4 Prime", "50mm f/1.2 G-Master", "24-70mm f/2.8 Zoom", "18-55mm f/2.8-4.0"];
    const lens = lenses[id % lenses.length];

    const locations = ["Kyoto, Japan", "London, UK", "New York City, USA", "Auckland, New Zealand", "Berlin, Germany"];
    const location = locations[id % locations.length];

    const dates = ["Spring 2024", "Winter 2025", "Summer 2024", "Autumn 2025"];
    const date = dates[id % dates.length];

    return {
        title: isClick ? `Click Frame ${id}` : `Study in ${nameClean.replace(/[_-]/g, " ")}`,
        location,
        date,
        category,
        camera,
        lens,
        aperture: id % 2 === 0 ? "f/1.8" : "f/4.0",
        shutterSpeed: id % 2 === 0 ? "1/250s" : "1/1000s",
        iso: id % 3 === 0 ? "100" : id % 3 === 1 ? "400" : "800",
        story: `A candid study capturing the light, texture, and atmosphere of ${location}. Part of an ongoing visual diary exploring spatial intimacy.`,
        colorPalette: DEFAULT_PALETTES[id % DEFAULT_PALETTES.length],
    };
}

/**
 * Fetches and processes all gallery images and merges them with metadata.json if it exists.
 */
export const getImages = unstable_cache(
    async (): Promise<GalleryImage[]> => {
        // console.log("Fetching blobs from server...");
        const { blobs } = await list({ prefix: "gallery/" });

        // Find metadata.json if it exists
        const metadataBlob = blobs.find((blob) => blob.pathname === "gallery/metadata.json");
        let metadataMap: Record<string, PhotoMetadata> = {};

        if (metadataBlob) {
            try {
                const response = await fetch(metadataBlob.url);
                if (response.ok) {
                    metadataMap = await response.json();
                }
            } catch (err) {
                console.error("Error loading metadata.json from Vercel Blob:", err);
            }
        }

        return blobs
            .filter((blob) => blob.pathname.match(/\.(jpg|jpeg|png|webp|heic|avif)$/i))
            .sort((a, b) => {
                const numA = parseInt(a.pathname.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.pathname.match(/\d+/)?.[0] || "0");
                return numA - numB;
            })
            .map((blob, index) => {
                const id = parseInt(blob.pathname.match(/\d+/)?.[0] || String(index + 1));
                const customMetadata = metadataMap[blob.pathname];
                const finalMetadata = customMetadata 
                    ? { ...generateDefaultMetadata(blob.pathname, id), ...customMetadata }
                    : generateDefaultMetadata(blob.pathname, id);

                return {
                    src: blob.url,
                    id,
                    pathname: blob.pathname,
                    metadata: finalMetadata,
                };
            });
    },
    ["gallery-images"], // Cache key
    { revalidate: 3600, tags: ["gallery"] } // Cache for 1 hour
);
