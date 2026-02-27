"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "../actions";

export default function UploadButton() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "optimizing" | "uploading" | "success" | "error">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const optimizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Target max dimension for optimization while keeping it "lossless" in appearance
                const MAX_WIDTH = 2500;
                const MAX_HEIGHT = 2500;

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                    },
                    "image/jpeg",
                    0.92 // High quality but optimized
                );
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus("optimizing");

        try {
            // 1. Optimize
            const optimizedBlob = await optimizeImage(file);
            const optimizedFile = new File([optimizedBlob], file.name, { type: "image/jpeg" });

            // 2. Upload
            setUploadStatus("uploading");
            const formData = new FormData();
            formData.append("file", optimizedFile);

            await uploadImage(formData);

            setUploadStatus("success");
            setTimeout(() => {
                setUploadStatus("idle");
                setIsUploading(false);
            }, 3000);

        } catch (error) {
            console.error("Upload failed:", error);
            setUploadStatus("error");
            setTimeout(() => setUploadStatus("idle"), 3000);
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed bottom-12 right-12 z-[60]">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`relative group flex items-center justify-center w-16 h-16 rounded-full glass border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden ${isUploading ? "cursor-wait bg-white/20" : "cursor-pointer hover:bg-white/10"
                    }`}
            >
                <AnimatePresence mode="wait">
                    {uploadStatus === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            className="relative w-6 h-6 flex items-center justify-center"
                        >
                            <div className="absolute w-full h-[2px] bg-white rounded-full" />
                            <div className="absolute w-[2px] h-full bg-white rounded-full" />
                        </motion.div>
                    )}

                    {(uploadStatus === "optimizing" || uploadStatus === "uploading") && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </motion.div>
                    )}

                    {uploadStatus === "success" && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="text-emerald-400 text-2xl"
                        >
                            ✓
                        </motion.div>
                    )}

                    {uploadStatus === "error" && (
                        <motion.div
                            key="error"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="text-rose-400 text-2xl"
                        >
                            ✕
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hover Text Label */}
                <div className="absolute top-[-40px] right-0 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-[10px] uppercase tracking-widest text-white/70 font-light">
                    {uploadStatus === "optimizing" ? "Optimizing..." :
                        uploadStatus === "uploading" ? "Uploading..." :
                            uploadStatus === "success" ? "Done!" : "Add Click"}
                </div>
            </motion.button>
        </div>
    );
}
