import { Suspense } from "react";
import type { Metadata } from "next";
import { getImages } from "../lib/images";
import HomeClient from "../HomeClient";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

/**
 * Dynamic metadata generator for the All-in-One architecture.
 * Supports both the base gallery and specific photo views.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug?.[0] === "photo" && slug?.[1]) {
    const photoId = slug[1];
    return {
      title: `Photo ${photoId} | Clicks Gallery`,
      description: `A captured moment from the lens, image ${photoId}.`,
    };
  }

  return {
    title: "Clicks | Immersive Photography Gallery",
    description: "A minimal, immersive photography gallery experience.",
  };
}

/**
 * Universal Gallery Entry Point (Catch-all).
 * 
 * Handles `/` and `/photo/[id]` within a single component tree.
 * Passing the image Promise to HomeClient keeps the loading experience
 * streaming and provides the fastest possible initial load.
 */
export default function Page() {
  const imagePromise = getImages();

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <HomeClient imagePromise={imagePromise} />
    </Suspense>
  );
}
