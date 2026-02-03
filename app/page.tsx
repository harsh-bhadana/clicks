import { list } from "@vercel/blob";
import HomeClient from "./HomeClient";

interface GalleryImage {
  src: string;
  location: string;
  date: string;
}

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
    .map((blob, index) => {
      const locations = [
        "Urban Explorer", "Nature Retreat", "City Lights", "Mountain High", "Ocean Breeze",
        "Street Pulse", "Forest Path", "Sunset Glow", "Modern Arch", "Hidden Gem",
        "Daily Life", "Morning Mist", "Golden Hour", "Quiet Moment", "Perspective",
        "Contrast", "Minimalist", "Structure", "Elegance", "Final Click"
      ];

      const dates = [
        "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "June 2024",
        "July 2024", "Aug 2024", "Sept 2024", "Oct 2024", "Nov 2024"
      ];

      return {
        src: blob.url,
        location: locations[index] || "Atmospheric Capture",
        date: dates[index % dates.length] || "2024-2025"
      };
    });

  return <HomeClient allImages={allImages} />;
}
