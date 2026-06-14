"use client";

import { useEffect, useState, useCallback, Suspense, use } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { BLUR_DATA_URL } from "../lib/blur";
import type { GalleryImage } from "../types";

interface LightboxProps {
    image: GalleryImage | null;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    /** Promise that resolves to the hi-res image URL. Consumed via use(). */
    hiResPromise?: Promise<string> | null;
    /** True while a startTransition navigation is in-flight. */
    isNavigating?: boolean;
}

/**
 * A full-screen overlay for viewing a single image in high detail.
 * Features a heavy backdrop blur and body-scroll locking.
 * 
 * @param image - The image to display, or null if the lightbox should be hidden.
 * @param onClose - Callback function to close the lightbox.
 */
export default function Lightbox({ image, onClose, onNext, onPrev, hiResPromise, isNavigating }: LightboxProps) {
    const [isZoomed, setIsZoomed] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight" && onNext) onNext();
        if (e.key === "ArrowLeft" && onPrev) onPrev();
    }, [onClose, onNext, onPrev]);

    useEffect(() => {
        if (image) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "auto";
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsZoomed(false);
        }
        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [image, handleKeyDown]);

    return (
        <AnimatePresence mode="wait">
            {image && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        onClick={onClose}
                    />

                    {/* Controls Overlay */}
                    <div className="absolute inset-0 z-20 flex">
                        {/* Navigation Zones */}
                        <div
                            className="w-[30%] h-full cursor-none pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                            data-cursor="prev"
                            aria-label="Previous Image"
                        />
                        <div className="flex-1 h-full" />
                        <div
                            className="w-[30%] h-full cursor-none pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                            data-cursor="next"
                            aria-label="Next Image"
                        />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-12 right-12 pointer-events-auto p-4 text-white/50 hover:text-white transition-all duration-500 uppercase text-[10px] tracking-[0.4em] font-light group"
                            aria-label="Close Lightbox"
                        >
                            <span className="inline-block transition-transform duration-500 group-hover:rotate-90 mr-2">✕</span>
                            Close
                        </button>
                    </div>

                    {/* Image Container */}
                    <motion.div
                        key={image.src}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.05, opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 max-w-full max-h-full flex items-center justify-center pointer-events-auto"
                        data-cursor="zoom"
                        onClick={() => setIsZoomed(!isZoomed)}
                    >
                        <div
                            className={`relative rounded-3xl overflow-hidden glass border shadow-3xl transition-all duration-700 ${
                                isNavigating ? "border-purple-500/30 shadow-purple-500/10" : "border-white/10"
                            }`}
                        >
                            <motion.div
                                layoutId={`img-${image.id}`}
                                animate={{ scale: isZoomed ? 1.5 : 1 }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="relative flex items-center justify-center"
                            >
                                {hiResPromise ? (
                                    <Suspense
                                        fallback={
                                            <div className="relative">
                                                <Image
                                                    src={image.src}
                                                    alt="Loading full resolution…"
                                                    width={1920}
                                                    height={1080}
                                                    sizes="90vw"
                                                    className="w-auto h-auto max-w-[85vw] max-h-[80vh] object-contain p-2 blur-[2px] brightness-[0.85]"
                                                    quality={20}
                                                    placeholder="blur"
                                                    blurDataURL={BLUR_DATA_URL}
                                                />
                                                <div className="absolute inset-0 flex items-end justify-start p-6 pointer-events-none">
                                                    <SuspenseStatusBadge status="suspending" />
                                                </div>
                                            </div>
                                        }
                                    >
                                        <SuspendingImage hiResPromise={hiResPromise} image={image} />
                                    </Suspense>
                                ) : (
                                    <Image
                                        src={image.src}
                                        alt="Photography Gallery Image"
                                        width={1920}
                                        height={1080}
                                        sizes="90vw"
                                        className="w-auto h-auto max-w-[85vw] max-h-[80vh] object-contain p-2"
                                        priority
                                        quality={100}
                                        placeholder="blur"
                                        blurDataURL={BLUR_DATA_URL}
                                    />
                                )}
                            </motion.div>
                        </div>
                    </motion.div>

                    <style jsx>{`
                        .shadow-3xl {
                            box-shadow: 0 0 100px rgba(168, 85, 247, 0.15);
                        }
                        .glass {
                            background: rgba(255, 255, 255, 0.03);
                            backdrop-filter: blur(10px);
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Suspense sub-components — must be separate components so use() can suspend
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calls use(hiResPromise) directly in render — the heart of the pattern.
 * No useEffect, no useState, no isLoading. React suspends this component
 * until the promise resolves, and the parent Suspense boundary shows the
 * blurred low-res fallback automatically.
 */
function SuspendingImage({ hiResPromise, image }: { hiResPromise: Promise<string>; image: GalleryImage }) {
    // ⚡ This is the entire data-fetching pattern. Just use().
    const resolvedSrc = use(hiResPromise);

    return (
        <div className="relative">
            <Image
                src={resolvedSrc}
                alt="Photography Gallery Image — Full Resolution"
                width={1920}
                height={1080}
                sizes="90vw"
                className="w-auto h-auto max-w-[85vw] max-h-[80vh] object-contain p-2"
                priority
                quality={100}
            />
            <div className="absolute inset-0 flex items-end justify-start p-6 pointer-events-none">
                <SuspenseStatusBadge status="resolved" />
            </div>
        </div>
    );
}

/** Visual indicator showing the Suspense lifecycle state. */
function SuspenseStatusBadge({ status }: { status: "suspending" | "resolved" }) {
    const isSuspending = status === "suspending";
    return (
        <div
            className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] tracking-widest uppercase
                border backdrop-blur-md transition-all duration-500
                ${isSuspending
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400/80"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80"
                }
            `}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    isSuspending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
            />
            {isSuspending ? "Suspending…" : "Hi-Res Loaded"}
        </div>
    );
}
