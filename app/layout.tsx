import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter is referenced in globals.css — must be loaded here so next/font
// self-hosts it and the CSS variable actually resolves at runtime.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clicks | Immersive Photography Gallery",
  description:
    "A minimal, immersive photography gallery experience showcasing moments captured through the lens.",
};

/**
 * Root layout — wires up fonts and accepts the `@modal` parallel route slot.
 *
 * `modal` renders alongside `children` in the same body, ensuring the Lightbox
 * modal overlay is always mounted at the root level regardless of which page
 * the user is on.
 *
 * @param children - Main page content (gallery).
 * @param modal    - @modal parallel route slot (PhotoModal or null via default.tsx).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
