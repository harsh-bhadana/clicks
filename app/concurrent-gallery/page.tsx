import { Suspense } from "react";
import { getImages } from "../lib/images";
import ConcurrentGalleryClient from "./ConcurrentGalleryClient";

export const revalidate = 60;

export const metadata = {
    title: "Concurrent Gallery | use() + Suspense Specimen",
    description:
        "Netflix-style image gallery demonstrating React 19's use() hook with Suspense boundaries for concurrent data fetching — no useEffect, no isLoading state.",
};

/**
 * Server entry-point for the Concurrent Gallery specimen.
 *
 * The image list promise is initiated here on the server and threaded
 * into the client component, where `use()` unwraps it inside a Suspense
 * boundary. This is the canonical React 19 data-fetching pattern.
 */
export default function ConcurrentGalleryPage() {
    const imagePromise = getImages();

    return (
        <Suspense
            fallback={
                <div className="fixed inset-0 bg-black flex items-center justify-center">
                    <div className="text-white/30 text-sm tracking-[0.3em] uppercase animate-pulse">
                        Loading gallery…
                    </div>
                </div>
            }
        >
            <ConcurrentGalleryClient imagePromise={imagePromise} />
        </Suspense>
    );
}
