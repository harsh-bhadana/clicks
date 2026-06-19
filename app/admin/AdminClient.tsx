"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import {
    Camera,
    MapPin,
    Calendar,
    Compass,
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
    ChevronDown,
    Check,
    CheckSquare,
    Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryImage, PhotoMetadata } from "../types";

const CATEGORIES = ["Street", "Landscape", "Travel", "Minimal", "Portrait"];

interface AdminClientProps {
    initialImages: GalleryImage[];
}

export default function AdminClient({ initialImages }: AdminClientProps) {
    // Gallery state
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [selectedPathnames, setSelectedPathnames] = useState<Set<string>>(new Set());

    // Editing State
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [activeTab, setActiveTab] = useState<"general" | "specs" | "location">("general");

    // Form fields
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
    const [formFocalLength, setFormFocalLength] = useState("");
    const [formLatitude, setFormLatitude] = useState<number | undefined>(undefined);
    const [formLongitude, setFormLongitude] = useState<number | undefined>(undefined);
    const [formExposureBias, setFormExposureBias] = useState("");
    const [formFlash, setFormFlash] = useState("");
    const [formDimensions, setFormDimensions] = useState("");
    const [formMegapixels, setFormMegapixels] = useState("");
    const [formFileSize, setFormFileSize] = useState("");

    // Action feedback
    const [saving, setSaving] = useState(false);
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

    // Handle Logout
    const handleLogout = async () => {
        try {
            await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
            });
            window.location.reload();
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    // Load Image details into Edit Form
    const handleStartEdit = (img: GalleryImage) => {
        setEditingImage(img);
        setActiveTab("general");
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
        setFormFocalLength(meta.focalLength || "");
        setFormLatitude(meta.gpsLatitude);
        setFormLongitude(meta.gpsLongitude);
        setFormExposureBias(meta.exposureBias || "");
        setFormFlash(meta.flash || "");
        setFormDimensions(meta.dimensions || "");
        setFormMegapixels(meta.megapixels || "");
        setFormFileSize(meta.fileSize || "");
    };

    // Save metadata updates back to Vercel Blob
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

    // Handle Form Submit (Editing Individual Metadata)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingImage) return;

        setSaving(true);
        try {
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
                focalLength: formFocalLength,
                gpsLatitude: formLatitude,
                gpsLongitude: formLongitude,
                exposureBias: formExposureBias,
                flash: formFlash,
                dimensions: formDimensions,
                megapixels: formMegapixels,
                fileSize: formFileSize,
            };

            const updatedImages = images.map((img) => {
                if (img.pathname === editingImage.pathname) {
                    return { ...img, metadata: updatedMetadata };
                }
                return img;
            });

            await handleSaveMetadata(updatedImages);
            setImages(updatedImages);
            setEditingImage(null);
            setFeedback({ type: "success", msg: "Photo settings updated successfully!" });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setFeedback({ type: "error", msg: `Failed to save: ${errorMsg}` });
        } finally {
            setSaving(false);
        }
    };

    // Multi-select / Checkbox toggles
    const handleToggleSelect = (pathname: string) => {
        const newSelection = new Set(selectedPathnames);
        if (newSelection.has(pathname)) {
            newSelection.delete(pathname);
        } else {
            newSelection.add(pathname);
        }
        setSelectedPathnames(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedPathnames.size === images.length) {
            setSelectedPathnames(new Set());
        } else {
            setSelectedPathnames(new Set(images.map((img) => img.pathname)));
        }
    };

    // Bulk / Single Deletion Core
    const deleteImages = async (imagesToDelete: GalleryImage[]) => {
        const count = imagesToDelete.length;
        if (count === 0) return;

        const confirmMsg =
            count === 1
                ? `Are you sure you want to delete "${imagesToDelete[0].metadata?.title || "this image"}"? This will permanently delete the file from the server.`
                : `Are you sure you want to delete these ${count} selected images? This will permanently delete the files from the server.`;

        if (!confirm(confirmMsg)) return;

        setSaving(true);
        try {
            const urlsToDelete = imagesToDelete.map((img) => img.src);

            const deleteRes = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "deleteImage", url: urlsToDelete }),
            });

            if (!deleteRes.ok) {
                const deleteData = await deleteRes.json();
                throw new Error(deleteData.error || "Delete failed");
            }

            const updatedImages = images.filter(
                (img) => !imagesToDelete.some((delImg) => delImg.pathname === img.pathname)
            );
            await handleSaveMetadata(updatedImages);

            setImages(updatedImages);
            // Clear selection
            const newSelection = new Set(selectedPathnames);
            imagesToDelete.forEach((delImg) => newSelection.delete(delImg.pathname));
            setSelectedPathnames(newSelection);

            setFeedback({
                type: "success",
                msg:
                    count === 1
                        ? "Image deleted successfully!"
                        : `${count} images deleted successfully!`,
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setFeedback({ type: "error", msg: `Delete failed: ${errorMsg}` });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSelected = async () => {
        const selected = images.filter((img) => selectedPathnames.has(img.pathname));
        await deleteImages(selected);
    };

    const handleDeleteAll = async () => {
        if (images.length === 0) return;
        if (
            confirm(
                "WARNING: Are you sure you want to delete ALL images in the gallery? This action is completely irreversible!"
            )
        ) {
            if (
                confirm(
                    "Please confirm one more time to delete all image files and reset the gallery."
                )
            ) {
                await deleteImages(images);
            }
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
                                CMS Console
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-all bg-neutral-900 border border-white/5 px-4 py-2 rounded-full cursor-pointer"
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

            {/* Feedback Toast */}
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

            {/* Dashboard Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-zinc-900/10 border border-white/5 rounded-3xl p-5 backdrop-blur-2xl">
                {/* Left Side: Select Checkbox & Info */}
                <div className="flex items-center gap-4">
                    {images.length > 0 && (
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                            {selectedPathnames.size === images.length ? (
                                <CheckSquare className="h-4.5 w-4.5 text-purple-400" />
                            ) : (
                                <Square className="h-4.5 w-4.5" />
                            )}
                            Select All ({selectedPathnames.size}/{images.length})
                        </button>
                    )}
                    {images.length === 0 && (
                        <span className="text-xs font-mono text-zinc-500 uppercase">
                            Gallery is empty
                        </span>
                    )}
                </div>

                {/* Right Side: Deletes and Upload route */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    {selectedPathnames.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-all bg-red-950/20 border border-red-500/10 px-4 py-2 rounded-full cursor-pointer disabled:opacity-40"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete Selected (
                            {selectedPathnames.size})
                        </button>
                    )}
                    {images.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-all border border-white/5 hover:border-red-500/20 px-4 py-2 rounded-full cursor-pointer disabled:opacity-40"
                        >
                            <Trash2 className="h-3.5 w-3.5 text-zinc-500 hover:text-red-400" />{" "}
                            Clear Gallery
                        </button>
                    )}
                    <Link
                        href="/admin/upload"
                        className="inline-flex items-center gap-1.5 text-xs font-mono bg-purple-600 hover:bg-purple-500 transition-colors border border-purple-500/10 px-4 py-2 rounded-full text-white font-bold cursor-pointer"
                    >
                        <UploadCloud className="h-3.5 w-3.5" /> Upload Photo
                    </Link>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mb-12">
                {images.map((img) => {
                    const isSelected = selectedPathnames.has(img.pathname);
                    return (
                        <div
                            key={img.pathname}
                            className={`group relative rounded-2xl overflow-hidden border bg-neutral-950/40 transition-all duration-300 flex flex-col justify-between ${
                                isSelected
                                    ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-500/5 scale-[0.99]"
                                    : "border-white/5 hover:border-white/15 hover:bg-neutral-900/10 hover:shadow-lg"
                            }`}
                        >
                            {/* Checkbox Trigger Overlay (Top Left) */}
                            <div className="absolute top-3 left-3 z-20">
                                <button
                                    onClick={() => handleToggleSelect(img.pathname)}
                                    className="h-6 w-6 rounded-lg bg-black/60 border border-white/10 hover:border-purple-500 flex items-center justify-center text-white transition-colors cursor-pointer"
                                >
                                    {isSelected ? (
                                        <Check className="h-3.5 w-3.5 text-purple-400" />
                                    ) : (
                                        <div className="h-2 w-2 rounded bg-transparent" />
                                    )}
                                </button>
                            </div>

                            {/* Actions Overlay (Top Right) */}
                            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={() => handleStartEdit(img)}
                                    className="h-7 w-7 rounded-lg bg-black/80 border border-white/10 hover:border-purple-500/50 hover:bg-purple-600 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => deleteImages([img])}
                                    className="h-7 w-7 rounded-lg bg-black/80 border border-white/10 hover:border-red-500/50 hover:bg-red-600 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-90"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Image Container */}
                            <div className="relative aspect-square w-full overflow-hidden border-b border-white/5 bg-neutral-950 select-none">
                                <Image
                                    src={img.src}
                                    alt={img.metadata?.title || "Clicks Photo"}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                                    unoptimized
                                />
                            </div>

                            {/* Image Metadata Info */}
                            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                <div>
                                    <h3 className="text-xs font-bold text-white truncate mb-1">
                                        {img.metadata?.title || "Untitled Image"}
                                    </h3>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-1">
                                            <Compass className="h-3 w-3 shrink-0" />
                                            {img.metadata?.category || "Street"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 shrink-0" />
                                            {img.metadata?.date || "June 2026"}
                                        </span>
                                    </div>
                                </div>

                                {img.metadata?.location && (
                                    <div className="text-[9px] font-mono text-zinc-400 flex items-center gap-1 truncate border-t border-white/5 pt-2">
                                        <MapPin className="h-3 w-3 text-purple-400 shrink-0" />
                                        <span className="truncate">{img.metadata.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overlapping Slide-over Metadata Edit Modal */}
            <AnimatePresence>
                {editingImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop with Blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingImage(null)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />

                        {/* Modal Dialog Body */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/90 p-6 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto scrollbar-thin space-y-6"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <h2 className="text-xs font-bold tracking-widest text-zinc-400 flex items-center gap-2 uppercase font-mono">
                                    <Edit className="h-4 w-4 text-purple-400" /> Photo Settings
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setEditingImage(null)}
                                    className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Preview image */}
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-inner group select-none">
                                <Image
                                    src={editingImage.src}
                                    alt="Preview"
                                    fill
                                    className="object-cover transition-transform duration-750 group-hover:scale-102"
                                    unoptimized
                                />
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex bg-neutral-950/65 p-1 rounded-xl border border-white/5 gap-1 text-[9px] font-mono select-none">
                                {[
                                    { id: "general", label: "General" },
                                    { id: "specs", label: "Camera" },
                                    { id: "location", label: "Location" },
                                ].map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(
                                                    tab.id as "general" | "specs" | "location"
                                                )
                                            }
                                            className={`relative flex-1 py-2 px-3 rounded-lg uppercase tracking-wider text-center transition-colors duration-200 cursor-pointer z-10 ${
                                                isActive
                                                    ? "text-white font-bold"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabIndicator"
                                                    className="absolute inset-0 bg-purple-600/20 border border-purple-500/30 rounded-lg -z-10"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 380,
                                                        damping: 30,
                                                    }}
                                                />
                                            )}
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Modal Form Submission */}
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                {/* Tab Fields */}
                                {activeTab === "general" && (
                                    <div className="space-y-5">
                                        {/* Card 1: Basic info */}
                                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 space-y-4 shadow-sm">
                                            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/5 pb-1.5">
                                                Basic Information
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formTitle}
                                                        onChange={(e) =>
                                                            setFormTitle(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                            Category
                                                        </label>
                                                        <div className="relative flex items-center group">
                                                            <select
                                                                value={formCategory}
                                                                onChange={(e) =>
                                                                    setFormCategory(e.target.value)
                                                                }
                                                                className="peer w-full rounded-xl border border-white/10 bg-neutral-900/50 pl-10 pr-8 py-2.5 text-xs text-white hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 appearance-none cursor-pointer"
                                                            >
                                                                {CATEGORIES.map((cat) => (
                                                                    <option key={cat} value={cat}>
                                                                        {cat}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 peer-focus:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 peer-focus:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                            Date Taken
                                                        </label>
                                                        <div className="relative flex items-center group">
                                                            <input
                                                                type="text"
                                                                value={formDate}
                                                                onChange={(e) =>
                                                                    setFormDate(e.target.value)
                                                                }
                                                                className="peer w-full rounded-xl border border-white/10 bg-neutral-900/50 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                            />
                                                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 peer-focus:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: narrative */}
                                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 space-y-3 shadow-sm">
                                            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/5 pb-1.5">
                                                Story & Narrative
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                    Story / Memory Behind Shot
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={formStory}
                                                    onChange={(e) => setFormStory(e.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "specs" && (
                                    <div className="space-y-5">
                                        {/* Card 1: Equipment */}
                                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 space-y-4 shadow-sm">
                                            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/5 pb-1.5 mb-1">
                                                Camera & Lens Equipment
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Camera Make/Model
                                                    </label>
                                                    <div className="relative flex items-center group">
                                                        <input
                                                            type="text"
                                                            value={formCamera}
                                                            onChange={(e) =>
                                                                setFormCamera(e.target.value)
                                                            }
                                                            className="peer w-full rounded-xl border border-white/10 bg-neutral-900/50 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                        />
                                                        <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 peer-focus:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Focal Length
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 35mm"
                                                        value={formFocalLength}
                                                        onChange={(e) =>
                                                            setFormFocalLength(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div className="col-span-1 sm:col-span-2">
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Lens Model
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formLens}
                                                        onChange={(e) =>
                                                            setFormLens(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: Exposure Settings */}
                                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 space-y-4 shadow-sm">
                                            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/5 pb-1.5 mb-1">
                                                Exposure & Settings
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Aperture
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="f/2.8"
                                                        value={formAperture}
                                                        onChange={(e) =>
                                                            setFormAperture(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Shutter Speed
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="1/125s"
                                                        value={formShutterSpeed}
                                                        onChange={(e) =>
                                                            setFormShutterSpeed(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        ISO Speed
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="100"
                                                        value={formIso}
                                                        onChange={(e) => setFormIso(e.target.value)}
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Exposure Bias
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. -4.0ev"
                                                        value={formExposureBias}
                                                        onChange={(e) =>
                                                            setFormExposureBias(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Flash Status
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Flash used"
                                                        value={formFlash}
                                                        onChange={(e) =>
                                                            setFormFlash(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 3: File Details */}
                                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 space-y-4 shadow-sm">
                                            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/5 pb-1.5 mb-1">
                                                File & Image Attributes
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Dimensions
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 4000x3000"
                                                        value={formDimensions}
                                                        onChange={(e) =>
                                                            setFormDimensions(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Megapixels
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 12MP"
                                                        value={formMegapixels}
                                                        onChange={(e) =>
                                                            setFormMegapixels(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        File Size
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 7.70 MB"
                                                        value={formFileSize}
                                                        onChange={(e) =>
                                                            setFormFileSize(e.target.value)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "location" && (
                                    <div className="space-y-5">
                                        {/* Card 1: Geolocation */}
                                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 p-5 space-y-4 shadow-sm">
                                            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/5 pb-1.5 mb-1">
                                                Location & GPS Coordinates
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="col-span-1 sm:col-span-2">
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        Location Name
                                                    </label>
                                                    <div className="relative flex items-center group">
                                                        <input
                                                            type="text"
                                                            value={formLocation}
                                                            onChange={(e) =>
                                                                setFormLocation(e.target.value)
                                                            }
                                                            className="peer w-full rounded-xl border border-white/10 bg-neutral-900/50 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                        />
                                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 peer-focus:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        GPS Latitude
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        placeholder="35.6762"
                                                        value={
                                                            formLatitude !== undefined
                                                                ? formLatitude
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            setFormLatitude(
                                                                e.target.value
                                                                    ? Number(e.target.value)
                                                                    : undefined
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1.5">
                                                        GPS Longitude
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        placeholder="139.6503"
                                                        value={
                                                            formLongitude !== undefined
                                                                ? formLongitude
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            setFormLongitude(
                                                                e.target.value
                                                                    ? Number(e.target.value)
                                                                    : undefined
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-neutral-900/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 hover:border-white/20 hover:bg-neutral-900/80 focus:border-purple-500/60 focus:bg-neutral-950 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="relative overflow-hidden w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 px-4 py-3 text-xs font-bold text-white transition-all duration-300 uppercase tracking-widest cursor-pointer shadow-lg shadow-purple-950/20"
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save Settings
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
