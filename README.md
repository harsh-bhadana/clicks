# Clicks — Photography Showcase

**Clicks** is a minimal, immersive, and premium photography gallery designed to showcase personal photography through infinite-scrolling streams. 

The experience is built with a "content-first" philosophy, using high-performance animations and a sophisticated dark aesthetic to let the photography speak for itself.

## ✨ Key Features

- **Infinite Streams**: Endless horizontal marquees that showcase photos in multiple tracks with varied speeds and directions.
- **Immersive View**: A premium lightbox experience for detailed viewing of individual "clicks".
- **Premium Aesthetics**: Dark mode by default, featuring glassmorphism effects, fluid animations, and high-performance transitions.
- **Responsive Design**: Seamlessly adapts to different screen sizes while maintaining its cinematic feel.

## 📖 Documentation

For more detailed information on how Clicks is built, check out the following:

- [**Architecture Overview**](file:///d:/Code/clicks/docs/ARCHITECTURE.md): Technical stack, data flow, and design philosophy.
- [**Component Guide**](file:///d:/Code/clicks/docs/COMPONENTS.md): Detailed prop definitions and implementation logic for UI components.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: [Geist Sans/Mono](https://vercel.com/font)

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
This project serves as a digital home for my personal photography, captured and curated with care. Each "click" represents a moment, a perspective, or a story worth sharing.

---
*Built with passion for photography and high-end web experiences.*
