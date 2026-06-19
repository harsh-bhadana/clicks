"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomCursor from "./components/CustomCursor";
import Lightbox from "./components/Lightbox";
import GridSlot from "./components/GridSlot";
import WrappingCell from "./components/WrappingCell";
import AmbientGlow from "./components/AmbientGlow";
import { useGridEngine } from "@/app/hooks/useGridEngine";
import { useGlowColors } from "@/app/hooks/useGlowColors";
import type { GalleryImage } from "./types";

interface HomeClientProps {
    initialImages: GalleryImage[];
}

export default function HomeClient({ initialImages }: HomeClientProps) {
    const [selectedProject, setSelectedProject] = useState<GalleryImage | null>(null);
    const [gridDimensions, setGridDimensions] = useState({ cols: 4, rows: 3 });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setGridDimensions({ cols: 3, rows: 4 });
            } else {
                setGridDimensions({ cols: 4, rows: 3 });
            }
        };

        handleResize(); // Run once on mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { cols, rows } = gridDimensions;

    const {
        gridImages,
        shiftInfo,
        morphInfo,
        shiftCount,
        getCellAnimation,
        getCellBorderRadius,
        getWrappingCellAnimation,
        getWrappingCell,
    } = useGridEngine(initialImages, !!selectedProject, cols, rows);

    const { glowColor1, glowColor2 } = useGlowColors(shiftCount);

    // Lightbox Prev / Next Handlers (cycle through the full list of images)
    const handlePrevPhoto = () => {
        if (!selectedProject || initialImages.length === 0) return;
        const currentIndex = initialImages.findIndex(
            (img) => img.pathname === selectedProject.pathname
        );
        const prevIndex = (currentIndex - 1 + initialImages.length) % initialImages.length;
        setSelectedProject(initialImages[prevIndex]);
    };

    const handleNextPhoto = () => {
        if (!selectedProject || initialImages.length === 0) return;
        const currentIndex = initialImages.findIndex(
            (img) => img.pathname === selectedProject.pathname
        );
        const nextIndex = (currentIndex + 1) % initialImages.length;
        setSelectedProject(initialImages[nextIndex]);
    };

    const wrappingCell = getWrappingCell();

    return (
        <main className="w-screen h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden cursor-none relative font-sans flex items-center justify-center">
            <CustomCursor />

            {/* Ambient background glows */}
            <AmbientGlow glowColor1={glowColor1} glowColor2={glowColor2} isShifting={!!shiftInfo} />

            {/* ── Grid Content (Rubik's Absolute Layout) ─────────────────────── */}
            <section className="relative z-10 flex items-center justify-center">
                <motion.div
                    animate={{
                        rotateX: 0,
                        rotateY: 0,
                        x: 0,
                        y: 0,
                        scale: 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 12,
                        mass: 1.2,
                    }}
                    className="relative w-[96vw] aspect-[3/4] md:aspect-[4/3] md:w-auto md:h-[75vh] overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md shadow-2xl select-none"
                >
                    {/* Render the 12 standard cells */}
                    {gridImages.map((img, idx) => {
                        const col = idx % cols;
                        const row = Math.floor(idx / cols);
                        const left = `${col * (100 / cols)}%`;
                        const top = `${row * (100 / rows)}%`;
                        const anim = getCellAnimation(col, row);

                        return (
                            <motion.div
                                key={`slot-${idx}`}
                                style={{
                                    position: "absolute",
                                    left,
                                    top,
                                    width: `${100 / cols}%`,
                                    height: `${100 / rows}%`,
                                }}
                                animate={anim}
                                transition={
                                    shiftInfo
                                        ? {
                                              x: {
                                                  duration: 1.2,
                                                  ease: [0.16, 1, 0.3, 1],
                                              },
                                              y: {
                                                  duration: 1.2,
                                                  ease: [0.16, 1, 0.3, 1],
                                              },
                                              default: {
                                                  duration: 0.35,
                                                  ease: "easeOut",
                                              },
                                          }
                                        : {
                                              x: { duration: 0 },
                                              y: { duration: 0 },
                                              default: {
                                                  duration: 0.35,
                                                  ease: "easeOut",
                                              },
                                          }
                                }
                                className="p-1.5 md:p-2"
                            >
                                <GridSlot
                                    image={img}
                                    borderRadius={getCellBorderRadius()}
                                    isMorphing={!!morphInfo}
                                    index={idx}
                                    onClick={() => setSelectedProject(img)}
                                />
                            </motion.div>
                        );
                    })}

                    {/* Render the 13th wrapping cell if shifting */}
                    {wrappingCell && (
                        <WrappingCell
                            data={wrappingCell}
                            isDiag={shiftInfo?.type === "diag"}
                            animate={getWrappingCellAnimation()}
                            cols={cols}
                            rows={rows}
                        />
                    )}
                </motion.div>
            </section>

            {/* Lightbox details popup */}
            <AnimatePresence>
                {selectedProject && (
                    <Lightbox
                        image={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onPrev={handlePrevPhoto}
                        onNext={handleNextPhoto}
                        totalImages={gridImages.length}
                        currentIndex={
                            gridImages.findIndex(
                                (img) => img.pathname === selectedProject.pathname
                            ) + 1
                        }
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
