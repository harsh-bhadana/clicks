"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Lightbox from "./Lightbox";
import type { GalleryImage } from "../types";

interface PhotoModalProps {
    image: GalleryImage;
    prevId: number;
    nextId: number;
}

/**
 * Route-aware Lightbox wrapper rendered by the @modal intercepting route.
 *
 * - Close: plays exit animation then calls router.push('/') to return to gallery.
 * - Next/Prev: uses router.replace() so browser-back always returns to gallery,
 *   never to a previous photo in the middle of the stack.
 * - The isVisible trick gives Lightbox's AnimatePresence time to play its
 *   exit animation before the navigation commits.
 */
export default function PhotoModal({ image, prevId, nextId }: PhotoModalProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset visibility and cancel any pending close if image changes (next/prev nav).
    useEffect(() => {
        setIsVisible(true);
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, [image.id]);

    // Cleanup pending timers on unmount.
    useEffect(() => {
        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Allow Lightbox exit animation (duration: 0.5s) to complete first.
        closeTimerRef.current = setTimeout(() => router.push("/"), 600);
    };

    const handleNext = () => router.replace(`/photo/${nextId}`, { scroll: false });
    const handlePrev = () => router.replace(`/photo/${prevId}`, { scroll: false });

    return (
        <Lightbox
            image={isVisible ? image : null}
            onClose={handleClose}
            onNext={handleNext}
            onPrev={handlePrev}
        />
    );
}
