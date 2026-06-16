"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { GalleryImage } from "@/app/types";

export interface GridSlotProps {
    image: GalleryImage;
    borderRadius: string;
    isMorphing: boolean;
    /** Grid slot index (0-based). Only the first 6 images get priority loading. */
    index: number;
    onClick: () => void;
}

export default function GridSlot({
    image,
    borderRadius,
    isMorphing,
    index,
    onClick,
}: GridSlotProps) {
    const meta = image.metadata || {};

    return (
        <motion.div
            initial={{ borderRadius: "20px" }}
            animate={{
                borderRadius: borderRadius,
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
                priority={index < 6}
            />
        </motion.div>
    );
}
