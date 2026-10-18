import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallBanner from "@/components/PwaInstallBanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#E11D48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NexNime — Streaming Anime, Manga, Film, Drakor & Dracin",
  description: "Platform hiburan streaming Anime Jepang, Donghua, K-Drama (Drakor), Dracin, serta baca komik Manga, Manhwa & Light Novel sub Indo.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NexNime",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PwaRegister />
        {children}
        <PwaInstallBanner />
      </body>
    </html>
  );
}
