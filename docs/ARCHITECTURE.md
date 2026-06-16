# Architecture Overview — Clicks

"Clicks" is designed with a **content-first philosophy**, prioritizing high-performance animations, seamless interactive shifts, and a clean, cinematic dark aesthetic to showcase photography.

## 🏗️ High-Level Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Data Storage**: Vercel Blob (Photos and metadata)
- **Styling**: Tailwind CSS (Minimalist dark theme)
- **Animations**: Framer Motion (Fluid 2D translations, border-radius morphing, and pulsating glows)

## 📡 Data Flow

1. **Server-Side Retrieval (`app/page.tsx`)**:
   - Utilizes the `@vercel/blob` SDK to list all uploaded images under the `gallery/` prefix.
   - Requires the `BLOB_READ_WRITE_TOKEN` environment variable to authenticate the list request.
   - Filters fetched blobs to ensure only valid image extensions are processed.
   - Sorts images sequentially by filename (e.g., `click_1.jpg`, `click_2.jpg`) for predictable ordering.
   - Passes the resulting `GalleryImage[]` array to the client component.

2. **Client-Side Orchestration (`app/HomeClient.tsx`)**:
   - Coordinates the horizontal **4 columns x 3 rows grid slider** (12 active slots total).
   - Triggers random shifting transitions (Row, Column, or Diagonal) every 4 seconds.
   - Uses a stable rendering key strategy (`key="slot-{idx}"`) to avoid visual unmounting flashes during image state swaps.
   - Implements a seamless toroidal wrapping system (utilizing a temporary 13th wrapping cell) to animate wrapping grid elements.

3. **Component Interaction**:
   - **Grid Slot (`GridSlot`)**: Handles the individual image cards, hover-zoom effects, and dynamic border-radius morph transitions.
   - **Immersive Viewer (`Lightbox`)**: Provides a full-screen, minimal photo details viewer with backdrop dismiss click triggers and custom cursor integrations.
   - **Custom Cursor (`CustomCursor`)**: Overlays a premium cursor that displays context labels (like "VIEW" or "BACK") depending on the hover target.

## 🎨 Key Design Decisions

### Cinematic Grid
The homepage is a distraction-free, non-scrolling single viewport centered on a 4:3 widescreen grid (`aspect-[4/3] w-[96vw] md:h-[75vh]`). All header HUD panels and footer texts are removed to maximize visual focus on the photographs.

### Toroidal Rubik's Shifting
The grid functions like a Rubik's slide puzzle:
- **Row & Column Shifts**: Linear 2D translations shift cells flat (no 3D tilts or stretches) by exactly 1 cell width/height, looping seamlessly.
- **Diagonal Shifts**: Inside the top-left 3x3 portion of the grid, cells turn into circles and scale down to `0.707` of their size to slide diagonally without overlapping. Unused fourth-column cells are dimmed and blurred during diagonal shifts to maintain focal depth.

### Pulsating Ambient Background
Dynamic `motion.div` glows sit behind the translucent grid glass. The glows expand in scale and double in brightness during active shifts, and fade out completely to `opacity: 0` during idle states. The colors alternate between Purple/Blue, Emerald/Teal, and Rose/Amber on each shifting cycle.

## 🚀 Performance & Quality
- **Image Optimization**: Utilizes native `next/image` with responsive size targets (`sizes="(max-width: 768px) 50vw, 25vw"`) for the grid. Next.js dynamically serves correctly scaled WebP/AVIF versions, preventing browser aliasing and pixelated rendering while minimizing memory footprint.
- **2D Transitions**: Built using highly optimized 2D Framer Motion properties (`x`, `y`, `scale`) rather than expensive 3D perspective layers, ensuring flat, sharp, and lightweight rendering.
