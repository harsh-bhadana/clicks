"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Lightbox from "@/app/components/Lightbox";
import type { GalleryImage } from "@/app/types";

interface PhotoPageClientProps {
    image: GalleryImage;
    allImages: GalleryImage[];
}

/**
 * Client wrapper for the photo permalink route.
 *
 * Opens the Lightbox immediately for the target image.
 * Navigating prev/next updates the URL. Closing returns to the gallery.
 */
export default function PhotoPageClient({ image, allImages }: PhotoPageClientProps) {
    const router = useRouter();
    const [current, setCurrent] = useState<GalleryImage>(image);

    const currentIndex = allImages.findIndex((img) => img.id === current.id);

    const handlePrev = useCallback(() => {
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        const prev = allImages[prevIndex];
        setCurrent(prev);
        window.history.replaceState(null, "", `/photo/${prev.id}`);
    }, [currentIndex, allImages]);

    const handleNext = useCallback(() => {
        const nextIndex = (currentIndex + 1) % allImages.length;
        const next = allImages[nextIndex];
        setCurrent(next);
        window.history.replaceState(null, "", `/photo/${next.id}`);
    }, [currentIndex, allImages]);

    const handleClose = useCallback(() => {
        router.push("/");
    }, [router]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose, handlePrev, handleNext]);

    return (
        <main className="w-screen h-screen bg-black">
            <AnimatePresence>
                <Lightbox
                    image={current}
                    onClose={handleClose}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            </AnimatePresence>
        </main>
    );
}
