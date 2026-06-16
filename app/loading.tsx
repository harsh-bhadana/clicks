"use client";

import { motion } from "framer-motion";

/**
 * Skeleton loading state for the gallery.
 *
 * Displays a pulsing 4×3 grid of placeholder slots that matches
 * the real grid layout, giving instant perceived load.
 */
export default function Loading() {
    return (
        <main className="w-screen h-screen bg-black flex items-center justify-center">
            <div className="relative w-[96vw] aspect-[4/3] md:w-auto md:h-[75vh] overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md">
                {Array.from({ length: 12 }).map((_, idx) => {
                    const col = idx % 4;
                    const row = Math.floor(idx / 4);
                    return (
                        <motion.div
                            key={idx}
                            style={{
                                position: "absolute",
                                left: `${col * 25}%`,
                                top: `${row * 33.3333}%`,
                                width: "25%",
                                height: "33.3333%",
                            }}
                            className="p-1.5 md:p-2"
                        >
                            <motion.div
                                animate={{ opacity: [0.15, 0.3, 0.15] }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    delay: idx * 0.08,
                                    ease: "easeInOut",
                                }}
                                className="w-full h-full rounded-[20px] bg-zinc-800/60"
                            />
                        </motion.div>
                    );
                })}
            </div>
        </main>
    );
}
