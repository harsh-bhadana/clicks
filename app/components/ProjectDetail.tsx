"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { GalleryImage } from "../types";

interface ProjectDetailProps {
    image: GalleryImage | null;
    onClose: () => void;
    // Mock metadata we generate
    brand: string;
    projectTitle: string;
    tags: string[];
    year: string;
}

export default function ProjectDetail({
    image,
    onClose,
    brand,
    projectTitle,
    tags,
    year,
}: ProjectDetailProps) {
    // Lock scroll when project detail is open
    useEffect(() => {
        if (image) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [image]);

    if (!image) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[80] bg-black overflow-y-auto text-white cursor-auto select-text font-sans"
        >
            {/* Header / Top Bar */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">
                        Project Specimen
                    </span>
                    <span className="px-2.5 py-0.5 border border-white/10 rounded-full text-[9px] tracking-widest font-mono text-zinc-400 uppercase">
                        {year}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] text-zinc-400 hover:text-white uppercase transition-colors group"
                >
                    <span className="inline-block transition-transform duration-500 group-hover:rotate-90">
                        ✕
                    </span>
                    Close Project
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-20">
                {/* Titles */}
                <div className="space-y-4">
                    <p className="text-zinc-500 text-sm tracking-[0.2em] font-mono uppercase">
                        {brand}
                    </p>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                        {projectTitle}
                    </h1>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/5 font-mono text-[11px] tracking-wider uppercase text-zinc-400">
                    <div className="space-y-2">
                        <p className="text-zinc-600 text-[9px]">Client</p>
                        <p className="text-white font-medium">{brand} Studios</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-zinc-600 text-[9px]">Services</p>
                        <p className="text-white font-medium">{tags.join(" / ")}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-zinc-600 text-[9px]">Role</p>
                        <p className="text-white font-medium">Creative Engineering</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-zinc-600 text-[9px]">Location</p>
                        <p className="text-white font-medium">London &bull; Remote</p>
                    </div>
                </div>

                {/* Conceptual Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-6">
                    <div className="md:col-span-5 space-y-6">
                        <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase">
                            01 // Concept & Vision
                        </p>
                        <p className="text-lg text-zinc-300 leading-relaxed font-light">
                            Revisiting standard interaction design to construct a fully spatial grid interface. We built a custom WebGL coordinate projection system, aligning flat image assets into a virtual sphere that wraps around the viewport to create an immersive, dimension-warping landscape.
                        </p>
                    </div>
                    <div className="md:col-span-7 space-y-6">
                        <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase">
                            02 // Technical Specs
                        </p>
                        <p className="text-zinc-400 leading-relaxed font-light text-sm">
                            Powered by a custom raycaster loop for low-latency hover detection and click target resolution. Dragging inertia uses a linear interpolation (lerp) coefficient of 0.08, providing a physical, viscous scroll sensation inspired by high-end inertial scroll controllers. Each project item is preloaded into memory asynchronously and drawn to a Canvas texture to guarantee hardware-accelerated 3D typography rendering on the GPU.
                        </p>
                    </div>
                </div>

                {/* Primary Project Image Showcase */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-950"
                >
                    <Image
                        src={image.src}
                        alt={projectTitle}
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                    />
                </motion.div>

                {/* Gallery Details / Floating grid showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                    <div className="h-[400px] relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-950">
                        <Image
                            src={image.src}
                            alt="Detail view 1"
                            fill
                            className="object-cover saturate-0 hover:saturate-100 transition-all duration-[1000ms] ease-out"
                            quality={85}
                        />
                    </div>
                    <div className="h-[400px] relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-950">
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 flex flex-col justify-end p-8 md:p-12 space-y-4">
                            <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">
                                Production Spec
                            </span>
                            <h3 className="text-2xl font-bold uppercase tracking-tight">
                                Immersive Spatial Coordinates
                            </h3>
                            <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-md">
                                Every card coordinates with the origin, tilting dynamically to follow the cursor movement and camera vector in real-time.
                            </p>
                        </div>
                        <Image
                            src={image.src}
                            alt="Detail view 2"
                            fill
                            className="object-cover blur-sm opacity-40 scale-105"
                            quality={80}
                        />
                    </div>
                </div>

                {/* Bottom navigation spacer */}
                <div className="pt-24 pb-16 flex flex-col items-center justify-center border-t border-white/5 space-y-8">
                    <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase">
                        End of Case Study
                    </p>
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-white text-black hover:bg-zinc-200 transition-colors rounded-full font-mono text-[11px] tracking-widest uppercase font-bold"
                    >
                        Return to Gallery
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
