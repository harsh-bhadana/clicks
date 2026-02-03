"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import InfiniteMarquee from "./components/InfiniteMarquee";
import Lightbox from "./components/Lightbox";

interface GalleryImage {
    src: string;
    location: string;
    date: string;
}

interface HomeClientProps {
    allImages: GalleryImage[];
}

export default function HomeClient({ allImages }: HomeClientProps) {
    const [setsCount, setSetsCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const observerTarget = useRef(null);

    // Split images into two sets for the marquee effect
    const midPoint = Math.ceil(allImages.length / 2);
    const set1Images = allImages.slice(0, midPoint);
    const set2Images = allImages.slice(midPoint);

    useEffect(() => {
        const reveals = document.querySelectorAll(".reveal");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                    }
                });
            },
            { threshold: 0.1 }
        );

        reveals.forEach((reveal) => observer.observe(reveal));
        return () => observer.disconnect();
    }, [setsCount]);

    const loadMore = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting) {
                setSetsCount((prev) => prev + 1);
            }
        },
        []
    );

    useEffect(() => {
        const observer = new IntersectionObserver(loadMore, {
            rootMargin: "200px",
            threshold: 0.1,
        });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
            {/* Header Section */}
            <header className={`fixed top-0 left-0 w-full z-50 py-12 px-8 flex justify-center items-center mix-blend-difference pointer-events-none transition-all duration-1000 ${selectedImage ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}>
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter uppercase reveal">
                    clicks
                </h1>
            </header>

            {/* Marquee Streams Section */}
            <section className={`pt-64 pb-32 space-y-12 transition-all duration-[1000ms] ease-in-out ${selectedImage ? "opacity-20 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100"
                }`}>
                {Array.from({ length: setsCount }).map((_, i) => (
                    <div key={`set-${i}`} className="space-y-12">
                        <div className="reveal" style={{ transitionDelay: '100ms' }}>
                            <InfiniteMarquee
                                direction={i % 2 === 0 ? "left" : "right"}
                                speed={30 + i}
                                images={i % 2 === 0 ? set1Images : set2Images}
                                onImageClick={setSelectedImage}
                                isPaused={!!selectedImage}
                            />
                        </div>
                        <div className="reveal" style={{ transitionDelay: '300ms' }}>
                            <InfiniteMarquee
                                direction={i % 2 === 0 ? "right" : "left"}
                                speed={35 - i}
                                images={i % 2 === 0 ? set2Images : set1Images}
                                onImageClick={setSelectedImage}
                                isPaused={!!selectedImage}
                            />
                        </div>
                        <div className="reveal" style={{ transitionDelay: '500ms' }}>
                            <InfiniteMarquee
                                direction={i % 2 === 0 ? "left" : "right"}
                                speed={25 + i * 2}
                                images={i % 2 === 0 ? set1Images : set2Images}
                                onImageClick={setSelectedImage}
                                isPaused={!!selectedImage}
                            />
                        </div>
                    </div>
                ))}

                {/* Intersection Trigger */}
                <div ref={observerTarget} className="h-20 w-full flex justify-center items-center">
                    <div className="w-1 h-1 bg-white/20 rounded-full animate-ping" />
                </div>
            </section>

            {/* Lightbox Popup */}
            <Lightbox
                image={selectedImage}
                onClose={() => setSelectedImage(null)}
            />

            {/* Footer */}
            <footer className="py-24 border-t border-white/5 text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
                &copy; {new Date().getFullYear()} Clicks Gallery &bull; Minimal Immersive Experience
            </footer>
        </main>
    );
}
