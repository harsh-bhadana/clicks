"use client";

import { useState } from "react";
import Image from "next/image";

const items = [
    { src: "/images/hero/hero_1.png", label: "01" },
    { src: "/images/hero/hero_2.png", label: "02" },
    { src: "/images/hero/hero_3.png", label: "03" },
    { src: "/images/hero/hero_4.png", label: "04" },
    { src: "/images/hero/hero_5.png", label: "05" },
];

export default function Coverflow() {
    const [activeIndex, setActiveIndex] = useState(2);

    const getStyle = (index: number) => {
        const diff = index - activeIndex;
        const absDiff = Math.abs(diff);
        const zIndex = 10 - absDiff;
        const scale = 1 - absDiff * 0.15;
        const translateX = diff * 120; // Overlap factor
        const rotateY = diff * -25;
        const brightness = 1 - absDiff * 0.3;

        return {
            transform: `translateX(${translateX}px) translateZ(${-absDiff * 200}px) rotateY(${rotateY}deg) scale(${scale})`,
            zIndex,
            opacity: absDiff > 2 ? 0 : 1,
            filter: `brightness(${brightness})`,
            pointerEvents: diff === 0 ? ("auto" as const) : ("none" as const),
        };
    };

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000 overflow-hidden select-none">
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center transform-style-3d">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="absolute w-[300px] h-[400px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer"
                        style={getStyle(i)}
                        onClick={() => setActiveIndex(i)}
                    >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden glass shadow-2xl">
                            <Image
                                src={item.src}
                                alt={item.label}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-4xl font-black italic text-white/50">
                                {item.label}
                            </div>
                        </div>
                        {/* Reflection */}
                        <div
                            className="absolute top-full left-0 w-full h-1/2 opacity-20 scale-y-[-1] pointer-events-none"
                            style={{
                                maskImage: 'linear-gradient(to top, black, transparent)',
                                WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
                            }}
                        >
                            <Image
                                src={item.src}
                                alt=""
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 flex gap-4">
                <button
                    onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                    className="p-4 rounded-full border border-white/10 hover:bg-white/5"
                >
                    ←
                </button>
                <button
                    onClick={() => setActiveIndex(prev => Math.min(items.length - 1, prev + 1))}
                    className="p-4 rounded-full border border-white/10 hover:bg-white/5"
                >
                    →
                </button>
            </div>
        </div>
    );
}
