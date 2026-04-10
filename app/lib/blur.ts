/**
 * A static dark-gradient blur placeholder for `next/image`'s `placeholder="blur"`.
 *
 * External Vercel Blob URLs cannot be auto-hashed by Next.js, so we supply a
 * hand-crafted base64 SVG. The radial gradient closely mirrors the gallery's
 * dark aesthetic and gives a natural fade-in feel as images load.
 */

const toBase64 = (str: string): string =>
    typeof window === "undefined"
        ? Buffer.from(str).toString("base64")
        : window.btoa(str);

const darkGradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="60%">
      <stop offset="0%"   stop-color="#1c1c1e"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
</svg>`;

export const BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(darkGradientSvg)}`;
