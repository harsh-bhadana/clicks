import { list } from "@vercel/blob";
import HomeClient from "./HomeClient";

import { GalleryImage } from "./types";

export const revalidate = 60; // Revalidate every minute

/**
 * The main server component for the Clicks gallery route.
 * 
 * Fetches all images from Vercel Blob storage under the `gallery/` prefix,
 * filters for valid image formats, and sorts them numerically based on 
 * their filenames before passing them to the HomeClient component.
 * 
 * @returns The HomeClient component populated with the fetched images.
 */
export default async function Page() {
  const { blobs } = await list({ prefix: "gallery/" });

  // Transform blobs into GalleryImage objects
  const allImages: GalleryImage[] = blobs
    .filter((blob) => blob.pathname.match(/\.(jpg|jpeg|png|webp|heic|avif)$/i))
    .sort((a, b) => {
      // Try to sort by the number in the filename if possible (click_1, click_2, etc.)
      const numA = parseInt(a.pathname.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.pathname.match(/\d+/)?.[0] || "0");
      return numA - numB;
    })
    .map((blob) => ({
      src: blob.url,
    }));

  return <HomeClient allImages={allImages} />;
}
