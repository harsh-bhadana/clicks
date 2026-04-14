"use client";

import { use } from "react";
import Image from "next/image";

interface HiResPreviewProps {
    hiResPromise: Promise<string>;
    alt: string;
}

/**
 * The star of the specimen.
 *
 * This component calls `use(hiResPromise)` directly in render — no
 * useEffect, no useState, no isLoading flag. When the promise is still
 * pending, React suspends this component and the parent Suspense
 * boundary renders the low-res fallback. Once the promise resolves,
 * React re-renders this component with the resolved hi-res URL.
 *
 * Combined with `startTransition` in the parent (which wraps the
 * `setHiResPromise` call), the currently displayed thumbnail stays
 * interactive while the hi-res version loads in the background.
 */
export default function HiResPreview({ hiResPromise, alt }: HiResPreviewProps) {
    // ⚡ This is the entire data-fetching pattern.
    // No useEffect. No isLoading. Just `use()`.
    const resolvedSrc = use(hiResPromise);

    return (
        <div className="relative aspect-[16/10] w-full">
            <Image
                src={resolvedSrc}
                alt={alt}
                fill
                sizes="420px"
                className="object-cover"
                quality={95}
                priority
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
        </div>
    );
}
