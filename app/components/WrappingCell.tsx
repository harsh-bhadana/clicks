"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import Image from "next/image";
import type { GalleryImage } from "@/app/types";

export interface WrappingCellData {
    image: GalleryImage;
    left: string;
    top: string;
}

interface WrappingCellProps {
    data: WrappingCellData;
    isDiag: boolean;
    animate: TargetAndTransition;
    cols: number;
    rows: number;
}

export default function WrappingCell({ data, isDiag, animate, cols, rows }: WrappingCellProps) {
    return (
        <motion.div
            style={{
                position: "absolute",
                left: data.left,
                top: data.top,
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
            }}
            initial={{
                scale: isDiag ? 0.707 : 1,
            }}
            animate={animate}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-1.5 md:p-2"
        >
            <motion.div
                initial={{
                    borderRadius: isDiag ? "50%" : "20px",
                }}
                animate={{
                    borderRadius: isDiag ? "50%" : "20px",
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative w-full h-full overflow-hidden rounded-[20px] border border-white/5 bg-zinc-950/20 shadow-2xl"
            >
                <Image
                    src={data.image.src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                />
            </motion.div>
        </motion.div>
    );
}
