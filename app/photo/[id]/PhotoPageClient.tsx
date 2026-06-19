"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Camera,
    MapPin,
    Calendar,
    Aperture,
    Timer,
    Gauge,
    ArrowLeft,
    Compass,
    ChevronLeft,
    ChevronRight,
    X,
    ExternalLink,
    Sliders,
    Zap,
    Database,
} from "lucide-react";
import type { GalleryImage } from "@/app/types";

interface PhotoPageClientProps {
    image: GalleryImage;
    allImages: GalleryImage[];
}

export default function PhotoPageClient({ image, allImages }: PhotoPageClientProps) {
    const router = useRouter();
    const [current, setCurrent] = useState<GalleryImage>(image);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

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

    if (!isMounted) return null;

    const metadata = current.metadata || {};
    const hasCoordinates =
        metadata.gpsLatitude !== undefined && metadata.gpsLongitude !== undefined;

    return (
        <main className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row relative">
            {/* Top Bar for Back button on Mobile */}
            <div className="lg:hidden w-full flex items-center justify-between p-4 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={handleClose}
                    className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-400 hover:text-white uppercase"
                >
                    <ArrowLeft className="w-4 h-4" /> Close
                </button>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {currentIndex + 1} / {allImages.length}
                </div>
            </div>

            {/* Left Side: Photo Showcase */}
            <div className="flex-1 lg:h-screen lg:sticky lg:top-0 bg-black flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden group">
                {/* Floating controls inside image area (Desktop) */}
                <button
                    onClick={handleClose}
                    className="hidden lg:flex absolute top-6 left-6 z-40 items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900/60 backdrop-blur-md text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                    title="Back to Gallery (Esc)"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left/Right floating chevrons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 z-40 w-10 h-20 rounded-2xl flex items-center justify-center bg-zinc-900/10 hover:bg-zinc-900/40 border border-white/0 hover:border-white/5 text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100"
                    title="Previous Photo (Left Arrow)"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 z-40 w-10 h-20 rounded-2xl flex items-center justify-center bg-zinc-900/10 hover:bg-zinc-900/40 border border-white/0 hover:border-white/5 text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100"
                    title="Next Photo (Right Arrow)"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image display */}
                <div className="relative w-full h-[60vh] lg:h-full max-w-[85vw] max-h-[75vh] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <Image
                                src={current.src}
                                alt={metadata.title || "Gallery photo"}
                                fill
                                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none pointer-events-none"
                                priority
                                unoptimized
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side: Scrollable Details Panel */}
            <div className="w-full lg:w-[450px] xl:w-[500px] lg:h-screen lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/5 bg-zinc-950/60 backdrop-blur-3xl flex flex-col justify-between shrink-0">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Desktop Back button */}
                    <div className="hidden lg:flex justify-between items-center">
                        <button
                            onClick={handleClose}
                            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Gallery
                        </button>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            {currentIndex + 1} / {allImages.length}
                        </span>
                    </div>

                    {/* Photo Title & Main Metadata */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {metadata.category && (
                                <span className="text-[9px] font-mono tracking-wider font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full uppercase">
                                    {metadata.category}
                                </span>
                            )}
                            {metadata.date && (
                                <span className="text-[9px] font-mono tracking-wider text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-zinc-500" />
                                    {metadata.date}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-white leading-tight">
                            {metadata.title || `Frame ${current.id}`}
                        </h1>

                        {metadata.location && (
                            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{metadata.location}</span>
                                {hasCoordinates && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${metadata.gpsLatitude},${metadata.gpsLongitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-600 hover:text-purple-400 transition-colors ml-1"
                                        title="View on Google Maps"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Story / Description */}
                    {metadata.story && (
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                                Story behind the shot
                            </h3>
                            <p className="text-zinc-300 text-xs leading-relaxed font-light">
                                {metadata.story}
                            </p>
                        </div>
                    )}

                    {/* EXIF Data Grid */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                        <h3 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                            EXIF Specifications
                        </h3>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                <Camera className="w-4 h-4 text-purple-400 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                        Camera
                                    </span>
                                    <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                        {metadata.camera || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3 col-span-2">
                                <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                        Lens Specifications
                                    </span>
                                    <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                        {metadata.lens || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                <Aperture className="w-4 h-4 text-purple-400 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                        Aperture
                                    </span>
                                    <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                        {metadata.aperture || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                <Timer className="w-4 h-4 text-purple-400 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                        Shutter
                                    </span>
                                    <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                        {metadata.shutterSpeed || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                <Gauge className="w-4 h-4 text-purple-400 shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                        ISO Speed
                                    </span>
                                    <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                        {metadata.iso || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                <span className="text-[11px] font-bold text-purple-400 text-center w-4 shrink-0 font-serif">
                                    ƒ
                                </span>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                        Focal Length
                                    </span>
                                    <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                        {metadata.focalLength || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Exposure Bias */}
                            {metadata.exposureBias && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                    <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                            Exposure Bias
                                        </span>
                                        <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                            {metadata.exposureBias}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Flash */}
                            {metadata.flash && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3">
                                    <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                            Flash
                                        </span>
                                        <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                            {metadata.flash}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* File Details */}
                            {(metadata.fileSize || metadata.dimensions || metadata.megapixels) && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-neutral-900/20 p-3 col-span-2">
                                    <Database className="w-4 h-4 text-purple-400 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-mono text-zinc-500 block uppercase leading-none mb-0.5">
                                            File details
                                        </span>
                                        <span className="text-[11px] text-zinc-300 block truncate font-medium">
                                            {[
                                                metadata.fileSize,
                                                metadata.dimensions,
                                                metadata.megapixels,
                                            ]
                                                .filter(Boolean)
                                                .join("  |  ")}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="border-t border-white/5 bg-zinc-950/80 p-6 flex justify-between items-center gap-4">
                    <button
                        onClick={handlePrev}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-mono text-zinc-400 hover:text-white uppercase transition-all active:scale-98 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-mono text-zinc-400 hover:text-white uppercase transition-all active:scale-98 cursor-pointer"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </main>
    );
}
