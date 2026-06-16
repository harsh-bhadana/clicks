"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
            {/* Top Close / Back Button */}
            <header className="absolute top-0 right-0 z-10 px-8 py-8">
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
                    alt=""
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                />
            </div>
        </motion.div>
    );
}
