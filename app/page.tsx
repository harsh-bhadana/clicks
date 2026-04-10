import { Suspense } from "react";
import { getImages } from "./lib/images";
import HomeClient from "./HomeClient";

export const revalidate = 60;

/**
 * Single Page Entry Point.
 * 
 * Strict Single-Page Architecture:
 * - No sub-routes.
 * - All state (including the modal) is handled in-memory in HomeClient.
 * - This provides the fastest possible "single app" experience.
 */
export default function Page() {
    const imagePromise = getImages();

    return (
        <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
            <HomeClient imagePromise={imagePromise} />
        </Suspense>
    );
}
