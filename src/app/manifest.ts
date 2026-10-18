import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NexNime — Streaming Anime, Donghua, Drakor & Dracin",
    short_name: "NexNime",
    description: "Platform streaming Anime Jepang, Donghua, Dracin, Drakor dan baca Manga terlengkap sub Indo.",
    start_url: "/",
    display: "standalone",
    background_color: "#07070A",
    theme_color: "#E11D48",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["entertainment", "video"],
  };
}
