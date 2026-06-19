"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    UploadCloud,
    RefreshCw,
    X,
    ImageIcon,
    FileImage,
    CheckCircle,
    AlertCircle,
    Info,
} from "lucide-react";
import exifr from "exifr";
import { compressImage } from "@/app/lib/compress";
import type { GalleryImage, PhotoMetadata } from "../../types";

interface ExtractedExif {
    title: string;
    camera: string;
    lens: string;
    aperture: string;
    shutterSpeed: string;
    iso: string;
    focalLength: string;
    latitude: number | undefined;
    longitude: number | undefined;
    date: string;
    exposureBias: string;
    flash: string;
    dimensions: string;
    megapixels: string;
    fileSize: string;
    location: string;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const extractFileExif = async (file: File): Promise<ExtractedExif> => {
    const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
    const defaultTitle = nameWithoutExt.replace(/[_-]/g, " ");

    const result: ExtractedExif = {
        title: defaultTitle,
        camera: "Unknown Camera",
        lens: "Unknown Lens",
        aperture: "f/2.8",
        shutterSpeed: "1/125s",
        iso: "100",
        focalLength: "",
        latitude: undefined,
        longitude: undefined,
        date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        exposureBias: "0.0ev",
        flash: "Flash did not fire",
        dimensions: "Unknown",
        megapixels: "Unknown",
        fileSize: formatBytes(file.size),
        location: "Unknown Location",
    };

    // Extract dimensions and megapixels asynchronously
    try {
        const dimensions = await new Promise<{ width: number; height: number }>(
            (resolve, reject) => {
                const img = new window.Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(img.src);
                    resolve({ width: img.naturalWidth, height: img.naturalHeight });
                };
                img.onerror = () => {
                    URL.revokeObjectURL(img.src);
                    reject(new Error("Failed to load image for dimensions"));
                };
            }
        );
        result.dimensions = `${dimensions.width}x${dimensions.height}`;
        result.megapixels = `${Math.round((dimensions.width * dimensions.height) / 1000000)}MP`;
    } catch (dimErr) {
        console.warn("Could not read image dimensions:", dimErr);
    }

    try {
        const data = await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
        });

        if (data) {
            if (data.Model) {
                const make = data.Make ? data.Make.trim() : "";
                const model = data.Model.trim();
                result.camera = model.toLowerCase().includes(make.toLowerCase())
                    ? model
                    : `${make} ${model}`;
            }

            if (data.LensModel) result.lens = data.LensModel;
            if (data.FNumber) result.aperture = `f/${data.FNumber}`;
            if (data.ExposureTime) {
                const exp = data.ExposureTime;
                result.shutterSpeed = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
            }
            if (data.ISO) result.iso = String(data.ISO);
            if (data.FocalLength) result.focalLength = `${data.FocalLength}mm`;
            if (data.ExposureBiasValue !== undefined && data.ExposureBiasValue !== null) {
                const bias = Number(data.ExposureBiasValue);
                result.exposureBias =
                    bias === 0
                        ? "0.0ev"
                        : bias > 0
                          ? `+${bias.toFixed(1)}ev`
                          : `${bias.toFixed(1)}ev`;
            }
            if (data.Flash !== undefined && data.Flash !== null) {
                const flashVal = Number(data.Flash);
                result.flash = (flashVal & 1) === 1 ? "Flash used" : "Flash did not fire";
            }
            if (data.latitude !== undefined && data.latitude !== null) {
                result.latitude = Number(data.latitude);
            }
            if (data.longitude !== undefined && data.longitude !== null) {
                result.longitude = Number(data.longitude);
            }

            if (data.DateTimeOriginal) {
                try {
                    const dateObj = new Date(data.DateTimeOriginal);
                    if (!isNaN(dateObj.getTime())) {
                        result.date = dateObj.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        });
                    }
                } catch {}
            }

            // If GPS coordinates exist, perform reverse geocoding
            if (data.latitude !== undefined && data.longitude !== undefined) {
                try {
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${data.latitude}&lon=${data.longitude}&format=json&accept-language=en`,
                        {
                            headers: {
                                "User-Agent":
                                    "ClicksGallery/2.0 (contact: harshbhadana40@outlook.com)",
                            },
                        }
                    );
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (geoData && geoData.address) {
                            const addr = geoData.address;
                            const parts = [];
                            if (addr.road) parts.push(addr.road);
                            if (addr.suburb || addr.neighbourhood)
                                parts.push(addr.suburb || addr.neighbourhood);
                            if (addr.village || addr.city_district || addr.subdistrict) {
                                parts.push(addr.village || addr.city_district || addr.subdistrict);
                            }
                            if (addr.city || addr.town) parts.push(addr.city || addr.town);
                            if (addr.state) parts.push(addr.state);
                            if (addr.country) parts.push(addr.country);
                            result.location = parts.join(", ") || geoData.display_name;
                        }
                    }
                } catch (geoErr) {
                    console.warn("Reverse geocoding failed:", geoErr);
                }
            }
        }
    } catch (exifErr) {
        console.warn("EXIF extraction error:", exifErr);
    }

    return result;
};

interface UploadClientProps {
    initialImages: GalleryImage[];
}

export default function UploadClient({ initialImages }: UploadClientProps) {
    const router = useRouter();

    // Staged File State
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pendingStory, setPendingStory] = useState("");
    const [shouldCompress, setShouldCompress] = useState(true);

    // Compressed state (for previewing sizes)
    const [compressedFile, setCompressedFile] = useState<File | null>(null);
    const [compressing, setCompressing] = useState(false);

    // EXIF parsed metadata
    const [exifData, setExifData] = useState<ExtractedExif | null>(null);

    // Upload Action states
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(
        null
    );

    // Clear feedback toast after 4s
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    // Handle preview and cleanup
    useEffect(() => {
        if (!pendingFile) {
            setPreviewUrl(null);
            setExifData(null);
            return;
        }

        const objectUrl = URL.createObjectURL(pendingFile);
        setPreviewUrl(objectUrl);

        // Extract EXIF data
        const runExifExtraction = async () => {
            try {
                const data = await extractFileExif(pendingFile);
                setExifData(data);
            } catch (err) {
                console.warn("EXIF extraction failed:", err);
            }
        };
        runExifExtraction();

        return () => URL.revokeObjectURL(objectUrl);
    }, [pendingFile]);

    // Real-time client-side compression preview
    useEffect(() => {
        if (!pendingFile) {
            setCompressedFile(null);
            return;
        }

        if (!shouldCompress) {
            setCompressedFile(null);
            return;
        }

        const runCompression = async () => {
            setCompressing(true);
            try {
                const result = await compressImage(pendingFile);
                setCompressedFile(result);
            } catch (err) {
                console.error("Compression failed:", err);
            } finally {
                setCompressing(false);
            }
        };

        runCompression();
    }, [pendingFile, shouldCompress]);

    // Save metadata back to Vercel Blob
    const handleSaveMetadata = async (updatedImages: GalleryImage[]) => {
        const metadataMap: Record<string, PhotoMetadata> = {};
        updatedImages.forEach((img) => {
            if (img.metadata) {
                metadataMap[img.pathname] = img.metadata;
            }
        });

        const res = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "saveMetadata", metadataMap }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Save metadata failed");
        }
    };

    // Handle Upload Action
    const handleFileUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingFile) return;

        setUploading(true);
        setUploadProgress("Compiling assets...");

        let fileToUpload = pendingFile;
        if (shouldCompress && compressedFile) {
            fileToUpload = compressedFile;
        }

        setUploadProgress("Uploading file to Vercel Blob store...");
        try {
            const formData = new FormData();
            formData.append("file", fileToUpload);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Upload failed");
            }

            // Create new photo metadata config
            const activeExif = exifData || ({} as Partial<ExtractedExif>);
            const newImage: GalleryImage = {
                src: data.url,
                id: Math.max(...initialImages.map((i) => i.id), 0) + 1,
                pathname: data.pathname,
                metadata: {
                    title: activeExif.title || pendingFile.name.split(".")[0],
                    location: activeExif.location || "Unknown Location",
                    date:
                        activeExif.date ||
                        new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                    category: "Street",
                    camera: activeExif.camera || "Unknown Camera",
                    lens: activeExif.lens || "Unknown Lens",
                    aperture: activeExif.aperture || "f/2.8",
                    shutterSpeed: activeExif.shutterSpeed || "1/125s",
                    iso: activeExif.iso || "100",
                    story: pendingStory || "A new addition to the clicks photography collection.",
                    focalLength: activeExif.focalLength || "",
                    gpsLatitude: activeExif.latitude,
                    gpsLongitude: activeExif.longitude,
                    exposureBias: activeExif.exposureBias || "0.0ev",
                    flash: activeExif.flash || "Flash did not fire",
                    dimensions: activeExif.dimensions || "Unknown",
                    megapixels: activeExif.megapixels || "Unknown",
                    fileSize: formatBytes(fileToUpload.size),
                },
            };

            const updatedImages = [newImage, ...initialImages];
            await handleSaveMetadata(updatedImages);

            setFeedback({ type: "success", msg: "Click uploaded successfully!" });

            // Wait a second for feedback visibility, then redirect
            setTimeout(() => {
                router.push("/admin");
                router.refresh();
            }, 1000);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setFeedback({ type: "error", msg: `Upload failed: ${errorMsg}` });
            setUploading(false);
        }
    };

    // Drag-drop events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setPendingFile(e.dataTransfer.files[0]);
            setPendingStory("");
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPendingFile(e.target.files[0]);
            setPendingStory("");
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-8 min-h-screen flex flex-col cursor-default w-full">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6 mb-8 w-full">
                <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                            clicks{" "}
                            <span className="text-[10px] font-mono text-neutral-500 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Upload Asset
                            </span>
                        </h1>
                    </div>
                </div>

                <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-all bg-neutral-900 border border-white/5 px-4 py-2 rounded-full cursor-pointer"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                </Link>
            </header>

            {/* Feedback Toasts */}
            {feedback && (
                <div
                    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-xl border ${
                        feedback.type === "success"
                            ? "bg-emerald-950/80 border-emerald-500/20 text-emerald-300"
                            : "bg-red-950/80 border-red-500/20 text-red-300"
                    }`}
                >
                    {feedback.type === "success" ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="text-xs font-mono tracking-wider">{feedback.msg}</span>
                </div>
            )}

            {/* Upload form container */}
            <form onSubmit={handleFileUploadSubmit} className="space-y-6">
                {/* Drag zone card */}
                {!pendingFile ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`group/drop relative h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 ${
                            dragActive
                                ? "border-purple-500 bg-purple-500/5 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                                : "border-white/10 bg-zinc-900/10 backdrop-blur-2xl hover:border-white/20 hover:bg-neutral-950/30 hover:shadow-xl"
                        }`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer w-full h-full flex flex-col items-center justify-center px-6"
                        >
                            <div className="h-14 w-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 mb-4 transition-all duration-300 group-hover/drop:scale-110 group-hover/drop:bg-purple-500/10 group-hover/drop:border-purple-500/20 group-hover/drop:text-purple-400 shadow-inner">
                                <UploadCloud className="h-6 w-6 text-purple-400 transition-transform group-hover/drop:-translate-y-0.5" />
                            </div>
                            <p className="text-sm font-bold text-white uppercase tracking-widest transition-colors group-hover/drop:text-purple-300">
                                Drag & Drop Photo Here
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-widest">
                                or click to browse local files
                            </p>
                        </label>
                    </div>
                ) : (
                    /* Photo Details editing stage */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Staged preview card */}
                        <div className="md:col-span-6 space-y-4">
                            <div className="rounded-3xl border border-white/10 bg-zinc-900/10 p-6 backdrop-blur-2xl shadow-xl flex flex-col space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <FileImage className="h-3.5 w-3.5 text-purple-400" /> Photo
                                        Preview
                                    </span>
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => {
                                            setPendingFile(null);
                                            setPendingStory("");
                                        }}
                                        className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer disabled:opacity-35"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-inner">
                                    {previewUrl && (
                                        <Image
                                            src={previewUrl}
                                            alt="Staged Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    )}
                                </div>

                                {/* Compression details card */}
                                <div className="bg-neutral-950/40 rounded-2xl p-4 border border-white/5 space-y-3 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-mono uppercase text-zinc-400">
                                            Original Size
                                        </span>
                                        <span className="text-xs text-white font-mono font-bold">
                                            {formatBytes(pendingFile.size)}
                                        </span>
                                    </div>

                                    {shouldCompress && (
                                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                            <span className="text-[9px] font-mono uppercase text-zinc-400">
                                                Compressed Size
                                            </span>
                                            <span className="text-xs text-purple-400 font-mono font-bold flex items-center gap-1.5">
                                                {compressing ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
                                                ) : compressedFile ? (
                                                    formatBytes(compressedFile.size)
                                                ) : (
                                                    "Calculating..."
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {shouldCompress && !compressing && compressedFile && (
                                        <div className="flex items-center justify-between border-t border-white/5 pt-3 bg-purple-500/5 -mx-4 -mb-4 p-3 rounded-b-2xl border-t-0">
                                            <span className="text-[9px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1">
                                                <Info className="h-3 w-3" /> Compression Ratio
                                            </span>
                                            <span className="text-xs text-emerald-400 font-mono font-bold">
                                                {Math.round(
                                                    ((pendingFile.size - compressedFile.size) /
                                                        pendingFile.size) *
                                                        100
                                                )}
                                                % reduction
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Staged Options editing card */}
                        <div className="md:col-span-6 space-y-6">
                            {/* Card 1: Compression setting */}
                            <div className="rounded-3xl border border-white/10 bg-zinc-900/10 p-6 backdrop-blur-2xl shadow-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400 shadow-inner">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
                                            Compress Image
                                        </h4>
                                        <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                                            Optimize dimensions and size for faster loading
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        disabled={uploading}
                                        checked={shouldCompress}
                                        onChange={(e) => setShouldCompress(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="relative w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-purple-600 transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white peer-checked:after:translate-x-4 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:shadow-[0_0_8px_rgba(168,85,247,0.3)]"></div>
                                </label>
                            </div>

                            {/* Card 2: Narrative info */}
                            <div className="rounded-3xl border border-white/10 bg-zinc-900/10 p-6 backdrop-blur-2xl shadow-xl space-y-4">
                                <h3 className="text-xs font-bold tracking-widest text-zinc-400 border-b border-white/5 pb-2 uppercase font-mono">
                                    Photo Narrative
                                </h3>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                                        Story / Memory Behind Shot
                                    </label>
                                    <textarea
                                        rows={6}
                                        disabled={uploading}
                                        value={pendingStory}
                                        onChange={(e) => setPendingStory(e.target.value)}
                                        placeholder="Add a description or story behind this photograph..."
                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Upload Action buttons */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={uploading || compressing}
                                    className="relative overflow-hidden w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] disabled:from-zinc-850 disabled:to-zinc-850 disabled:text-zinc-500 px-4 py-3 text-xs font-bold text-white transition-all duration-300 uppercase tracking-widest cursor-pointer shadow-lg shadow-purple-950/20"
                                >
                                    {uploading ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <UploadCloud className="h-4 w-4" />
                                    )}
                                    {uploading ? "Uploading to Cloud..." : "Upload Photo"}
                                </button>

                                {uploading && (
                                    <div className="w-full text-center py-1">
                                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider animate-pulse">
                                            {uploadProgress}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
