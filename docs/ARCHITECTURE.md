# Architecture Overview — Clicks

"Clicks" is designed with a **content-first philosophy**, prioritizing high-performance animations, seamless interactive shifts, and a clean, cinematic dark aesthetic to showcase photography.

## 🏗️ High-Level Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Data Storage**: Vercel Blob (Photos and metadata JSON file)
- **Styling**: Tailwind CSS (Minimalist dark theme)
- **Animations**: Framer Motion (Fluid 2D translations, border-radius morphing, and pulsating glows)

## 📡 Data Flow

1. **Server-Side Retrieval (`app/page.tsx` & `app/lib/images.ts`)**:
    - Utilizes the `@vercel/blob` SDK to list all uploaded images under the `gallery/` prefix.
    - Requires the `BLOB_READ_WRITE_TOKEN` environment variable to authenticate the list request.
    - Resolves and fetches `gallery/metadata.json` if present in the blob bucket to merge customized details (EXIF overrides, custom titles, coordinates, and narratives).
    - Uses Next.js `unstable_cache` with a cache key of `["gallery-images"]` and a revalidation time of 1 hour to prevent redundant external network requests on every page load.
    - Filters fetched blobs to ensure only valid image extensions (e.g. `.jpg`, `.png`, `.heic`, `.webp`) are processed.
    - Sorts images sequentially by filename digits (e.g., `click_1.jpg`, `click_2.jpg`) for predictable ordering.
    - Passes the resulting `GalleryImage[]` array to the client component.

2. **Client-Side Orchestration (`app/HomeClient.tsx` & `app/hooks/useGridEngine.ts`)**:
    - Listens to viewport size changes to adaptively switch grid sizes:
        - **Desktop**: 4 columns x 3 rows grid (aspect ratio `4:3`, fits in `75vh`).
        - **Mobile**: 3 columns x 4 rows grid (aspect ratio `3:4`, fits in `96vw` width).
    - Triggers random shifting transitions (Row, Column, or Diagonal) every 4 seconds.
    - Uses a stable rendering key strategy (`key="slot-{idx}"`) to avoid visual unmounting flashes during image state swaps.
    - Implements a seamless toroidal wrapping system (utilizing a temporary 13th wrapping cell) to animate wrapping grid elements.

3. **Component Interaction**:
    - **Grid Slot (`GridSlot`)**: Handles individual image cards, hover-zoom effects, and dynamic border-radius morph transitions.
    - **Immersive Viewer (`Lightbox`)**: Provides a full-screen, minimal photo details viewer with backdrop dismiss click triggers and custom cursor integrations.
    - **Custom Cursor (`CustomCursor`)**: Overlays a premium cursor that displays context labels (like "VIEW" or "BACK") depending on the hover target.
    - **Photo Details (`PhotoInfo`)**: Displays technical EXIF specifications alongside narratives and GPS mapping pointers.

## 🎨 Key Design Decisions

### Cinematic Responsive Grid

The homepage is a distraction-free, non-scrolling single viewport. The grid dimensions automatically switch between `4x3` (landscape screens) and `3x4` (portrait mobile screens) to guarantee cells keep a perfect `1:1` square aspect ratio without clipping. All header HUD panels and footer texts are minimized or removed to maximize focus.

### Toroidal Rubik's Shifting

The grid functions like a Rubik's slide puzzle:

- **Row & Column Shifts**: Linear 2D translations shift cells flat (no 3D tilts or stretches) by exactly 1 cell width/height, looping seamlessly.
- **Diagonal Shifts**: Inside the top-left 3x3 portion of the grid (`min(cols, rows)`), cells turn into circles and scale down to `0.707` of their size to slide diagonally without overlapping. Unused fourth-column cells (on desktop) or fourth-row cells (on mobile) are dimmed and blurred during diagonal shifts to maintain focal depth.

### Pulsating Ambient Background

Dynamic `motion.div` glows sit behind the translucent grid glass. The glows expand in scale and double in brightness during active shifts, and fade out completely to `opacity: 0` during idle states. The colors alternate between Purple/Blue, Emerald/Teal, and Rose/Amber on each shifting cycle.

## 🛡️ Admin Dashboard & Upload Flow

The administrative system (`app/admin`) provides a robust content management workflow:

1. **Authentication**:
    - Secure sign-in check handled in `app/admin/layout.tsx` and via `/api/admin` backend routes.
    - Saves a secure session cookie upon success and redirects unauthorized attempts back to the login screen.

2. **Smart Image Compression**:
    - High-resolution camera files are automatically loaded into an off-screen HTML Canvas on the client before upload.
    - Dynamically scales down dimensions to a maximum height/width of 1600px while maintaining the original aspect ratio.
    - Compresses to standard progressive WebP/JPEG format to shrink upload sizes significantly, saving Vercel Blob storage space and improving site performance.

3. **EXIF Specification Extraction**:
    - Uses `exifr` client-side to read the raw binary header tags of uploaded photos.
    - Automatically populates the specs schema: camera make/model, lens details, aperture, shutter speed, ISO values, focal length, exposure bias, and original dimensions.
    - Attempts to extract GPS coordinates (`latitude`, `longitude`) to provide maps integration.

4. **Batch Operations**:
    - Allows selecting multiple photos in the admin list to execute batch deletion requests, which deletes the corresponding assets from Vercel Blob and cleans up references in `metadata.json`.

## 🚀 Performance & Quality

- **Image Optimization**: Utilizes native `next/image` with responsive size targets (`sizes="(max-width: 768px) 50vw, 25vw"`) for the grid. Next.js dynamically serves correctly scaled WebP/AVIF versions, preventing browser aliasing and pixelated rendering while minimizing memory footprint.
- **2D Transitions**: Built using highly optimized 2D Framer Motion properties (`x`, `y`, `scale`) rather than expensive 3D perspective layers, ensuring flat, sharp, and lightweight rendering.
