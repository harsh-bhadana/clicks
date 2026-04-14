"use client";

import {
    use,
    useState,
    useCallback,
    startTransition,
    Suspense,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BLUR_DATA_URL } from "../lib/blur";
import type { GalleryImage } from "../types";
import HiResPreview from "./HiResPreview";

// ─── Promise cache ──────────────────────────────────────────────────────────
// Associates each image src with a single `Promise<string>` so hovering
// the same thumbnail twice doesn't re-fetch.
const hiResPromiseCache = new Map<string, Promise<string>>();

function getHiResPromise(src: string): Promise<string> {
    if (!hiResPromiseCache.has(src)) {
        hiResPromiseCache.set(
            src,
            new Promise<string>((resolve) => {
                const img = new window.Image();
                img.onload = () => resolve(src);
                img.onerror = () => resolve(src); // graceful fallback
                img.src = src;
            })
        );
    }
    return hiResPromiseCache.get(src)!;
}

// ─── Category metadata ─────────────────────────────────────────────────────
interface Category {
    label: string;
    emoji: string;
    range: [number, number]; // [startIndex, count]
}

function buildCategories(total: number): Category[] {
    const cats: Category[] = [
        { label: "Featured",    emoji: "✦", range: [0, Math.min(8, total)] },
        { label: "Landscapes",  emoji: "◈", range: [0, Math.min(6, total)] },
        { label: "Perspectives", emoji: "◇", range: [Math.floor(total * 0.3), Math.min(7, total)] },
        { label: "Moments",     emoji: "○", range: [Math.floor(total * 0.5), Math.min(6, total)] },
        { label: "Abstract",    emoji: "△", range: [Math.floor(total * 0.7), Math.min(5, total)] },
    ];
    return cats.filter((c) => c.range[0] < total);
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Client Component
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
    imagePromise: Promise<GalleryImage[]>;
}

export default function ConcurrentGalleryClient({ imagePromise }: Props) {
    // React 19 `use()` — unwraps the server-initiated promise.
    // This suspends until the promise resolves; no useEffect / isLoading.
    const allImages = use(imagePromise);
    const categories = buildCategories(allImages.length);

    // The currently hovered image whose hi-res version we want to preview.
    const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
    // Promise that the HiResPreview component will `use()`.
    const [hiResPromise, setHiResPromise] = useState<Promise<string> | null>(null);

    const handleHover = useCallback((img: GalleryImage) => {
        // startTransition: marks the hi-res fetch as non-urgent so the
        // low-res thumbnail stays interactive while the promise resolves.
        startTransition(() => {
            setActiveImage(img);
            setHiResPromise(getHiResPromise(img.src));
        });
    }, []);

    const handleLeave = useCallback(() => {
        setActiveImage(null);
        setHiResPromise(null);
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden">
            {/* ── Navigation Bar ─────────────────────────────────── */}
            <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 md:px-12 h-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm">
                <Link
                    href="/"
                    className="text-white/40 hover:text-white/80 transition-colors duration-500 text-[10px] tracking-[0.4em] uppercase"
                >
                    ← Back to Clicks
                </Link>
                <h2 className="text-[10px] tracking-[0.4em] uppercase text-white/30">
                    use() + Suspense Specimen
                </h2>
            </nav>

            {/* ── Hero ───────────────────────────────────────────── */}
            <header className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="text-purple-400/80 text-[11px] tracking-[0.35em] uppercase mb-4 font-medium">
                        React 19 Concurrent Pattern
                    </p>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
                        Concurrent
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                            Gallery
                        </span>
                    </h1>
                    <p className="text-white/40 max-w-xl text-sm leading-relaxed">
                        Hover any thumbnail to prefetch the full-resolution image inside a{" "}
                        <code className="text-purple-400/70 bg-purple-400/10 px-1.5 py-0.5 rounded text-xs">
                            Suspense
                        </code>{" "}
                        boundary using the{" "}
                        <code className="text-purple-400/70 bg-purple-400/10 px-1.5 py-0.5 rounded text-xs">
                            use()
                        </code>{" "}
                        hook. No useEffect. No isLoading state.
                    </p>
                </motion.div>
            </header>

            {/* ── Category Rows (Netflix-style) ──────────────────── */}
            <section className="pb-32 space-y-14">
                {categories.map((cat, catIdx) => {
                    const start = cat.range[0];
                    const count = cat.range[1];
                    const rowImages = allImages.slice(start, start + count);

                    return (
                        <motion.div
                            key={cat.label}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.15 * catIdx,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            {/* Row header */}
                            <div className="flex items-center gap-3 px-8 md:px-16 mb-5">
                                <span className="text-purple-400/60 text-lg">{cat.emoji}</span>
                                <h3 className="text-white/90 text-lg font-semibold tracking-tight">
                                    {cat.label}
                                </h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-3" />
                            </div>

                            {/* Horizontal scrolling row */}
                            <div className="relative group/row">
                                <div className="flex gap-4 overflow-x-auto px-8 md:px-16 pb-4 scrollbar-none scroll-smooth">
                                    {rowImages.map((img, i) => (
                                        <ThumbnailCard
                                            key={`${cat.label}-${img.id}-${i}`}
                                            image={img}
                                            index={i}
                                            isActive={activeImage?.id === img.id}
                                            onHover={handleHover}
                                            onLeave={handleLeave}
                                        />
                                    ))}
                                </div>
                                {/* Edge fades */}
                                <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
                            </div>
                        </motion.div>
                    );
                })}
            </section>

            {/* ── Hi-Res Preview Overlay (Suspense boundary) ─────── */}
            <AnimatePresence>
                {activeImage && hiResPromise && (
                    <motion.div
                        key={activeImage.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-24 right-8 md:right-16 z-40 pointer-events-none"
                    >
                        <div className="relative w-[420px] max-w-[40vw] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
                            {/* The Suspense boundary: low-res fallback while hi-res loads */}
                            <Suspense
                                fallback={
                                    <LoResFallback image={activeImage} />
                                }
                            >
                                <HiResPreview
                                    hiResPromise={hiResPromise}
                                    alt={`Photo ${activeImage.id} — full resolution`}
                                />
                            </Suspense>

                            {/* Status badge */}
                            <div className="absolute top-3 left-3 z-20">
                                <Suspense
                                    fallback={
                                        <StatusBadge status="loading" />
                                    }
                                >
                                    <ResolvedBadge hiResPromise={hiResPromise} />
                                </Suspense>
                            </div>

                            {/* Image ID pill */}
                            <div className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/50 tracking-wider uppercase border border-white/5">
                                #{activeImage.id}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── API Showcase Footer ────────────────────────────── */}
            <footer className="border-t border-white/5 py-16 px-8 md:px-16">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ApiCard
                        name="use()"
                        description="Unwraps promises directly in render. Replaces useEffect + useState for data fetching."
                        color="purple"
                    />
                    <ApiCard
                        name="Suspense"
                        description="Shows the low-res thumbnail as fallback while the hi-res image promise resolves."
                        color="fuchsia"
                    />
                    <ApiCard
                        name="startTransition"
                        description="Keeps the UI responsive while the hi-res fetch is in flight. No jank."
                        color="pink"
                    />
                </div>
                <p className="text-center text-zinc-700 text-[10px] tracking-[0.3em] uppercase mt-12">
                    &copy; {new Date().getFullYear()} Clicks Gallery &bull; Concurrent Gallery Specimen
                </p>
            </footer>

            {/* Utility CSS */}
            <style jsx>{`
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

// ── Thumbnail Card ──────────────────────────────────────────────────────
interface ThumbnailCardProps {
    image: GalleryImage;
    index: number;
    isActive: boolean;
    onHover: (img: GalleryImage) => void;
    onLeave: () => void;
}

function ThumbnailCard({ image, index, isActive, onHover, onLeave }: ThumbnailCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onMouseEnter={() => onHover(image)}
            onMouseLeave={onLeave}
            className={`
                relative flex-shrink-0 h-[220px] md:h-[260px] rounded-xl overflow-hidden
                border transition-all duration-500 cursor-pointer group
                ${isActive
                    ? "border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105 z-20"
                    : "border-white/5 hover:border-white/15 hover:scale-[1.02]"
                }
            `}
            style={{ aspectRatio: "16/10", width: "auto" }}
        >
            <Image
                src={image.src}
                alt={`Photo ${image.id}`}
                fill
                sizes="(max-width: 640px) 80vw, 350px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                quality={40}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Active ring glow */}
            {isActive && (
                <motion.div
                    layoutId="active-ring"
                    className="absolute inset-0 rounded-xl border-2 border-purple-400/40 pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            {/* Hover label */}
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-white/60 tracking-wider uppercase bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                    Hover to preview
                </span>
            </div>
        </motion.div>
    );
}

// ── Low-res Fallback (shown inside Suspense while hi-res loads) ─────────
function LoResFallback({ image }: { image: GalleryImage }) {
    return (
        <div className="relative aspect-[16/10] w-full">
            <Image
                src={image.src}
                alt={`Photo ${image.id} — loading hi-res`}
                fill
                sizes="420px"
                className="object-cover blur-sm scale-105 brightness-75"
                quality={10}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
            />
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            <style jsx>{`
                @keyframes shimmer {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

// ── Status Badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "loading" | "resolved" }) {
    const isLoading = status === "loading";
    return (
        <div
            className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] tracking-widest uppercase
                border backdrop-blur-md transition-all duration-500
                ${isLoading
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400/80"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80"
                }
            `}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
            />
            {isLoading ? "Suspending…" : "Resolved"}
        </div>
    );
}

// ── Resolved Badge (uses use() to detect resolution) ────────────────────
function ResolvedBadge({ hiResPromise }: { hiResPromise: Promise<string> }) {
    use(hiResPromise); // suspends until resolved
    return <StatusBadge status="resolved" />;
}

// ── API Card (footer) ───────────────────────────────────────────────────
function ApiCard({
    name,
    description,
    color,
}: {
    name: string;
    description: string;
    color: "purple" | "fuchsia" | "pink";
}) {
    const colorMap = {
        purple:  { bg: "bg-purple-500/5",  border: "border-purple-500/10", text: "text-purple-400" },
        fuchsia: { bg: "bg-fuchsia-500/5", border: "border-fuchsia-500/10", text: "text-fuchsia-400" },
        pink:    { bg: "bg-pink-500/5",    border: "border-pink-500/10",   text: "text-pink-400" },
    };
    const c = colorMap[color];

    return (
        <div className={`${c.bg} ${c.border} border rounded-xl p-6`}>
            <code className={`${c.text} text-sm font-mono font-semibold`}>{name}</code>
            <p className="text-white/40 text-xs mt-2 leading-relaxed">{description}</p>
        </div>
    );
}
