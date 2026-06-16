"use client";

import { motion } from "framer-motion";

/**
 * Global error boundary for the app.
 *
 * Displays a cinematic, on-brand error state with a retry action.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-8 px-6 text-center font-sans">
            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[30vh] rounded-full bg-red-500/20 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col items-center gap-6"
            >
                <p className="text-[10px] font-mono tracking-[0.5em] text-zinc-500 uppercase">
                    Something went wrong
                </p>
                <h1 className="text-4xl md:text-6xl font-light tracking-tight text-zinc-200">
                    Exposure Error
                </h1>
                <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
                    The gallery couldn&apos;t load this time. This might be a temporary issue with
                    the image storage.
                </p>
                {error.digest && (
                    <p className="text-[10px] font-mono text-zinc-700">Digest: {error.digest}</p>
                )}
                <button
                    onClick={reset}
                    className="mt-4 px-8 py-3 text-xs font-mono tracking-[0.3em] uppercase border border-white/10 rounded-full text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-300 cursor-pointer"
                >
                    Retry
                </button>
            </motion.div>
        </main>
    );
}
