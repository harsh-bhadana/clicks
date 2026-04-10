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
import { usePathname, useRouter } from "next/navigation";
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
 * - `router.push` updates URL in background for shareable state.
 * - This "Hybrid" approach combines client-side speed with URL routing.
 */
export default function HomeClient({ imagePromise }: HomeClientProps) {
    const allImages = use(imagePromise);
    const pathname = usePathname();
    const router = useRouter();

    // ── Local State for Instant UI ──────────────────────────────────────────
    // This is the secret to making the app "feel" instant again.
    const [localSelectedImage, setLocalSelectedImage] = useState<GalleryImage | null>(null);

    // Listen for browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const photoId = window.location.pathname.match(/\/photo\/(\d+)/)?.[1];
            if (photoId) {
                const img = allImages.find((i) => i.id === Number(photoId));
                if (img) setLocalSelectedImage(img);
            } else {
                setLocalSelectedImage(null);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [allImages]);

    const [setsCount, setSetsCount] = useState(1);
    const [isPending, startTransition] = useTransition();
    const deferredSetsCount = useDeferredValue(setsCount);
    const observerTarget = useRef<HTMLDivElement>(null);

    const [isHeaderCentered, setIsHeaderCentered] = useState(true);

    const { set1Images, set2Images } = useMemo(() => {
        const mid = Math.ceil(allImages.length / 2);
        return {
            set1Images: allImages.slice(0, mid),
            set2Images: allImages.slice(mid),
        };
    }, [allImages]);

    const handleImageClick = useCallback((img: GalleryImage) => {
        // 1. Update state instantly
        setLocalSelectedImage(img);
        // 2. Update URL silently in background (Bypasses RSC fetch lag)
        window.history.pushState(null, "", `/photo/${img.id}`);
    }, []);

    const handleCloseLightbox = useCallback(() => {
        setLocalSelectedImage(null);
        window.history.pushState(null, "", "/");
    }, []);

    const handleNext = useCallback(() => {
        if (!localSelectedImage) return;
        const idx = allImages.findIndex(i => i.id === localSelectedImage.id);
        const nextImg = allImages[(idx + 1) % allImages.length];
        setLocalSelectedImage(nextImg);
        window.history.replaceState(null, "", `/photo/${nextImg.id}`);
    }, [allImages, localSelectedImage]);

    const handlePrev = useCallback(() => {
        if (!localSelectedImage) return;
        const idx = allImages.findIndex(i => i.id === localSelectedImage.id);
        const prevImg = allImages[(idx - 1 + allImages.length) % allImages.length];
        setLocalSelectedImage(prevImg);
        window.history.replaceState(null, "", `/photo/${prevImg.id}`);
    }, [allImages, localSelectedImage]);

    // Header drop: center → top, timed to match PageLoader fade-out.
    useEffect(() => {
        // Initial check for deep-linked modal (if gallery is the entry page)
        const photoId = window.location.pathname.match(/\/photo\/(\d+)/)?.[1];
        if (photoId) {
            const img = allImages.find((i) => i.id === Number(photoId));
            if (img) setLocalSelectedImage(img);
        }

        const timer = setTimeout(() => setIsHeaderCentered(false), 3200);
        return () => clearTimeout(timer);
    }, [allImages]);

    // Scroll-reveal: re-registers whenever new sets are appended.
    useEffect(() => {
        const reveals = document.querySelectorAll(".reveal");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add("active");
                });
            },
            { threshold: 0.1 }
        );
        reveals.forEach((reveal) => observer.observe(reveal));
        return () => observer.disconnect();
    }, [deferredSetsCount]);

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
                    className={`fixed top-0 left-0 w-full z-50 px-8 mix-blend-difference pointer-events-none transition-all duration-[1500ms] cubic-bezier(0.76, 0, 0.24, 1) flex justify-center items-center ${
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
                            <div className="reveal" style={{ transitionDelay: "100ms" }}>
                                <InfiniteMarquee
                                    direction={i % 2 === 0 ? "left" : "right"}
                                    speed={30 + i}
                                    images={i % 2 === 0 ? set1Images : set2Images}
                                    isPaused={!!localSelectedImage}
                                    onImageClick={handleImageClick}
                                />
                            </div>
                            <div className="reveal" style={{ transitionDelay: "300ms" }}>
                                <InfiniteMarquee
                                    direction={i % 2 === 0 ? "right" : "left"}
                                    speed={35 - i}
                                    images={i % 2 === 0 ? set2Images : set1Images}
                                    isPaused={!!localSelectedImage}
                                    onImageClick={handleImageClick}
                                />
                            </div>
                            <div className="reveal" style={{ transitionDelay: "500ms" }}>
                                <InfiniteMarquee
                                    direction={i % 2 === 0 ? "left" : "right"}
                                    speed={25 + i * 2}
                                    images={i % 2 === 0 ? set1Images : set2Images}
                                    isPaused={!!localSelectedImage}
                                    onImageClick={handleImageClick}
                                />
                            </div>
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
                 * LOCAL LIGHTBOX: This provides the "Instant" experience.
                 * The @modal/ intercepts still work for refresh/deeplink, but 
                 * for intra-gallery navigation, this local instance is used.
                 */}
                <Lightbox 
                    image={localSelectedImage} 
                    onClose={handleCloseLightbox} 
                    onNext={handleNext}
                    onPrev={handlePrev}
                />

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer className="py-24 border-t border-white/5 text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
                    &copy; {new Date().getFullYear()} Clicks Gallery &bull; Minimal Immersive Experience
                </footer>
            </motion.div>
        </main>
    );
}
