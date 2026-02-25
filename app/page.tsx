import { list } from "@vercel/blob";
import HomeClient from "./HomeClient";

import { GalleryImage } from "./types";

export const revalidate = 60; // Revalidate every minute

export default async function Page() {
  const { blobs } = await list({ prefix: "gallery/" });

  // Transform blobs into GalleryImage objects
  const allImages: GalleryImage[] = blobs
    .filter((blob) => blob.pathname.match(/\.(jpg|jpeg|png|webp|heic)$/i))
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
