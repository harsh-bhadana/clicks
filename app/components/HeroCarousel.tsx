"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
    { src: "/images/hero/hero_1.png", title: "Cyber-City 2049", subtitle: "Automated Neon Dreams" },
    { src: "/images/hero/hero_2.png", title: "Alpine Glow", subtitle: "The Peak of Tranquility" },
    { src: "/images/hero/hero_3.png", title: "Glass & Steel", subtitle: "Minimalist Modernism" },
    { src: "/images/hero/hero_4.png", title: "Verdurous Light", subtitle: "Nature's Quiet Morning" },
    { src: "/images/hero/hero_5.png", title: "Cosmic Nebula", subtitle: "The Infinite Beyond" },
];

export default function HeroCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {images.map((img, i) => (
                <div
                    key={img.src}
                    className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out transform ${i === index ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-110 rotate-1"
                        }`}
                >
                    <Image
                        src={img.src}
                        alt={img.title}
                        fill
                        className="object-cover brightness-[0.7]"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <h1
                            className={`text-6xl md:text-8xl font-black tracking-tight mb-4 transition-all duration-1000 delay-500 uppercase ${i === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                }`}
                        >
                            {img.title}
                        </h1>
                        <p
                            className={`text-xl md:text-2xl text-zinc-300 tracking-widest transition-all duration-1000 delay-700 ${i === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                }`}
                        >
                            {img.subtitle}
                        </p>
                    </div>
                </div>
            ))}

            {/* Navigation Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1 transition-all duration-500 rounded-full ${i === index ? "w-12 bg-accent" : "w-4 bg-white/20 hover:bg-white/40"
                            }`}
                    />
                ))}
            </div>

            {/* Decorative Gradient Overlays */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}
