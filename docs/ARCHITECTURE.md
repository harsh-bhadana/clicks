# Architecture Overview — Clicks

"Clicks" is designed with a **content-first philosophy**, prioritizing high-performance animations and a cinematic dark aesthetic to showcase photography.

## 🏗️ High-Level Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Data Storage**: Vercel Blob (Photos and metadata)
- **Styling**: Tailwind CSS (Sophisticated dark theme)
- **Animations**: Framer Motion (Fluid transitions and marquee effects)

## 📡 Data Flow

1.  **Server-Side Retrieval (`app/page.tsx`)**:
    - Uses `@vercel/blob` to list all images in the `gallery/` prefix.
    - Sorts images by filename (e.g., `click_1.jpg`, `click_2.jpg`).
    - Passes the resulting `GalleryImage[]` array to the client component.
2.  **Client-Side Orchestration (`app/HomeClient.tsx`)**:
    - Manages the initial loading sequence via `PageLoader`.
    - Coordinates the "header handoff" animation (moving the logo from center to top).
    - Implements **Infinite Scrolling** by tracking an intersection observer target and duplicating marquee tracks.
3.  **Component Interaction**:
    - `InfiniteMarquee` handles the horizontal streaming animations.
    - `Lightbox` provides an immersive viewer when an image is clicked, blurring the background streams.

## 🎨 Key Design Decisions

### Cinematic Atmosphere
The gallery uses a deep black background (`#000000`) with subtle glassmorphism and purple accents in selection. This creates a high-contrast environment where the photos are the primary focus.

### Infinite Streams
Multiple marquee tracks with varying speeds and directions create a dynamic, layered feeling of abundance. The speeds are calculated based on the set index to ensure variety.

### Animation Orchestration
- **Initial Load**: `PageLoader` displays a high-impact intro.
- **Header Transition**: The `clicks` logo transitions from a centered hero position to a fixed top header after a delay, signaling the transition from "intro" to "gallery".
- **Interaction**: Clicking an image triggers the `Lightbox`, which uses `AnimatePresence` for smooth entry/exit and applies a heavy backdrop blur to the background gallery.

## 🚀 Performance
- **Image Optimization**: Utilizes `next/image` with specific `sizes` and `priority` (for the lightbox) to ensure fast loading and responsive delivery.
- **Animation Performance**: Heavy use of CSS-based animations (via `style jsx` in Marquee) for smooth high-frame-rate scrolling on various devices.
