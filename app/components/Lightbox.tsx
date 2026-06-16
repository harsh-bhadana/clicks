"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
    X, Camera, MapPin, Calendar, Compass, Info, 
    ChevronLeft, ChevronRight, Copy, Check 
} from "lucide-react";
import type { GalleryImage } from "../types";

interface LightboxProps {
    image: GalleryImage | null;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

export default function Lightbox({
    image,
    onClose,
    onPrev,
    onNext,
}: LightboxProps) {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

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
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [image, onClose, onPrev, onNext]);

    if (!image) return null;

    const meta = image.metadata || {};
    const palette = meta.colorPalette || ["#09090b", "#27272a", "#52525b", "#a1a1aa", "#f4f4f5"];

    const handleCopyColor = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl md:p-6"
        >
            {/* Top Close Button & Logo */}
            <header className="absolute top-0 left-0 w-full z-10 px-6 py-6 flex justify-between items-center mix-blend-difference pointer-events-none">
                <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
                    <span>clicks &bull; detail mode</span>
                </div>
                <button
                    onClick={onClose}
                    className="pointer-events-auto flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] text-zinc-400 hover:text-white uppercase transition-all duration-300 group"
                >
                    <X className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
                    <span>Close</span>
                </button>
            </header>

            {/* Main Interactive Layout */}
            <div className="w-full h-full flex flex-col lg:flex-row max-w-7xl mx-auto rounded-3xl overflow-hidden bg-zinc-950/40 border border-white/5 shadow-2xl relative mt-12 lg:mt-0 lg:h-[82vh]">
                
                {/* 1. LEFT SIDE: IMAGE CONTAINER */}
                <div className="flex-1 relative flex items-center justify-center p-4 bg-black/40 group overflow-hidden select-none min-h-[40vh] lg:min-h-0">
                    
                    {/* Previous/Next Navigation Hotkeys */}
                    <button
                        onClick={onPrev}
                        className="absolute left-4 z-20 h-11 w-11 rounded-full border border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        onClick={onNext}
                        className="absolute right-4 z-20 h-11 w-11 rounded-full border border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Image View */}
                    <div className="relative w-full h-full max-h-[50vh] lg:max-h-full aspect-video lg:aspect-auto">
                        <Image
                            src={image.src}
                            alt={meta.title || "Selected Photo"}
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 1024px) 100vw, 70vw"
                            unoptimized
                        />
                    </div>
                </div>

                {/* 2. RIGHT SIDE: TECHNICAL & NARRATIVE HUD */}
                <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-zinc-950/80 p-6 md:p-8 flex flex-col justify-between overflow-y-auto font-sans">
                    
                    {/* Header info */}
                    <div className="space-y-6">
                        <div>
                            <span className="px-2.5 py-0.5 border border-purple-500/20 rounded-full text-[9px] tracking-widest font-mono text-purple-400 uppercase bg-purple-950/15">
                                {meta.category || "Study"}
                            </span>
                            <h2 className="text-xl font-bold tracking-tight text-white mt-3 uppercase font-sans">
                                {meta.title || "Untitled click"}
                            </h2>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-2 font-mono">
                                <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{meta.location || "Earth"}</span>
                                <span className="text-zinc-600">|</span>
                                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{meta.date || "Unknown date"}</span>
                            </div>
                        </div>

                        {/* Story block */}
                        {meta.story && (
                            <div className="border-t border-b border-white/5 py-4">
                                <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2 flex items-center gap-1.5">
                                    <Info className="h-3 w-3" /> Behind the lens
                                </h4>
                                <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                                    {meta.story}
                                </p>
                            </div>
                        )}

                        {/* Color Swatch Palette */}
                        <div>
                            <h4 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-3">
                                color palette (click to copy hex)
                            </h4>
                            <div className="flex gap-2">
                                {palette.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleCopyColor(color)}
                                        className="group relative flex-1 aspect-square rounded-xl border border-white/5 transition-all duration-300 hover:scale-105 hover:border-white/20 overflow-hidden flex items-center justify-center cursor-pointer shadow-lg"
                                        style={{ backgroundColor: color }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] font-mono text-white">
                                            {copiedColor === color ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {copiedColor && (
                                <span className="text-[9px] font-mono text-emerald-400 mt-1.5 block text-center animate-pulse uppercase tracking-wider">
                                    Copied hex {copiedColor} to clipboard!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* LCD style EXIF camera readout */}
                    <div className="mt-8 bg-black/60 border border-white/5 rounded-2xl p-5 font-mono text-xs text-zinc-400 space-y-3 shadow-inner relative overflow-hidden">
                        {/* Green LED glow in top right */}
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        
                        <div className="text-[9px] text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-2 font-bold">
                            exifr sensor status: ready
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 uppercase text-[10px]">device</span>
                            <span className="text-white text-right truncate pl-4 font-bold">{meta.camera || "Digital Capture"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600 uppercase text-[10px]">optics</span>
                            <span className="text-white text-right truncate pl-4 font-bold">{meta.lens || "Fixed Prime"}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 mt-3 text-center">
                            <div className="flex flex-col bg-zinc-900/40 p-1.5 rounded-lg border border-white/5">
                                <span className="text-[9px] text-zinc-600 uppercase mb-0.5">aperture</span>
                                <span className="text-white font-bold">{meta.aperture || "f/2.8"}</span>
                            </div>
                            <div className="flex flex-col bg-zinc-900/40 p-1.5 rounded-lg border border-white/5">
                                <span className="text-[9px] text-zinc-600 uppercase mb-0.5">shutter</span>
                                <span className="text-white font-bold">{meta.shutterSpeed || "1/125s"}</span>
                            </div>
                            <div className="flex flex-col bg-zinc-900/40 p-1.5 rounded-lg border border-white/5">
                                <span className="text-[9px] text-zinc-600 uppercase mb-0.5">iso</span>
                                <span className="text-white font-bold">{meta.iso || "100"}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </motion.div>
    );
}
