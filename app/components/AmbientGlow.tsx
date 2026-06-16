"use client";

import { motion } from "framer-motion";

interface AmbientGlowProps {
    glowColor1: string;
    glowColor2: string;
    isShifting: boolean;
}

export default function AmbientGlow({ glowColor1, glowColor2, isShifting }: AmbientGlowProps) {
    return (
        <>
            <motion.div
                animate={{
                    backgroundColor: glowColor1,
                    scale: isShifting ? 1.25 : 1,
                    opacity: isShifting ? 0.75 : 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[50vw] h-[40vh] rounded-full blur-[140px] pointer-events-none"
            />
            <motion.div
                animate={{
                    backgroundColor: glowColor2,
                    scale: isShifting ? 1.25 : 1,
                    opacity: isShifting ? 0.75 : 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-[50vw] h-[40vh] rounded-full blur-[140px] pointer-events-none"
            />
        </>
    );
}
