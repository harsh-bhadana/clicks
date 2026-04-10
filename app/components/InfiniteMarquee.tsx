"use client";

import Image from "next/image";
import { BLUR_DATA_URL } from "../lib/blur";
import { motion } from "framer-motion";
import type { GalleryImage } from "../types";

interface InfiniteMarqueeProps {
    direction?: "left" | "right";
    speed?: number;
    images: GalleryImage[];
    isPaused?: boolean;
    onImageClick?: (img: GalleryImage) => void;
}

/**
 * Horizontally-scrolling image reel with triple-buffer seamless looping.
 */
export default function InfiniteMarquee({
    direction = "left",
    speed = 40,
    images,
    isPaused = false,
    onImageClick,
}: InfiniteMarqueeProps) {
    // Triple the images so the loop seam never falls within one viewport width.
    const marqueeImages = [...images, ...images, ...images];

    return (
        <div className="relative w-full overflow-hidden py-4 select-none">
            <div
                className={`flex w-max hover:[animation-play-state:paused] ${
                    isPaused ? "[animation-play-state:paused]" : ""
                } ${
                    direction === "left"
                        ? "animate-infinite-scroll-left"
                        : "animate-infinite-scroll-right"
                }`}
                style={{ animationDuration: `${speed}s` }}
            >
                {marqueeImages.map((img, i) => (
                    <motion.button
                        key={i}
                        layoutId={`img-${img.id}`}
                        onClick={(e) => {
                            if (onImageClick) {
                                e.preventDefault();
                                onImageClick(img);
                            }
                        }}
                        className="relative block h-[320px] mx-8 rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-1000 group shadow-2xl shadow-black/50 bg-transparent p-0 cursor-none"
                        style={{ aspectRatio: "3/2", width: "auto" }}
                        data-cursor="view"
                        aria-label={`Open photo ${img.id}`}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={img.src}
                                alt="Photography Gallery Image"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                                className="object-cover transition-transform duration-[2000ms] cubic-bezier(0.22, 1, 0.36, 1) group-hover:scale-110"
                                quality={70}
                                placeholder="blur"
                                blurDataURL={BLUR_DATA_URL}
                            />
                        </div>
                        {/* Hover gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        {/* Inner border for premium look */}
                        <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
                    </motion.button>
                ))}
            </div>

            <style jsx>{`
                @keyframes infiniteScrollLeft {
                    from { transform: translateX(0); }
                    to   { transform: translateX(calc(-100% / 3)); }
                }
                @keyframes infiniteScrollRight {
                    from { transform: translateX(calc(-100% / 3)); }
                    to   { transform: translateX(0); }
                }
                .animate-infinite-scroll-left {
                    animation: infiniteScrollLeft var(--duration, 40s) linear infinite;
                }
                .animate-infinite-scroll-right {
                    animation: infiniteScrollRight var(--duration, 40s) linear infinite;
                }
            `}</style>

            {/* Edge fade-out gradients */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
        </div>
    );
}
