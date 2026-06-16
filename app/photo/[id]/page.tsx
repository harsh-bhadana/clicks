import { getImages } from "@/app/lib/images";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoPageClient from "./PhotoPageClient";

interface PhotoPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Generate dynamic OG metadata per photo so every share link
 * gets a rich preview with the actual image.
 */
export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
    const { id } = await params;
    const images = await getImages();
    const numericId = parseInt(id, 10);
    const image = images.find((img) => img.id === numericId);

    if (!image) {
        return { title: "Photo Not Found | Clicks" };
    }

    const meta = image.metadata || {};
    const title = meta.title || `Photo ${id}`;

    return {
        title: `${title} | Clicks`,
        description: meta.story || `View "${title}" in the Clicks photography gallery.`,
        openGraph: {
            title: `${title} | Clicks`,
            description: meta.story || `View "${title}" in the Clicks photography gallery.`,
            type: "article",
            images: [{ url: image.src, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | Clicks`,
            description: meta.story || `View "${title}" in the Clicks photography gallery.`,
            images: [image.src],
        },
    };
}

export const revalidate = 60;

export default async function PhotoPage({ params }: PhotoPageProps) {
    const { id } = await params;
    const images = await getImages();
    const numericId = parseInt(id, 10);
    const image = images.find((img) => img.id === numericId);

    if (!image) {
        notFound();
    }

    return <PhotoPageClient image={image} allImages={images} />;
}
