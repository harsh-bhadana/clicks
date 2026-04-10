import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getImages } from "../../lib/images";
import { BLUR_DATA_URL } from "../../lib/blur";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Photo ${id} | Clicks Gallery`,
        description: "A captured moment from the Clicks photography gallery.",
    };
}

/**
 * Full-page photo view — rendered on hard navigation or page refresh to /photo/[id].
 * Provides a standalone, shareable photo experience without requiring the gallery to load.
 */
export default async function PhotoPage({ params }: Props) {
    const { id } = await params;
    const allImages = await getImages();

    const photoId = parseInt(id);
    const currentIndex = allImages.findIndex((img) => img.id === photoId);
    if (currentIndex === -1) notFound();

    const image = allImages[currentIndex];
    const prevId = allImages[(currentIndex - 1 + allImages.length) % allImages.length].id;
    const nextId = allImages[(currentIndex + 1) % allImages.length].id;

    return (
        <main className="fixed inset-0 bg-black text-white flex items-center justify-center cursor-none">
            {/* Navigation zones — invisible click targets on left/right thirds */}
            <Link
                href={`/photo/${prevId}`}
                replace
                className="fixed left-0 top-0 w-[25%] h-full z-10"
                aria-label="Previous photo"
                data-cursor="prev"
            />
            <Link
                href={`/photo/${nextId}`}
                replace
                className="fixed right-0 top-0 w-[25%] h-full z-10"
                aria-label="Next photo"
                data-cursor="next"
            />

            {/* Close — always returns to gallery */}
            <Link
                href="/"
                className="absolute top-8 right-8 z-20 pointer-events-auto text-white/50 hover:text-white transition-colors duration-300 uppercase text-[10px] tracking-[0.4em] font-light group"
                aria-label="Close and return to gallery"
            >
                <span className="inline-block transition-transform duration-500 group-hover:rotate-90 mr-2">
                    ✕
                </span>
                Close
            </Link>

            {/* Image */}
            <div
                className="relative z-0 rounded-3xl overflow-hidden border border-white/10"
                style={{ boxShadow: "0 0 100px rgba(168,85,247,0.15)" }}
            >
                <Image
                    src={image.src}
                    alt={`Photography gallery — image ${image.id}`}
                    width={1920}
                    height={1080}
                    sizes="90vw"
                    className="w-auto h-auto max-w-[85vw] max-h-[85vh] object-contain p-2"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    priority
                    quality={100}
                />
            </div>

            {/* Counter */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-white/25 text-[10px] tracking-[0.4em] uppercase">
                    {currentIndex + 1} &nbsp;/&nbsp; {allImages.length}
                </span>
            </div>
        </main>
    );
}
