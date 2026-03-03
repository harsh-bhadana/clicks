import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clicks | Immersive Photography Gallery",
  description: "A minimal, immersive photography gallery experience showcasing moments captured through the lens.",
};

/**
 * The root layout for the Clicks application.
 * 
 * Configures the Geist Sans and Mono fonts and sets up the base HTML structure.
 * Also defines the default SEO metadata used across the gallery.
 * 
 * @param children - The child React nodes to render within the body.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
