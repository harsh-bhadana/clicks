"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import CustomCursor from "./components/CustomCursor";
import Lightbox from "./components/Lightbox";
import type { GalleryImage } from "./types";

interface HomeClientProps {
    initialImages: GalleryImage[];
}

interface ShiftInfo {
    type: "row" | "col" | "diag";
    index: number;      // Row (0-2), Col (0-2), or Diag (0 = main, 1 = anti)
    direction: "left" | "right" | "up" | "down" | "up-left" | "down-right" | "up-right" | "down-left";
}

interface MorphInfo {
    type: "row" | "col" | "diag";
    index: number;
}

const COLS = 4;
const ROWS = 3;

// Helper to pad/loop images array to exactly 12 elements
const padImages = (imgs: GalleryImage[], targetCount = 12): GalleryImage[] => {
    if (imgs.length === 0) return [];
    const result = [...imgs];
    while (result.length < targetCount) {
        result.push(...imgs);
    }
    return result.slice(0, targetCount);
};

interface GridSlotProps {
    image: GalleryImage;
    borderRadius: string;
    isMorphing: boolean;
    onClick: () => void;
}

function GridSlot({ image, borderRadius, isMorphing, onClick }: GridSlotProps) {
    const meta = image.metadata || {};

    return (
        <motion.div
            initial={{ borderRadius: "20px" }}
            animate={{
                borderRadius: borderRadius
            }}
            transition={{ duration: isMorphing ? 0.4 : 0.8, ease: "easeInOut" }}
            whileHover={{
                scale: 1.025,
                borderColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
            }}
            onClick={onClick}
            className="relative w-full h-full overflow-hidden rounded-[20px] border border-white/5 bg-zinc-950/20 group cursor-pointer"
        >
            <Image
                src={image.src}
                alt={meta.title || "Photo"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
            />


        </motion.div>
    );
}

// Helper to shift diagonal elements in the array state
const shiftDiag = (curr: GalleryImage[], index: number, dir: string): GalleryImage[] => {
    const next = [...curr];
    if (index === 0) {
        // Main diagonal: indices 0, 5, 10
        const elements = [next[0], next[5], next[10]];
        if (dir === "up-left") {
            const first = elements.shift()!;
            elements.push(first);
        } else {
            const last = elements.pop()!;
            elements.unshift(last);
        }
        next[0] = elements[0];
        next[5] = elements[1];
        next[10] = elements[2];
    } else {
        // Anti diagonal: indices 2, 5, 8
        const elements = [next[2], next[5], next[8]];
        if (dir === "down-left") {
            const last = elements.pop()!;
            elements.unshift(last);
        } else {
            const first = elements.shift()!;
            elements.push(first);
        }
        next[2] = elements[0];
        next[5] = elements[1];
        next[8] = elements[2];
    }
    return next;
};

export default function HomeClient({ initialImages }: HomeClientProps) {
    const [selectedProject, setSelectedProject] = useState<GalleryImage | null>(null);
    const [gridImages, setGridImages] = useState<GalleryImage[]>(() => padImages(initialImages, 12));
    const [shiftInfo, setShiftInfo] = useState<ShiftInfo | null>(null);
    const [morphInfo, setMorphInfo] = useState<MorphInfo | null>(null);
    const [shiftCount, setShiftCount] = useState(0);

    const getGlowColors = () => {
        const idx = shiftCount % 3;
        if (idx === 0) return { color1: "rgba(168, 85, 247, 0.85)", color2: "rgba(59, 130, 246, 0.85)" }; // Purple / Blue
        if (idx === 1) return { color1: "rgba(16, 185, 129, 0.85)", color2: "rgba(20, 184, 166, 0.85)" }; // Emerald / Teal
        return { color1: "rgba(244, 63, 94, 0.85)", color2: "rgba(245, 158, 11, 0.85)" }; // Rose / Amber
    };

    const { color1: glowColor1, color2: glowColor2 } = getGlowColors();

    const isCellParticipating = (col: number, row: number) => {
        if (!morphInfo) return false;
        if (morphInfo.type === "row" && row === morphInfo.index) return true;
        if (morphInfo.type === "col" && col === morphInfo.index) return true;
        if (morphInfo.type === "diag") {
            if (morphInfo.index === 0 && col === row && col < 3 && row < 3) return true;
            if (morphInfo.index === 1 && col + row === 2 && col < 3 && row < 3) return true;
        }
        return false;
    };

    const getCellBorderRadius = (col: number, row: number) => {
        if (!morphInfo) return "20px";
        if (morphInfo.type === "diag") return "50%";
        return "20px";
    };

    const getGridContainerAnimation = () => {
        return {
            rotateX: 0,
            rotateY: 0,
            x: 0,
            y: 0,
            scale: 1,
        };
    };

    // Carousel Shifting Effect: swaps a random row, column, or diagonal every 4 seconds
    useEffect(() => {
        if (gridImages.length < 12 || selectedProject) return;

        const interval = setInterval(() => {
            if (shiftInfo || morphInfo) return;

            // Pick shift type: 40% Row, 40% Col, 20% Diagonal
            const r = Math.random();
            const shiftType = r < 0.4 ? "row" : r < 0.8 ? "col" : "diag";

            const index = shiftType === "row" 
                ? Math.floor(Math.random() * ROWS) 
                : shiftType === "col" 
                ? Math.floor(Math.random() * COLS) 
                : Math.floor(Math.random() * 2);

            const direction = shiftType === "row"
                ? (Math.random() > 0.5 ? "left" : "right")
                : shiftType === "col"
                ? (Math.random() > 0.5 ? "up" : "down")
                : index === 0 
                ? (Math.random() > 0.5 ? "up-left" : "down-right")
                : (Math.random() > 0.5 ? "up-right" : "down-left");

            if (shiftType === "diag") {
                // Step 1: Trigger morphing shape (turns all to circle)
                setMorphInfo({ type: "diag", index });

                // Step 2: Wait 400ms for border-radius transition, then slide
                setTimeout(() => {
                    setShiftInfo({ type: "diag", index, direction });

                    // Step 3: Wait 1200ms for slide to complete, swap state, reset slide
                    setTimeout(() => {
                        setGridImages((curr) => shiftDiag(curr, index, direction));
                        setShiftInfo(null);

                        // Step 4: Wait 300ms as circle to settle, then morph back to squares
                        setTimeout(() => {
                            setMorphInfo(null);
                            setShiftCount((prev) => prev + 1);
                        }, 300);
                    }, 1200);
                }, 400);
            } else {
                // Row or Column shift: Start both immediately (no pre-slide delay)
                setMorphInfo({ type: shiftType, index });
                setShiftInfo({ type: shiftType, index, direction });

                // Wait 1200ms for slide to complete, swap state, reset shape
                setTimeout(() => {
                    setGridImages((curr) => {
                        if (shiftType === "row") {
                            const next = [...curr];
                            const startIndex = index * COLS;
                            const rowElements = [
                                next[startIndex],
                                next[startIndex + 1],
                                next[startIndex + 2],
                                next[startIndex + 3],
                            ];

                            if (direction === "left") {
                                const first = rowElements.shift()!;
                                rowElements.push(first);
                            } else {
                                const last = rowElements.pop()!;
                                rowElements.unshift(last);
                            }

                            for (let i = 0; i < COLS; i++) {
                                next[startIndex + i] = rowElements[i];
                            }
                            return next;
                        } else {
                            const next = [...curr];
                            const colElements = [
                                next[index],
                                next[index + 4],
                                next[index + 8],
                            ];

                            if (direction === "up") {
                                const first = colElements.shift()!;
                                colElements.push(first);
                            } else {
                                const last = colElements.pop()!;
                                colElements.unshift(last);
                            }

                            for (let i = 0; i < ROWS; i++) {
                                next[i * COLS + index] = colElements[i];
                            }
                            return next;
                        }
                    });
                    setShiftInfo(null);
                    setMorphInfo(null);
                    setShiftCount((prev) => prev + 1);
                }, 1200);
            }

        }, 4000);

        return () => clearInterval(interval);
    }, [gridImages, shiftInfo, morphInfo, selectedProject]);

    // Lightbox Prev / Next Handlers (cycle through the full list of images)
    const handlePrevPhoto = () => {
        if (!selectedProject || gridImages.length === 0) return;
        const currentIndex = gridImages.findIndex((img) => img.pathname === selectedProject.pathname);
        const prevIndex = (currentIndex - 1 + gridImages.length) % gridImages.length;
        setSelectedProject(gridImages[prevIndex]);
    };

    const handleNextPhoto = () => {
        if (!selectedProject || gridImages.length === 0) return;
        const currentIndex = gridImages.findIndex((img) => img.pathname === selectedProject.pathname);
        const nextIndex = (currentIndex + 1) % gridImages.length;
        setSelectedProject(gridImages[nextIndex]);
    };

    // Helper: compile transition offset animation props with Squash, Stretch, and Rotation
    const getCellAnimation = (col: number, row: number) => {
        const base = {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            scale: morphInfo && morphInfo.type === "diag" ? 0.707 : 1,
            rotate: 0,
            rotateX: 0,
            rotateY: 0,
            z: 0,
            opacity: 1,
            filter: "none",
        };

        if (!morphInfo) return base;

        const participating = isCellParticipating(col, row);

        if (!participating) {
            return {
                ...base,
                opacity: 0.45,
                scale: morphInfo.type === "diag" ? 0.707 : 0.94,
                filter: "blur(1.5px)",
            };
        }

        // Participating cell. Is the slide underway?
        if (!shiftInfo) {
            return base;
        }

        // Slide is underway
        if (shiftInfo.type === "row" && row === shiftInfo.index) {
            const isLeft = shiftInfo.direction === "left";
            return {
                ...base,
                x: isLeft ? "-100%" : "100%",
            };
        }

        if (shiftInfo.type === "col" && col === shiftInfo.index) {
            const isUp = shiftInfo.direction === "up";
            return {
                ...base,
                y: isUp ? "-100%" : "100%",
            };
        }

        if (shiftInfo.type === "diag") {
            if (shiftInfo.index === 0 && col === row) {
                // Main diagonal
                const isUpLeft = shiftInfo.direction === "up-left";
                const offset = isUpLeft ? "-100%" : "100%";
                return {
                    ...base,
                    x: offset,
                    y: offset,
                };
            }
            if (shiftInfo.index === 1 && col + row === 2) {
                // Anti diagonal
                const isUpRight = shiftInfo.direction === "up-right";
                const offsetX = isUpRight ? "100%" : "-100%";
                const offsetY = isUpRight ? "-100%" : "100%";
                return {
                    ...base,
                    x: offsetX,
                    y: offsetY,
                };
            }
        }

        return base;
    };

    // Helper: compile wrapping cell animation targets
    const getWrappingCellAnimation = () => {
        if (!shiftInfo) return {};

        if (shiftInfo.type === "row") {
            const isLeft = shiftInfo.direction === "left";
            return {
                x: isLeft ? "-100%" : "100%",
                y: 0,
            };
        }

        if (shiftInfo.type === "col") {
            const isUp = shiftInfo.direction === "up";
            return {
                x: 0,
                y: isUp ? "-100%" : "100%",
            };
        }

        // Diagonal shifts
        if (shiftInfo.index === 0) {
            const isUpLeft = shiftInfo.direction === "up-left";
            const offset = isUpLeft ? "-100%" : "100%";
            return {
                x: offset,
                y: offset,
                scale: 0.707,
            };
        } else {
            const isUpRight = shiftInfo.direction === "up-right";
            const offsetX = isUpRight ? "100%" : "-100%";
            const offsetY = isUpRight ? "-100%" : "100%";
            return {
                x: offsetX,
                y: offsetY,
                scale: 0.707,
            };
        }
    };

    // Helper: determine image index and position for the looping cell
    const getWrappingCell = () => {
        if (!shiftInfo) return null;

        if (shiftInfo.type === "row") {
            const isLeft = shiftInfo.direction === "left";
            const imgIndex = isLeft 
                ? shiftInfo.index * COLS 
                : shiftInfo.index * COLS + (COLS - 1);
            
            const image = gridImages[imgIndex];
            const left = isLeft ? "100%" : "-25%";
            const top = `${shiftInfo.index * 33.3333}%`;

            return { image, left, top };
        } else if (shiftInfo.type === "col") {
            const isUp = shiftInfo.direction === "up";
            const imgIndex = isUp
                ? shiftInfo.index
                : shiftInfo.index + (ROWS - 1) * COLS;

            const image = gridImages[imgIndex];
            const left = `${shiftInfo.index * 25}%`;
            const top = isUp ? "100%" : "-33.3333%";

            return { image, left, top };
        } else {
            // Diagonal shifts (ignores column 3)
            if (shiftInfo.index === 0) {
                const isUpLeft = shiftInfo.direction === "up-left";
                const imgIndex = isUpLeft ? 0 : 10;
                const image = gridImages[imgIndex];
                const left = isUpLeft ? "75%" : "-25%";
                const top = isUpLeft ? "100%" : "-33.3333%";
                return { image, left, top };
            } else {
                const isDownLeft = shiftInfo.direction === "down-left";
                const imgIndex = isDownLeft ? 8 : 2;
                const image = gridImages[imgIndex];
                const left = isDownLeft ? "75%" : "-25%";
                const top = isDownLeft ? "-33.3333%" : "100%";
                return { image, left, top };
            }
        }
    };

    const wrappingCell = getWrappingCell();

    return (
        <main className="w-screen h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden cursor-none relative font-sans flex items-center justify-center">
            <CustomCursor />

            {/* Ambient background glows */}
            <motion.div
                animate={{
                    backgroundColor: glowColor1,
                    scale: shiftInfo ? 1.25 : 1,
                    opacity: shiftInfo ? 0.75 : 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[50vw] h-[40vh] rounded-full blur-[140px] pointer-events-none"
            />
            <motion.div
                animate={{
                    backgroundColor: glowColor2,
                    scale: shiftInfo ? 1.25 : 1,
                    opacity: shiftInfo ? 0.75 : 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-[50vw] h-[40vh] rounded-full blur-[140px] pointer-events-none"
            />

            {/* ── Grid Content (Rubik's Absolute Layout) ─────────────────────── */}
            <section className="relative z-10 flex items-center justify-center">
                <motion.div
                    animate={getGridContainerAnimation()}
                    transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 12,
                        mass: 1.2,
                    }}
                    className="relative w-[96vw] aspect-[4/3] md:w-auto md:h-[75vh] overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md shadow-2xl select-none"
                >
                    
                    {/* Render the 12 standard cells */}
                    {gridImages.map((img, idx) => {
                        const col = idx % COLS;
                        const row = Math.floor(idx / COLS);

                        const left = `${col * 25}%`;
                        const top = `${row * 33.3333}%`;
                        const anim = getCellAnimation(col, row);

                        return (
                            <motion.div
                                key={`slot-${idx}`}
                                style={{
                                    position: "absolute",
                                    left,
                                    top,
                                    width: "25%",
                                    height: "33.3333%",
                                }}
                                animate={anim}
                                transition={
                                    shiftInfo
                                        ? {
                                              x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                                              y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                                              default: { duration: 0.35, ease: "easeOut" },
                                          }
                                        : {
                                              x: { duration: 0 },
                                              y: { duration: 0 },
                                              default: { duration: 0.35, ease: "easeOut" },
                                          }
                                }
                                className="p-1.5 md:p-2"
                            >
                                <GridSlot
                                    image={img}
                                    borderRadius={getCellBorderRadius(col, row)}
                                    isMorphing={!!morphInfo}
                                    onClick={() => setSelectedProject(img)}
                                />
                            </motion.div>
                        );
                    })}

                    {/* Render the 13th wrapping cell if shifting */}
                    {wrappingCell && (
                        <motion.div
                            style={{
                                position: "absolute",
                                left: wrappingCell.left,
                                top: wrappingCell.top,
                                width: "25%",
                                height: "33.3333%",
                            }}
                            initial={{
                                scale: shiftInfo?.type === "diag" ? 0.707 : 1
                            }}
                            animate={getWrappingCellAnimation()}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="p-1.5 md:p-2"
                        >
                            <motion.div 
                                initial={{
                                    borderRadius: shiftInfo?.type === "diag" ? "50%" : "20px"
                                }}
                                animate={{
                                    borderRadius: shiftInfo?.type === "diag" ? "50%" : "20px"
                                }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="relative w-full h-full overflow-hidden rounded-[20px] border border-white/5 bg-zinc-950/20 shadow-2xl"
                            >
                                <Image
                                    src={wrappingCell.image.src}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover"
                                />

                            </motion.div>
                        </motion.div>
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
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
