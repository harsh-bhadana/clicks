"use client";

import { use, useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import CustomCursor from "./components/CustomCursor";
import ThreeGallery from "./components/ThreeGallery";
import ProjectDetail from "./components/ProjectDetail";
import type { GalleryImage } from "./types";

interface HomeClientProps {
    imagePromise: Promise<GalleryImage[]>;
}

export default function HomeClient({ imagePromise }: HomeClientProps) {
    const allImages = use(imagePromise);

    // ── Navigation & In-Memory State ─────────────────────────────────────────
    const [selectedProject, setSelectedProject] = useState<GalleryImage | null>(null);
    const [selectedMetadata, setSelectedMetadata] = useState<{
        brand: string;
        title: string;
        tags: string[];
        year: string;
    } | null>(null);

    // ── Local Time HUD (London & Auckland) ──────────────────────────────────
    const [londonTime, setLondonTime] = useState("");
    const [aucklandTime, setAucklandTime] = useState("");

    useEffect(() => {
        const updateTimes = () => {
            const timeOptions: Intl.DateTimeFormatOptions = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            };
            const lTime = new Intl.DateTimeFormat("en-GB", {
                ...timeOptions,
                timeZone: "Europe/London",
            }).format(new Date());
            const aTime = new Intl.DateTimeFormat("en-GB", {
                ...timeOptions,
                timeZone: "Pacific/Auckland",
            }).format(new Date());

            setLondonTime(lTime);
            setAucklandTime(aTime);
        };

        updateTimes();
        const interval = setInterval(updateTimes, 1000);
        return () => clearInterval(interval);
    }, []);

    // Click handler for WebGL Cards
    const handleCardClick = useCallback((img: GalleryImage, metadata: any) => {
        setSelectedMetadata({
            brand: metadata.brand,
            title: metadata.projectTitle,
            tags: metadata.tags,
            year: metadata.year,
        });
        setSelectedProject(img);
    }, []);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden cursor-none relative font-sans">
            <CustomCursor />

            {/* ── 1. Agency Header HUD ───────────────────────────────────────── */}
            <header className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-8 mix-blend-difference pointer-events-none flex justify-between items-center text-[10px] font-mono tracking-widest uppercase transition-opacity duration-500 ${
                selectedProject ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}>
                {/* Logo & Name */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Camera Aperture / Radial HUD Mascot SVG */}
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white animate-[spin_12s_linear_infinite]"
                    >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span className="font-black text-xs font-sans tracking-tighter">
                        clicks
                    </span>
                </div>

                {/* Central Statement (hidden on mobile) */}
                <div className="hidden md:block text-zinc-500 font-medium">
                    Creative Portfolio &bull; Imagining Spatial Dimensions
                </div>

                {/* Office Clock & CTA */}
                <div className="flex items-center gap-6 pointer-events-auto">
                    <div className="hidden lg:flex items-center gap-4 text-zinc-500">
                        <span>LDN {londonTime || "--:--:--"}</span>
                        <span className="text-zinc-700">|</span>
                        <span>AKL {aucklandTime || "--:--:--"}</span>
                    </div>
                    <a
                        href="mailto:hello@clicks.gallery"
                        className="px-4 py-2 border border-white rounded-full bg-white text-black hover:bg-black hover:text-white transition-all duration-300 font-bold"
                    >
                        Let&apos;s talk
                    </a>
                </div>
            </header>

            {/* ── 2. Gallery Canvas & Views Container ───────────────────────── */}
            <div className="w-screen h-screen relative bg-black">
                <ThreeGallery
                    images={allImages}
                    selectedImage={selectedProject}
                    onCardClick={handleCardClick}
                />
            </div>

            {/* ── 3. Project Specimen Details Overlay ───────────────────────── */}
            <AnimatePresence>
                {selectedProject && selectedMetadata && (
                    <ProjectDetail
                        image={selectedProject}
                        brand={selectedMetadata.brand}
                        projectTitle={selectedMetadata.title}
                        tags={selectedMetadata.tags}
                        year={selectedMetadata.year}
                        onClose={() => {
                            setSelectedProject(null);
                            setSelectedMetadata(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
