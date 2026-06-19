"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Info } from "lucide-react";
import PhotoInfo from "./PhotoInfo";
import type { GalleryImage } from "../types";

interface LightboxProps {
    image: GalleryImage | null;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    /** Total number of images in the pool (for the counter). */
    totalImages?: number;
    /** Current 1-based index in the pool (for the counter). */
    currentIndex?: number;
    /** URLs of the previous and next images to preload. */
    preloadUrls?: { prev?: string; next?: string };
}

export default function Lightbox({
    image,
    onClose,
    onPrev,
    onNext,
    totalImages,
    currentIndex,
    preloadUrls,
}: LightboxProps) {
    const [showInfo, setShowInfo] = useState(false);

    // Body scroll lock
    useEffect(() => {
        if (image) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [image]);

    // Keyboard navigation
    useEffect(() => {
        if (!image) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "i" || e.key === "I") setShowInfo((prev) => !prev);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [image, onClose, onPrev, onNext]);

    // Reset info panel when image changes (ref-based to avoid setState in effect)
    const prevImageIdRef = useRef(image?.id);
    if (image?.id !== prevImageIdRef.current) {
        prevImageIdRef.current = image?.id;
        if (showInfo) setShowInfo(false);
    }

    if (!image) return null;

    const metadata = image.metadata || {};

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl select-none cursor-none"
        >
            {/* Preload adjacent images */}
            {preloadUrls?.prev && <link rel="preload" as="image" href={preloadUrls.prev} />}
            {preloadUrls?.next && <link rel="preload" as="image" href={preloadUrls.next} />}

            {/* 3-column Interactive Navigation Layout */}
            <div className="absolute inset-0 flex items-center z-10">
                {/* Left Area -> Previous */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrev();
                    }}
                    data-cursor="previous"
                    className="h-full w-[25vw] min-w-[60px] cursor-pointer pointer-events-auto"
                />

                {/* Center Area -> Back */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    data-cursor="back"
                    className="h-full flex-1 flex items-center justify-center cursor-pointer pointer-events-auto"
                >
                    {/* Centered Image Container */}
                    <div className="relative w-full h-full max-w-[85vw] max-h-[80vh] flex items-center justify-center pointer-events-none">
                        <Image
                            src={image.src}
                            alt={metadata.title || "Photo"}
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                </div>

                {/* Right Area -> Next */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    data-cursor="next"
                    className="h-full w-[25vw] min-w-[60px] cursor-pointer pointer-events-auto"
                />
            </div>

            {/* Minimal Info Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo((prev) => !prev);
                }}
                data-cursor="info"
                className="absolute bottom-6 left-6 z-30 h-10 w-10 rounded-full border border-white/10 bg-zinc-950/40 backdrop-blur-md text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 pointer-events-auto"
                title="Toggle Info"
            >
                <Info className="h-5 w-5" />
            </button>

            {/* Subtle Counter */}
            {totalImages && currentIndex && (
                <div className="absolute bottom-8 right-6 z-30 text-[11px] font-mono tracking-widest text-zinc-500 select-none pointer-events-none">
                    {currentIndex} / {totalImages}
                </div>
            )}

            {/* EXIF / Metadata overlay */}
            <PhotoInfo metadata={metadata} isVisible={showInfo} />
        </motion.div>
    );
}
