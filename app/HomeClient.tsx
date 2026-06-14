"use client";

import {
    use,
    useEffect,
    useState,
    useRef,
    useCallback,
    useTransition,
    useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PageLoader from "./components/PageLoader";
import CustomCursor from "./components/CustomCursor";
import ThreeGallery from "./components/ThreeGallery";
import ProjectDetail from "./components/ProjectDetail";
import type { GalleryImage } from "./types";

// Dynamic metadata pool matching ThreeGallery for alignment
const BRANDS = [
    "AETHER", "SPECTRE", "NOVA", "ONYX", "QUANTUM", "APEX", "VORTEX", 
    "NEBULA", "HELIX", "SOLAS", "CHRONOS", "ECLIPSE", "IGNIS", "ZEPHYR"
];
const TITLES = [
    "DIGITAL REBIRTH", "CYBERNETIC GRID", "HYPER LUCID", "METAMORPHOSIS", 
    "ETHEREAL FLOW", "SPATIAL SHIFT", "SUBLIME LIGHT", "GRAVITY WAVE", 
    "PHANTOM VOID", "LUMINOUS PORTAL", "FUTURE CORE", "INFINITE SCROLL",
    "VERTEX LABS", "KINETIC THEORY"
];
const TAGS_POOL = [
    ["3D", "WEBGL"],
    ["EXPERIENCE", "MOTION"],
    ["BRANDING", "UI/UX"],
    ["CREATIVE", "DEV"],
    ["INTERACTIVE"],
    ["PRODUCT", "WebGL"]
];
const YEARS = ["2026", "2025", "2024"];

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

    // ── Layout Toggles (Grid vs List) ────────────────────────────────────────
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // ── Local Time HUD (London & Auckland) ──────────────────────────────────
    const [londonTime, setLondonTime] = useState("");
    const [aucklandTime, setAucklandTime] = useState("");

    // ── List View Hover Floating Thumbnail State ─────────────────────────────
    const [floatingProject, setFloatingProject] = useState<{
        img: GalleryImage;
        title: string;
    } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    // Generate projects mapping (same metadata structure as in ThreeGallery)
    const projects = useMemo(() => {
        return allImages.map((img, idx) => {
            const brand = BRANDS[idx % BRANDS.length];
            const title = TITLES[idx % TITLES.length];
            const tags = TAGS_POOL[idx % TAGS_POOL.length];
            const year = YEARS[idx % YEARS.length];
            return {
                img,
                brand,
                title,
                tags,
                year,
            };
        });
    }, [allImages]);

    // Group projects by Year for the List View
    const groupedProjectsByYear = useMemo(() => {
        const groups: { [key: string]: typeof projects } = {};
        projects.forEach((proj) => {
            if (!groups[proj.year]) {
                groups[proj.year] = [];
            }
            groups[proj.year].push(proj);
        });
        // Sort years descending
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [projects]);

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

    // Click handler for list view items
    const handleListProjectClick = (proj: typeof projects[number]) => {
        setSelectedMetadata({
            brand: proj.brand,
            title: proj.title,
            tags: proj.tags,
            year: proj.year,
        });
        setSelectedProject(proj.img);
    };

    // Tracking mouse movements for floating preview thumbnail in list view
    const handleListMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden cursor-none relative font-sans">
            <PageLoader />
            <CustomCursor />

            {/* ── 1. Agency Header HUD ───────────────────────────────────────── */}
            <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-8 mix-blend-difference pointer-events-none flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
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
                <AnimatePresence mode="wait">
                    {viewMode === "grid" ? (
                        /* WebGL 3D Sphere Grid View */
                        <motion.div
                            key="grid-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full h-full"
                        >
                            <ThreeGallery
                                images={allImages}
                                selectedImage={selectedProject}
                                onCardClick={handleCardClick}
                            />
                        </motion.div>
                    ) : (
                        /* Minimalist List View */
                        <motion.div
                            key="list-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full min-h-screen pt-36 pb-32 overflow-y-auto px-6 md:px-12 select-none"
                            onMouseMove={handleListMouseMove}
                        >
                            <div className="max-w-6xl mx-auto space-y-20">
                                {groupedProjectsByYear.map(([year, yearProjects]) => (
                                    <div key={year} className="space-y-6">
                                        {/* Year Header */}
                                        <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                                            <span className="text-sm font-mono tracking-widest text-zinc-500">
                                                / {year}
                                            </span>
                                            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                                                {yearProjects.length} projects completed
                                            </span>
                                        </div>

                                        {/* Projects Table */}
                                        <div className="divide-y divide-white/5 font-mono text-[11px] tracking-wider uppercase text-zinc-400">
                                            {yearProjects.map((proj) => (
                                                <div
                                                    key={`${proj.img.id}-${proj.brand}`}
                                                    onClick={() => handleListProjectClick(proj)}
                                                    onMouseEnter={() => setFloatingProject({ img: proj.img, title: proj.title })}
                                                    onMouseLeave={() => setFloatingProject(null)}
                                                    data-cursor="view"
                                                    className="py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 cursor-pointer hover:text-white transition-colors group relative"
                                                >
                                                    {/* Left Spec */}
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-zinc-600 w-8">
                                                            {String(proj.img.id).padStart(2, "0")}
                                                        </span>
                                                        <span className="text-white font-bold group-hover:translate-x-2 transition-transform duration-300">
                                                            {proj.brand}
                                                        </span>
                                                    </div>

                                                    {/* Center title */}
                                                    <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors md:pl-20">
                                                        {proj.title}
                                                    </div>

                                                    {/* Right Spec */}
                                                    <div className="text-zinc-500 text-[10px] tracking-[0.2em] font-light">
                                                        {proj.tags.join(" // ")}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── 3. Floating Preview Thumbnail (for List View) ────────────── */}
            {floatingProject && viewMode === "list" && (
                <div
                    className="fixed w-48 h-64 pointer-events-none z-40 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl transition-all duration-300 ease-out"
                    style={{
                        left: mousePos.x + 20,
                        top: mousePos.y + 20,
                        transform: "translate3d(0, 0, 0)",
                    }}
                >
                    <Image
                        src={floatingProject.img.src}
                        alt={floatingProject.title}
                        fill
                        className="object-cover animate-[pulse_2s_infinite]"
                        sizes="200px"
                    />
                </div>
            )}

            {/* ── 4. Project Specimen Details Overlay ───────────────────────── */}
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

            {/* ── 5. Bottom View Mode Navigation Pill ────────────────────────── */}
            <div
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-500 ${
                    selectedProject ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
                }`}
            >
                <div className="border border-white/10 rounded-full bg-black/60 backdrop-blur-md p-1.5 flex gap-2 font-mono text-[9px] tracking-widest uppercase text-zinc-400">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                            viewMode === "grid"
                                ? "bg-white text-black font-bold"
                                : "hover:text-white"
                        }`}
                    >
                        Grid 3D
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                            viewMode === "list"
                                ? "bg-white text-black font-bold"
                                : "hover:text-white"
                        }`}
                    >
                        List Spec
                    </button>
                </div>
            </div>
        </main>
    );
}
