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
            className="fixed inset-0 z-[80] bg-black text-white cursor-auto select-none font-sans flex flex-col justify-between overflow-hidden"
        >
            {/* Header / Top Bar */}
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-300 uppercase">
                        {brand} &bull; {projectTitle}
                    </span>
                    <span className="px-2.5 py-0.5 border border-white/10 rounded-full text-[9px] tracking-widest font-mono text-zinc-500 uppercase">
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
                    Close
                </button>
            </div>

            {/* Content Area - Immersive Center Image */}
            <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-center py-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="relative w-full h-full max-h-[70vh] aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl"
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
            </div>

            {/* Footer / Info */}
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex justify-between items-center text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-t border-white/5">
                <span>Role: Creative Engineering</span>
                <span>Services: {tags.join(" // ")}</span>
            </div>
        </motion.div>
    );
}
