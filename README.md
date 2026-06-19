# Clicks — Photography Showcase

**Clicks** is a minimal, immersive, and premium photography gallery designed to showcase personal photography through a horizontal interactive grid slider.

The experience is built with a "content-first" philosophy, using high-performance animations, fluid slide transitions, and a sophisticated dark aesthetic to let the photography speak for itself.

## ✨ Key Features

- **Dynamic Toroidal Slide Grid**: A widescreen layout that dynamically adapts to device viewports, featuring a desktop 4x3 grid (4 columns, 3 rows) and a mobile 3x4 grid (3 columns, 4 rows) that shifts rows, columns, or diagonals every 4 seconds in a seamless toroidal loop.
- **Diagonal Morphing**: Diagonal movements temporarily morph grid cells into circles and scale them down to `0.707` of their size to slide collision-free.
- **Pulsating Ambient Glows**: Colorful background glows (Purple/Blue, Emerald/Teal, Rose/Amber) that expand and brighten during active shifts and fade out completely when idle.
- **Immersive Full-Screen Lightbox**: A minimal photo overlay stripped of metadata clutter, featuring full-screen imagery, navigation controls, and custom interactive cursor support.
- **Crisp Image Quality**: Powered by Next.js Image Optimization with precise responsive `sizes` to eliminate browser aliasing and pixelation on high-DPI screens.
- **Secure Admin Dashboard**: A protected dashboard (`/admin`) for uploading new images, updating photo metadata, batch deletion, and session logout.
- **Automated EXIF Metadata Extraction**: Automatically parses camera details, exposure stats, focal lengths, and GPS coordinates directly from uploaded photos during configuration.
- **Smart Image Compression**: Automatically resizes and compresses large camera images client-side before uploading to optimize bandwidth and Vercel Blob storage usage.

## 📖 Documentation

For more detailed information on how Clicks is built, check out the following:

- [**Architecture Overview**](docs/ARCHITECTURE.md): Technical stack, data flow, and design philosophy.
- [**Component Guide**](docs/COMPONENTS.md): Prop definitions and implementation logic for core UI components.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion v12](https://www.framer.com/motion/)

## 🚀 Getting Started

To run the gallery locally, you will need to set up Vercel Blob storage for the images.

1. **Install dependencies**:

```bash
npm install
```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Vercel Blob read/write token:

```env
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"
```

3. **Set up Storage**:
   Upload your high-resolution photography to your Vercel Blob store. Ensure the files have the `gallery/` prefix (e.g., `gallery/click_1.jpg`).

4. **Run the development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experience.

## 🚀 Deployment

The easiest way to deploy this application is via Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or BitBucket).
2. Import the project into Vercel.
3. Configure the `BLOB_READ_WRITE_TOKEN` environment variable in your project settings.
4. Deploy!

## 📸 Photography

This project serves as a digital home for my personal photography, captured and curated with care.

---

_Built with passion for photography and high-end web experiences._
