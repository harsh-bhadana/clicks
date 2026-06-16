"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Info } from "lucide-react";
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
            onClick={onClose}
            data-cursor="back"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-6 select-none cursor-pointer"
        >
            {/* Preload adjacent images */}
            {preloadUrls?.prev && <link rel="preload" as="image" href={preloadUrls.prev} />}
            {preloadUrls?.next && <link rel="preload" as="image" href={preloadUrls.next} />}

            {/* Top bar: Info toggle + Close */}
            <header className="absolute top-0 left-0 right-0 z-10 px-8 py-8 flex items-center justify-between pointer-events-none">
                {/* Info toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo((prev) => !prev);
                    }}
                    data-cursor="info"
                    className="pointer-events-auto flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] text-zinc-400 hover:text-white uppercase transition-all duration-300 group cursor-pointer"
                >
                    <Info
                        className={`h-4 w-4 transition-all duration-300 ${showInfo ? "text-white" : ""}`}
                    />
                    <span className="hidden sm:inline">{showInfo ? "Hide" : "Info"}</span>
                </button>

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    data-cursor="back"
                    className="pointer-events-auto flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] text-zinc-400 hover:text-white uppercase transition-all duration-300 group cursor-pointer"
                >
                    <X className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
                    <span>Back</span>
                </button>
            </header>

            {/* Previous Navigation Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                }}
                className="absolute left-6 z-20 h-12 w-12 rounded-full border border-white/10 bg-zinc-950/50 text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Navigation Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                }}
                className="absolute right-6 z-20 h-12 w-12 rounded-full border border-white/10 bg-zinc-950/50 text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Centered Image Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full h-full max-w-[85vw] max-h-[80vh] flex items-center justify-center pointer-events-none"
            >
                <Image
                    src={image.src}
                    alt={metadata.title || "Photo"}
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                />
            </div>

            {/* Image counter */}
            {totalImages && currentIndex && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[10px] font-mono tracking-[0.5em] text-zinc-600">
                    {currentIndex} / {totalImages}
                </div>
            )}

            {/* EXIF / Metadata overlay */}
            <PhotoInfo metadata={metadata} isVisible={showInfo} />
        </motion.div>
    );
}
