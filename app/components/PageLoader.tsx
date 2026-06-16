"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "../types";

interface PageLoaderProps {
    images: GalleryImage[];
}

/**
 * An artistic, editorial loading component.
 * Displays the branding text "CLICKS" in the center (background), which slowly
 * fades, blurs, and expands as the progress increments to 100%.
 * Overlying the text, a horizontal carousel of gallery images sweeps across the viewport.
 */
export default function PageLoader({ images = [] }: PageLoaderProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        document.body.classList.add("no-scroll");

        let current = 0;
        const duration = 2800; // 2.8s total loading sweep
        const stepTime = 40;
        const totalSteps = duration / stepTime;

        const interval = setInterval(() => {
            current += 100 / totalSteps;
            if (current >= 100) {
                current = 100;
                clearInterval(interval);
                // Leave a tiny gap of 400ms for visual finish before unmounting loader
                setTimeout(() => {
                    setIsVisible(false);
                    document.body.classList.remove("no-scroll");
                }, 400);
            }
            setProgress(Math.floor(current));
        }, stepTime);

        return () => {
            clearInterval(interval);
            document.body.classList.remove("no-scroll");
        };
    }, []);

    // Filter down to first 5 images for the loading sweep
    const carouselImages = images && images.length > 0 ? images.slice(0, 5) : [];

    // Editorial rotation classes for the prints
    const rotations = ["rotate-2", "-rotate-3", "rotate-1", "-rotate-2", "rotate-3"];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden select-none"
                >
                    {/* Background Radial Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-80"
                        style={{
                            background: "radial-gradient(circle at center, rgba(39, 39, 42, 0.2) 0%, rgba(0, 0, 0, 1) 80%)"
                        }}
                    />

                    {/* Centered Brand Text (Z-index 10) - Dissolves behind images */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div
                            className="text-center transition-all duration-75 ease-out"
                            style={{
                                opacity: 1 - progress / 100,
                                filter: `blur(${(progress / 100) * 16}px)`,
                                transform: `scale(${1 + (progress / 100) * 0.12})`
                            }}
                        >
                            <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-[0.2em] uppercase leading-none pl-[0.2em] font-sans opacity-90">
                                CLICKS
                            </h1>
                            <p className="font-mono text-[9px] tracking-[0.6em] text-zinc-500 uppercase mt-4 opacity-60">
                                Portfolio Specimen &bull; Load {progress}%
                            </p>
                        </div>
                    </div>

                    {/* Horizontal Sliding Carousel (Z-index 20) - Sweeps right-to-left */}
                    {carouselImages.length > 0 && (
                        <div className="absolute w-full flex items-center z-20 pointer-events-none">
                            <motion.div
                                initial={{ x: "100vw" }}
                                animate={{ x: "-100%" }}
                                transition={{
                                    duration: 2.8,
                                    ease: [0.25, 1, 0.5, 1], // Smooth cubic-bezier deceleration
                                }}
                                className="flex items-center gap-12 md:gap-16 px-12"
                            >
                                {carouselImages.map((img, i) => (
                                    <div
                                        key={img.id}
                                        className={`relative w-48 h-64 md:w-64 md:h-96 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl ${
                                            rotations[i % rotations.length]
                                        }`}
                                    >
                                        <Image
                                            src={img.src}
                                            alt="Loading preview specimen"
                                            fill
                                            className="object-cover opacity-90 saturate-[0.85]"
                                            sizes="300px"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
