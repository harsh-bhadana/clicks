"use client";

import Image from "next/image";

interface InfiniteMarqueeProps {
    direction?: "left" | "right";
    speed?: number;
    images?: string[];
}

const defaultImages = [
    "/images/abstract/abstract_1.png",
    "/images/abstract/abstract_2.png",
    "/images/abstract/abstract_3.png",
    "/images/abstract/abstract_4.png",
    "/images/abstract/abstract_5.png",
];

export default function InfiniteMarquee({
    direction = "left",
    speed = 40,
    images = defaultImages
}: InfiniteMarqueeProps) {
    // Triple the images to ensure seamless loop
    const marqueeImages = [...images, ...images, ...images];

    return (
        <div className="relative w-full overflow-hidden py-4 select-none">
            <div
                className={`flex w-max hover:[animation-play-state:paused] ${direction === "left" ? "animate-infinite-scroll-left" : "animate-infinite-scroll-right"
                    }`}
                style={{ animationDuration: `${speed}s` }}
            >
                {marqueeImages.map((src, i) => (
                    <div
                        key={i}
                        className="relative w-[380px] h-[240px] mx-8 rounded-2xl overflow-hidden glass hover:scale-[1.05] transition-all duration-700 cursor-pointer group"
                    >
                        <Image
                            src={src}
                            alt={`Gallery Image ${i}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
        </div>
    );
}
