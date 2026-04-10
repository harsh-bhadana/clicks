"use client";

import { useEffect, useState, useRef, useCallback, useTransition, useDeferredValue, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InfiniteMarquee from "./components/InfiniteMarquee";
import Lightbox from "./components/Lightbox";
import PageLoader from "./components/PageLoader";
import CustomCursor from "./components/CustomCursor";

import { GalleryImage } from "./types";

interface HomeClientProps {
    allImages: GalleryImage[];
}

/**
 * The main client-side container for the Clicks photography gallery.
 * Orchestrates the loading sequence, infinite scrolling, and lightbox interactions.
 * 
 * @param allImages - Initial set of images fetched from the server.
 */
export default function HomeClient({ allImages }: HomeClientProps) {
    const [setsCount, setSetsCount] = useState(1);
    const [isPending, startTransition] = useTransition();
    const deferredSetsCount = useDeferredValue(setsCount);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isHeaderCentered, setIsHeaderCentered] = useState(true);
    const observerTarget = useRef(null);

    // Split images into two sets for the marquee effect — memoized so the
    // arrays are stable references and don't cause InfiniteMarquee to re-render
    // on every parent render.
    const { set1Images, set2Images } = useMemo(() => {
        const mid = Math.ceil(allImages.length / 2);
        return {
            set1Images: allImages.slice(0, mid),
            set2Images: allImages.slice(mid),
        };
    }, [allImages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
            // After initial load is done, wait 2 seconds then move header to top
            setTimeout(() => {
                setIsHeaderCentered(false);
            }, 2000);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

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
    }, [setsCount, isInitialLoad]);

    const loadMore = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && !isInitialLoad) {
                // useTransition defers the heavy marquee re-render — keeps
                // existing animations and scroll position responsive.
                startTransition(() => setSetsCount((prev) => prev + 1));
            }
        },
        [isInitialLoad, startTransition]
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
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden cursor-none">
            <PageLoader />
            <CustomCursor />

            <AnimatePresence>
                {!isInitialLoad && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Header Section */}
                        <header className={`fixed top-0 left-0 w-full z-50 px-8 mix-blend-difference pointer-events-none transition-all duration-[1500ms] cubic-bezier(0.76, 0, 0.24, 1) flex justify-center items-center ${isHeaderCentered ? "h-screen py-12" : "h-64 py-12"
                            } ${selectedImage ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0
                                }}
                                transition={{
                                    duration: 1.2,
                                    delay: 0,
                                    ease: [0.76, 0, 0.24, 1]
                                }}
                                className="text-8xl md:text-9xl font-black tracking-tighter uppercase origin-center"
                            >
                                clicks
                            </motion.h1>
                        </header>

                        {/* Marquee Streams Section */}
                        <section className={`pt-72 pb-48 space-y-24 transition-all duration-[1500ms] ease-in-out ${selectedImage ? "opacity-20 blur-md scale-[0.95]" : "opacity-100 blur-0 scale-100"
                            }`}>
                            {Array.from({ length: deferredSetsCount }).map((_, i) => (
                                <motion.div
                                    key={`set-${i}`}
                                    initial={{
                                        opacity: 0,
                                        y: 50
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: 0.5 + (i * 0.3),
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    className="space-y-24"
                                >
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
                                </motion.div>
                            ))}

                            {/* Intersection Trigger */}
                            <div ref={observerTarget} className="h-20 w-full flex justify-center items-center">
                                {/* isPending is true while startTransition is computing new marquee sets */}
                                <div className={`w-1 h-1 rounded-full transition-colors duration-500 ${
                                    isPending ? "bg-purple-500 animate-ping" : "bg-white/20 animate-ping"
                                }`} />
                            </div>
                        </section>

                        {/* Lightbox Popup */}
                        <Lightbox
                            image={selectedImage}
                            onClose={() =>
                                // Closing is interactive — defer the DOM cleanup
                                startTransition(() => setSelectedImage(null))
                            }
                            onNext={() => {
                                const currentIndex = allImages.findIndex(img => img.src === selectedImage?.src);
                                const nextIndex = (currentIndex + 1) % allImages.length;
                                // Image switch: non-urgent, let Framer Motion animate first
                                startTransition(() => setSelectedImage(allImages[nextIndex]));
                            }}
                            onPrev={() => {
                                const currentIndex = allImages.findIndex(img => img.src === selectedImage?.src);
                                const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                                startTransition(() => setSelectedImage(allImages[prevIndex]));
                            }}
                        />

                        {/* Footer */}
                        <footer className="py-24 border-t border-white/5 text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
                            &copy; {new Date().getFullYear()} Clicks Gallery &bull; Minimal Immersive Experience
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
