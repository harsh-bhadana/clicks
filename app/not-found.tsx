import Link from "next/link";

/**
 * Custom 404 page — keeps the immersive dark aesthetic.
 */
export default function NotFound() {
    return (
        <main className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-8 px-6 text-center font-sans">
            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[30vh] rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
                <p className="text-[10px] font-mono tracking-[0.5em] text-zinc-500 uppercase">
                    Frame Not Found
                </p>
                <h1 className="text-7xl md:text-9xl font-extralight tracking-tight text-zinc-300">
                    404
                </h1>
                <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
                    This frame doesn&apos;t exist in the gallery. It may have been removed or the
                    URL might be incorrect.
                </p>
                <Link
                    href="/"
                    className="mt-4 px-8 py-3 text-xs font-mono tracking-[0.3em] uppercase border border-white/10 rounded-full text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-300"
                >
                    Return to Gallery
                </Link>
            </div>
        </main>
    );
}
