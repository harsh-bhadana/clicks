"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Camera,
    MapPin,
    Calendar,
    Compass,
    Lock,
    LogOut,
    ArrowLeft,
    UploadCloud,
    Trash2,
    Edit,
    Save,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    X,
    ImageIcon,
} from "lucide-react";
import exifr from "exifr";
import type { GalleryImage, PhotoMetadata } from "../types";
import { compressImage } from "@/app/lib/compress";

// Clean category choices
const CATEGORIES = ["Street", "Landscape", "Travel", "Minimal", "Portrait"];

// Beautiful pre-curated color palettes
const COLOR_PALETTES = [
    { name: "Monochrome Slate", colors: ["#09090b", "#18181b", "#3f3f46", "#71717a", "#d4d4d8"] },
    { name: "Slate Blue", colors: ["#0f172a", "#1e293b", "#475569", "#94a3b8", "#cbd5e1"] },
    { name: "Warm Stone", colors: ["#1c1917", "#292524", "#57534e", "#a8a29e", "#e7e5e4"] },
    { name: "Teal Forest", colors: ["#022c22", "#064e3b", "#0f766e", "#14b8a6", "#99f6e4"] },
    { name: "Indigo Night", colors: ["#1e1b4b", "#312e81", "#4f46e5", "#818cf8", "#c7d2fe"] },
    { name: "Sunset Gold", colors: ["#1e1510", "#451a03", "#9a3412", "#ea580c", "#ffedd5"] },
];

interface AdminClientProps {
    initialImages: GalleryImage[];
}

export default function AdminClient({ initialImages }: AdminClientProps) {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    // Image/Gallery states
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

    // Upload Form states
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [dragActive, setDragActive] = useState(false);

    // Edit form states
    const [formTitle, setFormTitle] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formDate, setFormDate] = useState("");
    const [formCategory, setFormCategory] = useState("Street");
    const [formCamera, setFormCamera] = useState("");
    const [formLens, setFormLens] = useState("");
    const [formAperture, setFormAperture] = useState("");
    const [formShutterSpeed, setFormShutterSpeed] = useState("");
    const [formIso, setFormIso] = useState("");
    const [formStory, setFormStory] = useState("");
    const [formPalette, setFormPalette] = useState<string[]>(COLOR_PALETTES[0].colors);
    const [formFocalLength, setFormFocalLength] = useState("");
    const [formLatitude, setFormLatitude] = useState<number | undefined>(undefined);
    const [formLongitude, setFormLongitude] = useState<number | undefined>(undefined);
    const [shouldCompress, setShouldCompress] = useState(true);
    const [activeTab, setActiveTab] = useState<"general" | "specs" | "location">("general");
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingStory, setPendingStory] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pendingDimensions, setPendingDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);

    useEffect(() => {
        if (!pendingFile) {
            setPreviewUrl(null);
            setPendingDimensions(null);
            return;
        }
        const url = URL.createObjectURL(pendingFile);
        setPreviewUrl(url);

        const img = new window.Image();
        img.src = url;
        img.onload = () => {
            setPendingDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [pendingFile]);

    // Toast/Feedback state
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(
        null
    );
    const [saving, setSaving] = useState(false);

    // Check auth on load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/admin");
                const data = await res.json();
                setIsAuthenticated(data.authorized);
            } catch (err) {
                console.error("Auth check failed:", err);
                setIsAuthenticated(false);
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Clear feedback toast after 4s
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    // Handle Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        try {
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
            } else {
                setAuthError(data.error || "Login failed");
            }
        } catch {
            setAuthError("Network error. Try again.");
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        try {
            await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
            });
            setIsAuthenticated(false);
            setPassword("");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    // Load Image details into Edit Form
    const handleStartEdit = (img: GalleryImage) => {
        setEditingImage(img);
        const meta = img.metadata || {};
        setFormTitle(meta.title || "");
        setFormLocation(meta.location || "");
        setFormDate(meta.date || "");
        setFormCategory(meta.category || "Street");
        setFormCamera(meta.camera || "");
        setFormLens(meta.lens || "");
        setFormAperture(meta.aperture || "");
        setFormShutterSpeed(meta.shutterSpeed || "");
        setFormIso(meta.iso || "");
        setFormStory(meta.story || "");
        setFormPalette(meta.colorPalette || COLOR_PALETTES[0].colors);
        setFormFocalLength(meta.focalLength || "");
        setFormLatitude(meta.gpsLatitude);
        setFormLongitude(meta.gpsLongitude);

        // Smooth scroll to form on mobile devices
        setTimeout(() => {
            const formEl = document.getElementById("metadata-edit-form");
            if (formEl) {
                formEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 100);
    };

    // Generate full metadata.json mapping from current images state
    const compileMetadataMap = (updatedImages: GalleryImage[]) => {
        const map: Record<string, PhotoMetadata> = {};
        updatedImages.forEach((img) => {
            if (img.metadata) {
                map[img.pathname] = img.metadata;
            }
        });
        return map;
    };

    // Save metadata updates back to Vercel Blob
    const handleSaveMetadata = async (updatedImages: GalleryImage[]) => {
        setSaving(true);
        try {
            const metadataMap = compileMetadataMap(updatedImages);
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "saveMetadata", metadataMap }),
            });
            if (res.ok) {
                setFeedback({ type: "success", msg: "Gallery metadata updated successfully!" });
                setImages(updatedImages);
            } else {
                const data = await res.json();
                throw new Error(data.error || "Save failed");
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setFeedback({ type: "error", msg: `Failed to save: ${errorMsg}` });
        } finally {
            setSaving(false);
        }
    };

    // Update individual metadata inside form
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingImage) return;

        const updatedMetadata: PhotoMetadata = {
            title: formTitle,
            location: formLocation,
            date: formDate,
            category: formCategory,
            camera: formCamera,
            lens: formLens,
            aperture: formAperture,
            shutterSpeed: formShutterSpeed,
            iso: formIso,
            story: formStory,
            colorPalette: formPalette,
            focalLength: formFocalLength,
            gpsLatitude: formLatitude,
            gpsLongitude: formLongitude,
        };

        const updatedImages = images.map((img) => {
            if (img.pathname === editingImage.pathname) {
                return { ...img, metadata: updatedMetadata };
            }
            return img;
        });

        handleSaveMetadata(updatedImages);
        setEditingImage(null);
    };

    // Helper: Parse EXIF data client-side using exifr
    const extractFileExif = async (file: File) => {
        try {
            setUploadProgress("Reading EXIF metadata...");
            const data = await exifr.parse(file, {
                tiff: true,
                exif: true,
                gps: true,
            });

            if (data) {
                // Pre-fill form fields
                if (data.Model) {
                    const make = data.Make ? data.Make.trim() : "";
                    const model = data.Model.trim();
                    setFormCamera(
                        model.toLowerCase().includes(make.toLowerCase())
                            ? model
                            : `${make} ${model}`
                    );
                }
                if (data.LensModel) setFormLens(data.LensModel);
                if (data.FNumber) setFormAperture(`f/${data.FNumber}`);
                if (data.ExposureTime) {
                    const exp = data.ExposureTime;
                    setFormShutterSpeed(exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`);
                }
                if (data.ISO) setFormIso(String(data.ISO));
                if (data.FocalLength) setFormFocalLength(`${data.FocalLength}mm`);
                if (data.latitude !== undefined && data.latitude !== null) {
                    setFormLatitude(Number(data.latitude));
                }
                if (data.longitude !== undefined && data.longitude !== null) {
                    setFormLongitude(Number(data.longitude));
                }
                if (data.DateTimeOriginal) {
                    const dateObj = new Date(data.DateTimeOriginal);
                    setFormDate(
                        dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    );
                }

                // Default title
                const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
                setFormTitle(nameWithoutExt.replace(/[_-]/g, " "));
            }
        } catch (err) {
            console.warn("Could not read EXIF:", err);
        }
    };

    // File Upload Handler
    const handleFileUpload = async (file: File, customStory?: string) => {
        if (!file.type.startsWith("image/")) {
            setFeedback({ type: "error", msg: "Please select a valid image file" });
            return;
        }

        setUploading(true);
        setUploadProgress("Analyzing image details & EXIF...");

        // Extract metadata first from the original file to preserve EXIF data
        await extractFileExif(file);

        let fileToUpload = file;
        if (shouldCompress) {
            setUploadProgress("Optimizing image quality...");
            try {
                fileToUpload = await compressImage(file, 0.85, 2560);
            } catch (compressErr) {
                console.warn("Client compression failed, falling back to original", compressErr);
            }
        }

        setUploadProgress("Uploading file to Vercel Blob...");
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

            // Successfully uploaded image
            const newImage: GalleryImage = {
                src: data.url,
                id: Math.max(...images.map((i) => i.id), 0) + 1,
                pathname: data.pathname,
                metadata: {
                    title: formTitle || file.name.split(".")[0].replace(/[_-]/g, " "),
                    location: formLocation || "Unknown Location",
                    date:
                        formDate ||
                        new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                    category: formCategory,
                    camera: formCamera || "Unknown Camera",
                    lens: formLens || "Unknown Lens",
                    aperture: formAperture || "f/2.8",
                    shutterSpeed: formShutterSpeed || "1/125s",
                    iso: formIso || "100",
                    story:
                        customStory ||
                        formStory ||
                        "A new addition to the clicks photography collection.",
                    colorPalette: formPalette,
                    focalLength: formFocalLength,
                    gpsLatitude: formLatitude,
                    gpsLongitude: formLongitude,
                },
            };

            // Save new images array
            const updatedImages = [newImage, ...images];
            await handleSaveMetadata(updatedImages);

            // Open editing panel on this newly uploaded file to review
            handleStartEdit(newImage);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setFeedback({ type: "error", msg: `Upload failed: ${errorMsg}` });
        } finally {
            setUploading(false);
            setUploadProgress("");
        }
    };

    const triggerPendingUpload = async () => {
        if (!pendingFile) return;
        const file = pendingFile;
        const story = pendingStory;
        setPendingFile(null);
        setPendingStory("");
        await handleFileUpload(file, story);
    };

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

    // Handle Delete
    const handleDeleteImage = async (img: GalleryImage) => {
        if (
            !confirm(
                `Are you sure you want to delete "${img.metadata?.title || "this image"}"? This will delete the file from Vercel Blob store permanently.`
            )
        ) {
            return;
        }

        setSaving(true);
        try {
            // 1. Delete the image blob from Vercel storage
            const deleteRes = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "deleteImage", url: img.src }),
            });

            if (!deleteRes.ok) {
                const deleteData = await deleteRes.json();
                throw new Error(deleteData.error || "Delete failed");
            }

            // 2. Remove from list and save metadata.json
            const updatedImages = images.filter((i) => i.pathname !== img.pathname);
            await handleSaveMetadata(updatedImages);

            if (editingImage?.pathname === img.pathname) {
                setEditingImage(null);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setFeedback({ type: "error", msg: `Delete failed: ${errorMsg}` });
        } finally {
            setSaving(false);
        }
    };

    // Render loading state
    if (authLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 font-mono text-zinc-500 text-xs cursor-default">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400 mb-4" />
                VERIFYING SYSTEM CREDENTIALS...
            </div>
        );
    }

    // Render Login Interface
    if (!isAuthenticated) {
        return (
            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-neutral-950 px-6 py-12 cursor-default">
                {/* Visual Backdrop Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_55%)]" />

                <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/40 p-8 md:p-10 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col items-center text-center">
                        {/* Rotating Aperture Logo */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/5 mb-6 text-purple-400 shadow-inner">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="animate-[spin_16s_linear_infinite]"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="4"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                />
                                <path
                                    d="M12 2V6M12 18V22M2 12H6M18 12H22"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <h1 className="text-xl font-light tracking-wide text-white">clicks</h1>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                            photographer console
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                                authorization password
                            </label>
                            <div className="relative w-full">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter passcode"
                                    className="w-full h-11 px-4 pl-10 rounded-xl border border-white/10 bg-neutral-950/80 text-xs text-white placeholder-neutral-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                            </div>
                        </div>

                        {authError && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-500/10 px-4 py-3 text-xs text-red-400 font-mono">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{authError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-xs font-bold text-white transition-all uppercase tracking-wider font-sans cursor-pointer shadow-lg shadow-purple-950/20"
                        >
                            verify access
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
                        >
                            <ArrowLeft className="h-3 w-3" /> Back to Gallery
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render Admin Dashboard
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
                                CMS Console
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-all bg-neutral-900 border border-white/5 px-4 py-2 rounded-full"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Gallery
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-all bg-red-950/20 border border-red-500/10 px-4 py-2 rounded-full cursor-pointer"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Log Out
                    </button>
                </div>
            </header>

            {/* Toast Feedbacks */}
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

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start w-full">
                {/* LEFT SIDE: UPLOADER & EDIT FORM */}
                <div className="lg:col-span-5 space-y-8 w-full">
                    {/* Premium Uploader Card */}
                    <div className="rounded-3xl border border-white/10 bg-zinc-900/10 p-6 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-xs font-bold tracking-widest text-zinc-400 mb-5 flex items-center gap-2 uppercase font-mono">
                            <UploadCloud className="h-4 w-4 text-purple-400" /> Upload New Click
                        </h2>

                        {!pendingFile ? (
                            <div className="space-y-5">
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative h-56 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 ${
                                        dragActive
                                            ? "border-purple-500/50 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                                            : "bg-neutral-950/40 hover:border-white/20 hover:bg-neutral-950/60"
                                    } ${uploading ? "pointer-events-none opacity-50" : ""}`}
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
                                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 mb-3 border border-white/5 shadow-inner transition-transform group-hover:scale-105">
                                            {uploading ? (
                                                <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                                            ) : (
                                                <UploadCloud className="h-5 w-5 text-purple-400" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-white uppercase tracking-widest">
                                            {uploading ? "Optimizing Click..." : "Drop photo here"}
                                        </p>
                                        <p className="text-[9px] text-zinc-500 mt-1 font-mono uppercase tracking-widest">
                                            or click to browse files
                                        </p>
                                    </label>

                                    {uploading && (
                                        <div className="absolute inset-0 bg-neutral-950/95 rounded-2xl flex flex-col items-center justify-center p-6 backdrop-blur-md">
                                            <RefreshCw className="h-6 w-6 animate-spin text-purple-400 mb-3" />
                                            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                                {uploadProgress}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Compression Toggle */}
                                <div className="border-t border-white/5 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-purple-400">
                                                <Save className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
                                                    Compress Images
                                                </h4>
                                                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                                                    Reduce file size without losing visual fidelity
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={shouldCompress}
                                                onChange={(e) =>
                                                    setShouldCompress(e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-8 h-4 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-neutral-950/40 rounded-2xl p-4 border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-purple-400 shrink-0" />
                                            <span className="text-[10px] font-mono text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
                                                {pendingFile.name}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPendingFile(null);
                                                setPendingStory("");
                                            }}
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Left: 16:9 Image Preview */}
                                        <div className="w-full md:w-1/2 space-y-2">
                                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shadow-inner group">
                                                {previewUrl && (
                                                    <Image
                                                        src={previewUrl}
                                                        alt="Staged Preview"
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-102"
                                                        unoptimized
                                                    />
                                                )}
                                            </div>
                                            <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-1">
                                                <span>
                                                    {pendingDimensions
                                                        ? `${pendingDimensions.width} × ${pendingDimensions.height} px`
                                                        : "Loading dimensions..."}
                                                </span>
                                                <span>
                                                    {(() => {
                                                        const bytes = pendingFile.size;
                                                        if (bytes === 0) return "0 B";
                                                        const k = 1024;
                                                        const sizes = ["B", "KB", "MB"];
                                                        const i = Math.floor(
                                                            Math.log(bytes) / Math.log(k)
                                                        );
                                                        return (
                                                            parseFloat(
                                                                (bytes / Math.pow(k, i)).toFixed(1)
                                                            ) +
                                                            " " +
                                                            sizes[i]
                                                        );
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: Add Description */}
                                        <div className="w-full md:w-1/2 flex flex-col space-y-1.5">
                                            <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase">
                                                Description / Story
                                            </label>
                                            <textarea
                                                value={pendingStory}
                                                onChange={(e) => setPendingStory(e.target.value)}
                                                placeholder="Write the story behind this click..."
                                                rows={4}
                                                maxLength={240}
                                                className="w-full flex-grow p-3 rounded-xl border border-white/10 bg-neutral-950/80 text-xs text-white placeholder-neutral-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-sans leading-relaxed resize-none"
                                            />
                                            <div className="flex justify-end">
                                                <span className="text-[9px] font-mono text-zinc-500">
                                                    {pendingStory.length}/240 characters
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Upload Action Button */}
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={triggerPendingUpload}
                                        className="w-full bg-purple-600 hover:bg-purple-500 active:scale-98 text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-purple-950/20 transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
                                    >
                                        <UploadCloud
                                            className="h-4 w-4"
                                            style={{ strokeWidth: 2.5 }}
                                        />
                                        Upload Assets
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metadata Edit Form */}
                    {editingImage ? (
                        <form
                            id="metadata-edit-form"
                            onSubmit={handleFormSubmit}
                            className="rounded-3xl border border-white/10 bg-zinc-900/10 p-6 backdrop-blur-2xl space-y-6 shadow-xl"
                        >
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <h2 className="text-xs font-bold tracking-widest text-zinc-400 flex items-center gap-2 uppercase font-mono">
                                    <Edit className="h-4 w-4 text-purple-400" /> Photo Settings
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setEditingImage(null)}
                                    className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-widest cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Image Preview */}
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-neutral-950 shadow-inner">
                                <Image
                                    src={editingImage.src}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex border-b border-white/5 pb-1 gap-4 text-[9px] font-mono">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("general")}
                                    className={`pb-2 border-b-2 uppercase tracking-widest transition-all cursor-pointer ${
                                        activeTab === "general"
                                            ? "border-purple-500 text-white font-bold"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    General
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("specs")}
                                    className={`pb-2 border-b-2 uppercase tracking-widest transition-all cursor-pointer ${
                                        activeTab === "specs"
                                            ? "border-purple-500 text-white font-bold"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    Camera
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("location")}
                                    className={`pb-2 border-b-2 uppercase tracking-widest transition-all cursor-pointer ${
                                        activeTab === "location"
                                            ? "border-purple-500 text-white font-bold"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    Location
                                </button>
                            </div>

                            {/* Fields */}
                            {activeTab === "general" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3.5 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formCategory}
                                                onChange={(e) => setFormCategory(e.target.value)}
                                                className="w-full rounded-xl border border-white/5 bg-neutral-950/80 pl-8 pr-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none appearance-none"
                                            >
                                                {CATEGORIES.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <Compass className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-neutral-600" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Date Taken
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formDate}
                                                onChange={(e) => setFormDate(e.target.value)}
                                                className="w-full rounded-xl border border-white/5 bg-neutral-950/80 pl-8 pr-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                            />
                                            <Calendar className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-neutral-600" />
                                        </div>
                                    </div>

                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Story / Memory Behind Shot
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formStory}
                                            onChange={(e) => setFormStory(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3.5 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-2">
                                            Palette Swatch Scheme
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {COLOR_PALETTES.map((palette) => (
                                                <button
                                                    key={palette.name}
                                                    type="button"
                                                    onClick={() => setFormPalette(palette.colors)}
                                                    className={`p-1.5 rounded-lg border text-left flex flex-col justify-between h-12 transition-all cursor-pointer ${
                                                        JSON.stringify(formPalette) ===
                                                        JSON.stringify(palette.colors)
                                                            ? "border-purple-500 bg-purple-500/5"
                                                            : "border-white/5 bg-neutral-950/60 hover:border-white/10"
                                                    }`}
                                                >
                                                    <span className="text-[8px] font-mono text-zinc-400 block truncate uppercase leading-none">
                                                        {palette.name.split(" ")[0]}
                                                    </span>
                                                    <div className="flex gap-0.5 mt-1.5 w-full h-3 rounded overflow-hidden">
                                                        {palette.colors.map((c, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex-1"
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "specs" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Camera Make/Model
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formCamera}
                                                onChange={(e) => setFormCamera(e.target.value)}
                                                className="w-full rounded-xl border border-white/5 bg-neutral-950/80 pl-8 pr-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                            />
                                            <Camera className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-neutral-600" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Focal Length
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 35mm"
                                            value={formFocalLength}
                                            onChange={(e) => setFormFocalLength(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Lens Model
                                        </label>
                                        <input
                                            type="text"
                                            value={formLens}
                                            onChange={(e) => setFormLens(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Aperture
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="f/2.8"
                                            value={formAperture}
                                            onChange={(e) => setFormAperture(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Shutter Speed
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1/125s"
                                            value={formShutterSpeed}
                                            onChange={(e) => setFormShutterSpeed(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            ISO Speed
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="100"
                                            value={formIso}
                                            onChange={(e) => setFormIso(e.target.value)}
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "location" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            Location Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formLocation}
                                                onChange={(e) => setFormLocation(e.target.value)}
                                                className="w-full rounded-xl border border-white/5 bg-neutral-950/80 pl-8 pr-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                            />
                                            <MapPin className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-neutral-600" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            GPS Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="35.6762"
                                            value={formLatitude !== undefined ? formLatitude : ""}
                                            onChange={(e) =>
                                                setFormLatitude(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">
                                            GPS Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="139.6503"
                                            value={formLongitude !== undefined ? formLongitude : ""}
                                            onChange={(e) =>
                                                setFormLongitude(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/5 bg-neutral-950/80 px-3 py-2.5 text-xs text-white focus:border-purple-500/50 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 disabled:text-zinc-500 px-4 py-3 text-xs font-bold text-white transition-all uppercase tracking-wider cursor-pointer active:scale-98 shadow-md shadow-purple-950/10"
                            >
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save Settings
                            </button>
                        </form>
                    ) : null}
                </div>

                {/* RIGHT SIDE: GALLERY LIST (LIGHT TABLE GRID) */}
                <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-zinc-900/10 p-6 backdrop-blur-2xl shadow-xl flex flex-col w-full">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                        <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">
                            Clicks stream ({images.length} photos)
                        </h2>
                        {saving && (
                            <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1.5 animate-pulse uppercase">
                                <RefreshCw className="h-3 w-3 animate-spin" /> Saving Changes
                            </span>
                        )}
                    </div>

                    {/* Scrollable light-table grid container */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[78vh] overflow-y-auto pr-2 scrollbar-thin">
                        {images.map((img) => (
                            <div
                                key={img.pathname}
                                className={`group relative rounded-xl overflow-hidden transition-all duration-500 flex flex-col bg-neutral-950/40 border border-white/5 ${
                                    editingImage?.pathname === img.pathname
                                        ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-[1.01]"
                                        : "hover:border-white/15 hover:scale-[1.01] hover:shadow-lg"
                                }`}
                            >
                                {/* Floating controls: always visible on mobile/tablet, fade-in on hover for desktop */}
                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <button
                                        onClick={() => handleStartEdit(img)}
                                        className="w-7 h-7 rounded-full bg-black/75 border border-white/10 hover:border-purple-500/50 hover:bg-purple-600 hover:text-white flex items-center justify-center text-zinc-300 transition-all cursor-pointer shadow-lg active:scale-90"
                                        title="Edit Details"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteImage(img)}
                                        className="w-7 h-7 rounded-full bg-black/75 border border-white/10 hover:border-red-500/50 hover:bg-red-600 hover:text-white flex items-center justify-center text-zinc-300 transition-all cursor-pointer shadow-lg active:scale-90"
                                        title="Delete Photo"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Photo preview */}
                                <div className="relative aspect-[4/3] w-full bg-neutral-950 overflow-hidden">
                                    <Image
                                        src={img.src}
                                        alt={img.metadata?.title || "Click"}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 30vw"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 border border-white/5 text-[8px] font-mono text-zinc-400 uppercase tracking-widest z-10">
                                        ID {img.id}
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-purple-950/85 border border-purple-500/20 text-[8px] font-mono text-purple-300 uppercase tracking-wider z-10">
                                        {img.metadata?.category || "Street"}
                                    </div>
                                </div>

                                {/* Minimal borderless info text */}
                                <div className="p-3 bg-neutral-900/10 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[11px] font-medium text-white truncate uppercase font-sans tracking-wide">
                                            {img.metadata?.title || "Untitled Click"}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                                            <MapPin className="h-2.5 w-2.5 shrink-0 text-purple-500" />
                                            <span className="truncate">
                                                {img.metadata?.location || "Unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
