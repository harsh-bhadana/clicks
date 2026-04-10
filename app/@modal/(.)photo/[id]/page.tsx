import { notFound } from "next/navigation";
import { getImages } from "../../../lib/images";
import PhotoModal from "../../../components/PhotoModal";

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * Intercepting route — renders the Lightbox as a modal overlay on top of the gallery.
 *
 * Only activated during client-side soft navigation from the gallery page.
 * Hard navigation / page refresh falls through to app/photo/[id]/page.tsx instead.
 */
export default async function InterceptedPhoto({ params }: Props) {
    const { id } = await params;
    const allImages = await getImages();

    const photoId = parseInt(id);
    const currentIndex = allImages.findIndex((img) => img.id === photoId);
    if (currentIndex === -1) notFound();

    const image = allImages[currentIndex];
    const prevId = allImages[(currentIndex - 1 + allImages.length) % allImages.length].id;
    const nextId = allImages[(currentIndex + 1) % allImages.length].id;

    return <PhotoModal image={image} prevId={prevId} nextId={nextId} />;
}
