"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { GalleryImage } from "../types";

interface LightboxProps {
    image: GalleryImage | null;
    onClose: () => void;
}

/**
 * A full-screen overlay for viewing a single image in high detail.
 * Features a heavy backdrop blur and body-scroll locking.
 * 
 * @param image - The image to display, or null if the lightbox should be hidden.
 * @param onClose - Callback function to close the lightbox.
 */
export default function Lightbox({ image, onClose }: LightboxProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (image) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            setIsVisible(false);
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [image]);

    if (!image) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 transition-all duration-500 ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                onClick={onClose}
            />

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-10 p-4 text-white/50 hover:text-white transition-all duration-500 uppercase text-[10px] tracking-[0.4em] font-light group"
            >
                <span className="inline-block transition-transform duration-500 group-hover:rotate-90 mr-2">✕</span>
                Close
            </button>

            {/* Image Container */}
            <div className={`relative z-10 max-w-[90vw] max-h-[85vh] transition-all duration-700 delay-100 ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-10"
                }`}>
                <div className="relative rounded-3xl overflow-hidden glass border border-white/10 shadow-3xl flex items-center justify-center">
                    <Image
                        src={image.src}
                        alt="Photography Gallery Image"
                        width={1600}
                        height={900}
                        sizes="90vw"
                        className="w-auto h-auto max-w-full max-h-[85vh] object-contain p-2"
                        priority
                        quality={95}
                    />
                </div>
            </div>

            <style jsx>{`
                .shadow-3xl {
                    box-shadow: 0 0 100px rgba(168, 85, 247, 0.1);
                }
            `}</style>
        </div>
    );
}
