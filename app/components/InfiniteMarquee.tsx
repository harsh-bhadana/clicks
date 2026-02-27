"use client";

import { useState } from "react";
import Image from "next/image";

import { GalleryImage } from "../types";

interface InfiniteMarqueeProps {
    direction?: "left" | "right";
    speed?: number;
    images: GalleryImage[];
    onImageClick: (image: GalleryImage) => void;
    isPaused?: boolean;
}

export default function InfiniteMarquee({
    direction = "left",
    speed = 40,
    images,
    onImageClick,
    isPaused = false
}: InfiniteMarqueeProps) {
    // Triple the images to ensure seamless loop
    const marqueeImages = [...images, ...images, ...images];
    const [aspectRatios, setAspectRatios] = useState<Record<number, number>>({});

    return (
        <div className="relative w-full overflow-hidden py-4 select-none">
            <div
                className={`flex w-max hover:[animation-play-state:paused] ${isPaused ? "[animation-play-state:paused]" : ""
                    } ${direction === "left" ? "animate-infinite-scroll-left" : "animate-infinite-scroll-right"
                    }`}
                style={{ animationDuration: `${speed}s` }}
            >
                {marqueeImages.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => onImageClick(img)}
                        className="relative h-[320px] mx-8 rounded-3xl overflow-hidden glass border border-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-1000 cursor-pointer group shadow-2xl shadow-black/50"
                        style={{
                            aspectRatio: aspectRatios[i] || '16/9',
                            width: 'auto'
                        }}
                    >
                        <Image
                            src={img.src}
                            alt="Photography Gallery Image"
                            fill
                            sizes="(max-width: 768px) 400px, 800px"
                            className="object-cover transition-transform duration-[2000ms] cubic-bezier(0.22, 1, 0.36, 1) group-hover:scale-110"
                            quality={85}
                            onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                setAspectRatios(prev => ({
                                    ...prev,
                                    [i]: target.naturalWidth / target.naturalHeight
                                }));
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        {/* Subtle inner border for premium look */}
                        <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes infiniteScrollLeft {
                    from { transform: translateX(0); }
                    to { transform: translateX(calc(-100% / 3)); }
                }
                @keyframes infiniteScrollRight {
                    from { transform: translateX(calc(-100% / 3)); }
                    to { transform: translateX(0); }
                }
                .animate-infinite-scroll-left {
                    animation: infiniteScrollLeft var(--duration, 40s) linear infinite;
                }
                .animate-infinite-scroll-right {
                    animation: infiniteScrollRight var(--duration, 40s) linear infinite;
                }
            `}</style>

            {/* Side gradients for fading out */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
        </div>
    );
}
