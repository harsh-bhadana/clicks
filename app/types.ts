export interface PhotoMetadata {
    title?: string;
    location?: string;
    date?: string;
    category?: string;
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    story?: string;
    colorPalette?: string[];
    focalLength?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    exposureBias?: string;
    flash?: string;
    dimensions?: string;
    megapixels?: string;
    fileSize?: string;
}

export interface GalleryImage {
    src: string;
    /**
     * Stable numeric ID derived from the blob filename (click_1.jpg → 1).
     */
    id: number;
    pathname: string;
    metadata?: PhotoMetadata;
}
