"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

/**
 * A custom interactive cursor component.
 * 
 * Replaces the default browser cursor with a visually styled element that follows
 * the mouse using Framer Motion springs. When hovering over interactive elements 
 * (like images or elements with `data-cursor`), the cursor expands and displays 
 * a contextual label (e.g., "view", "next", "prev").
 */
export default function CustomCursor() {
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const [cursorLabel, setCursorLabel] = useState("");

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 200 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            const target = e.target as HTMLElement;
            const interactive = target.closest('[data-cursor]') || target.closest('.cursor-pointer') || target.tagName === 'IMG';

            if (interactive) {
                const customLabel = (interactive as HTMLElement).getAttribute('data-cursor');
                setCursorLabel(customLabel || "view");
                setIsHoveringImage(true);
            } else {
                setIsHoveringImage(false);
                setCursorLabel("");
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/30 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%",
            }}
            animate={{
                width: isHoveringImage ? 80 : 32,
                height: isHoveringImage ? 80 : 32,
                backgroundColor: isHoveringImage ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)",
            }}
        >
            {isHoveringImage && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-bold text-black uppercase tracking-widest"
                >
                    {cursorLabel}
                </motion.span>
            )}
        </motion.div>
    );
}
