# Component Documentation — Clicks

Detailed overview of the UI components powering the Clicks experience.

## 🏠 `HomeClient.tsx` (Container)

The main client-side orchestrator for the photography showcase grid.

### Key Features

- **Toroidal Shifting Engine**: Manages the array state updates and coordinates translations for row, column, and diagonal movements.
- **Dynamic Grid Sizing**: Computes layout values for a 4x3 grid (4 columns, 3 rows). Height is locked to `75vh` on desktop and width is set to `96vw` on mobile, maintaining a perfect `1:1` square aspect ratio for all cells.
- **Pulsating Background glows**: Cycles through 3 distinct color schemes on shifts (Purple/Blue, Emerald/Teal, Rose/Amber) and scales/dims them depending on grid movement states.

---

## 🔍 `Lightbox.tsx`

A clean, full-screen immersive viewer for individual photographs.

### Props

- `image`: `GalleryImage | null`
- `onClose`: `() => void`
- `onPrev`: `() => void`
- `onNext`: `() => void`

### Features

- **Visual Simplicity**: Stripped of metadata readouts, camera telemetry, and text clutter. Only shows the centered image.
- **Flexible Dismissal**: Closeable via a top-right "Back" button, clicking anywhere on the black backdrop, or pressing the `Escape` key.
- **Keyboard Support**: Listens for `ArrowLeft`/`ArrowRight` key events to cycle through the image pool.
- **Backdrop Cursor Integration**: The backdrop is marked with `data-cursor="back"`, causing the custom mouse cursor to display "BACK" over the overlay.

---

## 🖱️ `CustomCursor.tsx`

A custom interactive pointer component that replaces the default system cursor.

### Features

- **Smooth Inertia Tracking**: Follows mouse positions using Framer Motion spring-damped motion coordinates (`cursorX`, `cursorY`).
- **Context-Aware Expansion**: Automatically detects interactive hover targets (e.g. elements with `cursor-pointer`, `.cursor-pointer` class, or `data-cursor` attributes).
- **Label Readout**: Displays a localized, uppercase action label based on the target element's `data-cursor` attribute:
    - Default: **"VIEW"** (over grid items)
    - Lightbox Backdrop: **"BACK"** (over lightbox overlay)

---

## 🖼️ `PhotoPageClient.tsx` (Photo Details Page)

The immersive full-screen details view for individual photographs.

### Features

- **Immersive Large Frame Layout**: Displays the chosen photograph with maximum visual emphasis, alongside keyboard navigation (`ArrowLeft`/`ArrowRight`/`Escape`) to cycle through the photo pool.
- **EXIF Specifications Grid**: Renders rich technical details extracted from the photo metadata (Camera model, Lens, Aperture, Shutter Speed, ISO, Focal Length, Exposure Bias, Flash status, Image dimensions, Megapixels, and File size).
- **Contextual Stories & Location Mapping**: Displays narrative stories and GPS coordinates (Latitude & Longitude) if available, with links to map them.
- **Admin Management Integration**: Built to work in tandem with the Vercel Blob metadata updates saved via the admin dashboard.
