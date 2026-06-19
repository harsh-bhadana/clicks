"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState("");

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

    return <>{children}</>;
}
