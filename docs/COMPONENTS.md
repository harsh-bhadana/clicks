# Component Documentation — Clicks

Detailed overview of the React components powering the Clicks experience.

## 🏠 `HomeClient.tsx` (Container)

The main client-side orchestrator for the photography showcase grid.

### Key Features

- **Toroidal Shifting Engine**: Manages the array state updates and coordinates translations for row, column, and diagonal movements.
- **Dynamic Grid Sizing**: Automatically adapts on window resize. Swaps between desktop `4x3` grid (aspect `4:3`) and mobile `3x4` grid (aspect `3:4`) to maintain perfectly proportional square slots (`aspect-square`) on all viewport formats.
- **Pulsating Background glows**: Cycles through 3 distinct color schemes on shifts (Purple/Blue, Emerald/Teal, Rose/Amber) and scales/dims them depending on grid movement states.

---

## 🔍 `Lightbox.tsx`

A clean, full-screen immersive viewer for individual photographs.

### Props

- `image`: `GalleryImage | null`
- `onClose`: `() => void`
- `onPrev`: `() => void`
- `onNext`: `() => void`
- `totalImages`: `number`
- `currentIndex`: `number`

### Features

- **Visual Simplicity**: Stripped of metadata readouts, camera telemetry, and text clutter. Only shows the centered image.
- **Flexible Dismissal**: Closeable via a top-right "Back" button, clicking anywhere on the black backdrop, or pressing the `Escape` key.
- **Keyboard Support**: Listens for `ArrowLeft`/`ArrowRight` key events to cycle through the image pool.
- **Backdrop Cursor Integration**: The backdrop is marked with `data-cursor="back"`, causing the custom mouse cursor to display "BACK" over the overlay.
- **Index Counter HUD**: Displays the current position and total count (e.g. `02 / 12`) to keep users oriented without cluttering the screen.

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

---

## 🌟 `AmbientGlow.tsx`

The background lighting system that animates behind the main grid container.

### Props

- `glowColor1`: `string`
- `glowColor2`: `string`
- `isShifting`: `boolean`

### Features

- **Dynamic Glow Blurs**: Incorporates radial gradients with massive blurs (`blur-[120px]`) that morph dynamically.
- **Active Scaling**: Glows double in opacity and scale up from `1.0` to `1.3` during transition shifts to give the interface an active, pulsating heartbeat feel, fading back down to a subtle idle glow.

---

## 🔀 `WrappingCell.tsx`

A helper component responsible for animating toroidal wraps.

### Props

- `data`: `WrappingCellData` (specifies `image`, `left` position, and `top` position)
- `isDiag`: `boolean`
- `animate`: `TargetAndTransition`
- `cols`: `number`
- `rows`: `number`

### Features

- **Toroidal Continuity**: Acts as the temporary 13th wrapping cell that slides in from off-screen while the original displaced cell slides out, maintaining visual continuity during toroidal transformations.

---

## 📊 `PhotoInfo.tsx`

Renders the metadata list, EXIF tags, GPS directions, and custom photography stories on the details page.

### Props

- `image`: `GalleryImage`

### Features

- **Structured Categories**: Groups specs into sections (e.g., Camera telemetry vs. physical image specs).
- **GPS Map Link**: Automatically formats coordinates into Google Maps search links if latitude and longitude numbers exist.

---

## 🛠️ `AdminClient.tsx`

The central administrative interface (`/admin`) for gallery content management.

### Props

- `initialImages`: `GalleryImage[]`

### Features

- **Interactive Multi-select Table**: Displays the images with list details, search filters, and checkbox toggles for batch operations.
- **Tabbed Editor Form**:
    - _General_: Edits title, photographer notes/stories, shooting date, and tags.
    - _Specs_: Edits aperture, shutter speed, ISO, focal length, lens, camera body, megapixels, dimensions, and file size.
    - _Location_: Inputs geographic names alongside numeric coordinates.
- **Automated Dropzone**: Includes file uploading via drop and click actions, feeding new uploads through compression pipelines and extracting EXIF headers before saving.
