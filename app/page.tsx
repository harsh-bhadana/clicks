import { Suspense } from "react";
import { getImages } from "./lib/images";
import HomeClient from "./HomeClient";

export const revalidate = 60;

/**
 * Gallery root — creates a non-awaited image Promise for streaming SSR.
 *
 * Passing the Promise (instead of awaiting it) to HomeClient allows React 19's
 * `use()` hook to suspend mid-render, showing the Suspense fallback shell
 * while the blob list resolves. The minimal black fallback is visually
 * invisible since the body background is already #050505.
 */
export default function Page() {
    const imagePromise = getImages();

    return (
        <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
            <HomeClient imagePromise={imagePromise} />
        </Suspense>
    );
}
