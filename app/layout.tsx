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
    metadataBase: new URL("https://clicks-gallery.vercel.app"),
    openGraph: {
        title: "Clicks | Immersive Photography Gallery",
        description:
            "A minimal, immersive photography gallery experience showcasing moments captured through the lens.",
        type: "website",
        siteName: "Clicks",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "Clicks | Immersive Photography Gallery",
        description:
            "A minimal, immersive photography gallery experience showcasing moments captured through the lens.",
    },
    icons: {
        icon: "/favicon.svg",
    },
};

/**
 * Root layout — wires up fonts and global styles.
 *
 * @param children - Main page content (gallery).
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
