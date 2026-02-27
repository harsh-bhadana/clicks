# Component Documentation — Clicks

Detailed overview of the UI components powering the Clicks experience.

## 🎞️ `InfiniteMarquee.tsx`

The core component for the streaming gallery tracks.

### Props
- `direction`: `"left" | "right"` (Default: `"left"`)
- `speed`: `number` (Duration in seconds, lower is faster)
- `images`: `GalleryImage[]`
- `onImageClick`: `(image: GalleryImage) => void`
- `isPaused`: `boolean` (Pauses the animation, e.g., when Lightbox is open)

### Implementation Details
- **Seamless Loop**: The component triples the `images` array to ensure there's always enough content to cover the screen during repositioning.
- **Dynamic Aspect Ratio**: Automatically detects the natural aspect ratio of images on load to maintain consistent height (`320px`) while allowing varying widths.
- **CSS Animation**: Uses scoped JSX styles for the `infiniteScroll` keyframes to ensure high-performance, GPU-accelerated movement.

---

## 🔍 `Lightbox.tsx`

An immersive, full-screen viewer for individual photographs.

### Props
- `image`: `GalleryImage | null`
- `onClose`: `() => void`

### Features
- **Backdrop Blur**: Uses `backdrop-blur-2xl` and `bg-black/95` to isolate the focus on the selected image.
- **Interaction**: Closeable via a dedicated "Close" button or by clicking anywhere on the backdrop.
- **Animation**: Features a subtle scale and translate animation for entry, creating a "zoom-in" effect from the gallery.
- **Body Lock**: Automatically prevents background scrolling while the lightbox is active.

---

## ⏳ `PageLoader.tsx`

The high-impact introduction experience.

### Features
- **Cinematic Entrance**: Uses Framer Motion for sophisticated text revealing animations.
- **Handoff Logic**: Synchronized with `HomeClient.tsx` to ensure the gallery content only appears after the loader completes its sequence.
- **Aesthetic**: Minimalist design consistent with the project's premium feel.

---

## 🏠 `HomeClient.tsx` (Container)

The main orchestrator for the gallery state.

### Key Logic
- **Infinite Scroll (Sets)**: Tracks `setsCount` and uses an `IntersectionObserver` at the bottom of the page to add more marquee tracks as the user scrolls down.
- **Visual States**:
  - `isInitialLoad`: Controls the `PageLoader` visibility.
  - `isHeaderCentered`: Manages the logo's position transition.
  - `selectedImage`: Controls the `Lightbox` and applies blur/opacity to the background streams.
