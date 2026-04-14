"use client";

import {
    use,
    useEffect,
    useState,
    useRef,
    useCallback,
    useTransition,
    useDeferredValue,
    useMemo,
} from "react";
import { motion } from "framer-motion";
import InfiniteMarquee from "./components/InfiniteMarquee";
import PageLoader from "./components/PageLoader";
import CustomCursor from "./components/CustomCursor";
import Lightbox from "./components/Lightbox"; // RE-ADDED for instant-local-rendering
import type { GalleryImage } from "./types";

interface HomeClientProps {
    imagePromise: Promise<GalleryImage[]>;
}

/**
 * Main client-side gallery container.
 * 
 * Performance tuning:
 * - Local state `localSelectedImage` provides 0ms response on click.
 * - Entirely Single-Page architecture without navigation lag.
 */
export default function HomeClient({ imagePromise }: HomeClientProps) {
    const allImages = use(imagePromise);

    // ── Local State for Instant UI ──────────────────────────────────────────
    // Strictly in-memory state. Address bar never changes.
    const [localSelectedImage, setLocalSelectedImage] = useState<GalleryImage | null>(null);

    const [setsCount, setSetsCount] = useState(1);
    const [isPending, startTransition] = useTransition();
    const deferredSetsCount = useDeferredValue(setsCount);
    const observerTarget = useRef<HTMLDivElement>(null);

    // ── Hi-Res Prefetch (use() + Suspense pattern) ──────────────────────────
    const [activeHiResPromise, setActiveHiResPromise] = useState<Promise<string> | null>(null);
    const [isHiResPending, startHiResTransition] = useTransition();
    const hiResCacheRef = useRef(new Map<string, Promise<string>>());

    const getOrCreateHiResPromise = useCallback((src: string): Promise<string> => {
        const cache = hiResCacheRef.current;
        if (!cache.has(src)) {
            cache.set(
                src,
                new Promise<string>((resolve) => {
                    const img = new window.Image();
                    img.onload = () => resolve(src);
                    img.onerror = () => resolve(src);
                    img.src = src;
                })
            );
        }
        return cache.get(src)!;
    }, []);

    /** Warm the cache on hover — no state update, just background prefetch. */
    const handleImageHover = useCallback((img: GalleryImage) => {
        getOrCreateHiResPromise(img.src);
    }, [getOrCreateHiResPromise]);

    const [isHeaderCentered, setIsHeaderCentered] = useState(true);

    const { set1Images, set2Images } = useMemo(() => {
        const mid = Math.ceil(allImages.length / 2);
        return {
            set1Images: allImages.slice(0, mid),
            set2Images: allImages.slice(mid),
        };
    }, [allImages]);

    const handleImageClick = useCallback((img: GalleryImage) => {
        setLocalSelectedImage(img);
        setActiveHiResPromise(getOrCreateHiResPromise(img.src));
        // Prefetch adjacent images for instant lightbox navigation
        const idx = allImages.findIndex(i => i.id === img.id);
        const nextImg = allImages[(idx + 1) % allImages.length];
        const prevImg = allImages[(idx - 1 + allImages.length) % allImages.length];
        getOrCreateHiResPromise(nextImg.src);
        getOrCreateHiResPromise(prevImg.src);
    }, [getOrCreateHiResPromise, allImages]);

    const handleCloseLightbox = useCallback(() => {
        setLocalSelectedImage(null);
        setActiveHiResPromise(null);
    }, []);

    const handleNext = useCallback(() => {
        if (!localSelectedImage) return;
        const idx = allImages.findIndex(i => i.id === localSelectedImage.id);
        const nextImg = allImages[(idx + 1) % allImages.length];
        // startTransition: current image stays visible while next loads
        startHiResTransition(() => {
            setLocalSelectedImage(nextImg);
            setActiveHiResPromise(getOrCreateHiResPromise(nextImg.src));
        });
        // Prefetch one ahead for instant forward navigation
        const nextNextImg = allImages[(idx + 2) % allImages.length];
        getOrCreateHiResPromise(nextNextImg.src);
    }, [allImages, localSelectedImage, startHiResTransition, getOrCreateHiResPromise]);

    const handlePrev = useCallback(() => {
        if (!localSelectedImage) return;
        const idx = allImages.findIndex(i => i.id === localSelectedImage.id);
        const prevImg = allImages[(idx - 1 + allImages.length) % allImages.length];
        // startTransition: current image stays visible while prev loads
        startHiResTransition(() => {
            setLocalSelectedImage(prevImg);
            setActiveHiResPromise(getOrCreateHiResPromise(prevImg.src));
        });
        // Prefetch one behind for instant backward navigation
        const prevPrevImg = allImages[(idx - 2 + allImages.length) % allImages.length];
        getOrCreateHiResPromise(prevPrevImg.src);
    }, [allImages, localSelectedImage, startHiResTransition, getOrCreateHiResPromise]);

    // Header drop: center → top, timed to match PageLoader fade-out.
    useEffect(() => {
        console.log("HomeClient mounted, starting 3.2s header drop timer");
        const timer = setTimeout(() => {
            console.log("Setting isHeaderCentered to false");
            setIsHeaderCentered(false);
        }, 3200);
        return () => clearTimeout(timer);
    }, []);

    // Infinite-scroll trigger: wrapped in startTransition so appending new
    // marquee sets never blocks existing CSS animations.
    const loadMore = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting) {
                startTransition(() => setSetsCount((prev) => prev + 1));
            }
        },
        [startTransition]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(loadMore, {
            rootMargin: "200px",
            threshold: 0.1,
        });
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden cursor-none">
            <PageLoader />
            <CustomCursor />

            {/*
             * Gallery renders immediately on mount — PageLoader (z-[100]) overlays
             * it for 3s. When the loader fades out the gallery is already rendered
             * and in its final `opacity: 1` state, giving an instant reveal.
             */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <header
                    className={`fixed top-0 left-0 w-full z-50 px-8 mix-blend-difference pointer-events-none transition-all duration-1000 ease-in-out flex justify-center items-center ${
                        isHeaderCentered ? "h-screen py-12" : "h-64 py-12"
                    } ${localSelectedImage ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                >
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                        className="text-8xl md:text-9xl font-black tracking-tighter uppercase origin-center"
                    >
                        clicks
                    </motion.h1>
                </header>

                {/* ── Marquee section ─────────────────────────────────── */}
                <section
                    className={`pt-72 pb-48 space-y-24 transition-all duration-[1500ms] ease-in-out ${
                        localSelectedImage
                            ? "opacity-20 blur-md scale-[0.95]"
                            : "opacity-100 blur-0 scale-100"
                    }`}
                >
                    {Array.from({ length: deferredSetsCount }).map((_, i) => (
                        <motion.div
                            key={`set-${i}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 2,
                                delay: 0.5 + i * 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="space-y-24"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
                            >
                                <InfiniteMarquee
                                    direction={i % 2 === 0 ? "left" : "right"}
                                    speed={30 + i}
                                    images={i % 2 === 0 ? set1Images : set2Images}
                                    isPaused={!!localSelectedImage}
                                    onImageClick={handleImageClick}
                                    onImageHover={handleImageHover}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 0.3 }}
                            >
                                <InfiniteMarquee
                                    direction={i % 2 === 0 ? "right" : "left"}
                                    speed={35 - i}
                                    images={i % 2 === 0 ? set2Images : set1Images}
                                    isPaused={!!localSelectedImage}
                                    onImageClick={handleImageClick}
                                    onImageHover={handleImageHover}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 0.5 }}
                            >
                                <InfiniteMarquee
                                    direction={i % 2 === 0 ? "left" : "right"}
                                    speed={25 + i * 2}
                                    images={i % 2 === 0 ? set1Images : set2Images}
                                    isPaused={!!localSelectedImage}
                                    onImageClick={handleImageClick}
                                    onImageHover={handleImageHover}
                                />
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Infinite-scroll trigger */}
                    <div
                        ref={observerTarget}
                        className="h-20 w-full flex justify-center items-center"
                    >
                        {/* Turns purple while startTransition is in-flight */}
                        <div
                            className={`w-1 h-1 rounded-full transition-colors duration-500 animate-ping ${
                                isPending ? "bg-purple-500" : "bg-white/20"
                            }`}
                        />
                    </div>
                </section>

                {/* 
                 * LOCAL LIGHTBOX: Single-Page Experience
                 * All lightbox state is entirely in-memory for instant response.
                 */}
                <Lightbox 
                    image={localSelectedImage} 
                    onClose={handleCloseLightbox} 
                    onNext={handleNext}
                    onPrev={handlePrev}
                    hiResPromise={activeHiResPromise}
                    isNavigating={isHiResPending}
                />

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer className="py-24 border-t border-white/5 text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
                    &copy; {new Date().getFullYear()} Clicks Gallery &bull; Minimal Immersive Experience
                </footer>
            </motion.div>
        </main>
    );
}
