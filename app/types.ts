export interface GalleryImage {
    src: string;
    /**
     * Stable numeric ID derived from the blob filename (click_1.jpg → 1).
     * Used as the URL param for /photo/[id] routes.
     */
    id: number;
}
