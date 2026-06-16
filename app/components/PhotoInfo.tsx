"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, Calendar, Aperture, Timer, Gauge } from "lucide-react";
import type { PhotoMetadata } from "@/app/types";

interface PhotoInfoProps {
    metadata: PhotoMetadata;
    isVisible: boolean;
}

/**
 * Slide-up EXIF/metadata overlay panel for the Lightbox.
 *
 * Hidden by default — toggled by pressing "i" or tapping the info button.
 * Shows camera settings, location, and story text in a minimal, dark style.
 */
export default function PhotoInfo({ metadata, isVisible }: PhotoInfoProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto"
                >
                    <div className="mx-auto max-w-3xl px-8 pb-8 pt-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                        {/* Title & Location */}
                        {metadata.title && (
                            <h2 className="text-lg font-light text-white tracking-wide mb-1">
                                {metadata.title}
                            </h2>
                        )}
                        <div className="flex items-center gap-4 text-zinc-500 text-xs font-mono tracking-wider mb-5">
                            {metadata.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    {metadata.location}
                                </span>
                            )}
                            {metadata.date && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {metadata.date}
                                </span>
                            )}
                        </div>

                        {/* EXIF Data Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs mb-5">
                            {metadata.camera && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Camera className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>{metadata.camera}</span>
                                </div>
                            )}
                            {metadata.lens && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Aperture className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>{metadata.lens}</span>
                                </div>
                            )}
                            {metadata.aperture && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <span className="text-zinc-600 text-[10px] font-bold w-3.5 text-center">
                                        ƒ
                                    </span>
                                    <span>{metadata.aperture}</span>
                                </div>
                            )}
                            {metadata.shutterSpeed && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Timer className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>{metadata.shutterSpeed}</span>
                                </div>
                            )}
                            {metadata.iso && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Gauge className="w-3.5 h-3.5 text-zinc-600" />
                                    <span>ISO {metadata.iso}</span>
                                </div>
                            )}
                            {metadata.category && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                                    <span>{metadata.category}</span>
                                </div>
                            )}
                        </div>

                        {/* Story */}
                        {metadata.story && (
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-lg">
                                {metadata.story}
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
