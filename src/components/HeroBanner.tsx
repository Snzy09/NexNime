"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tv,
  BookOpen,
  Clapperboard,
  Video,
} from "lucide-react";
import { AnimeItem } from "@/lib/services/animeService";
import { MangaItem } from "@/lib/services/mangaTypes";
import { DrakorItem } from "@/lib/services/drakorService";
import { DracinItem } from "@/lib/services/dracinService";
import { AnimeXinItem } from "@/lib/services/animexinService";

export interface HeroSlide {
  id: string;
  category: string;
  typeBadge: string;
  rating: string;
  quality: string;
  badgeStatus: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  browseLink: string;
  image: string;
  bgGradient: string;
  accentColor: string;
}

interface HeroBannerProps {
  animeList?: AnimeItem[];
  mangaList?: MangaItem[];
  drakorList?: DrakorItem[];
  dracinList?: DracinItem[];
  animexinList?: AnimeXinItem[];
}

const HERO_SLIDES_FALLBACK: HeroSlide[] = [
  {
    id: "fallback-1",
    category: "ANIME",
    typeBadge: "Premier Anime",
    rating: "9.9",
    quality: "ULTRA HD",
    badgeStatus: "Ongoing",
    title: "Luoyiv Universe — Streaming Anime & Donghua",
    subtitle:
      "Platform streaming terlengkap dengan ribuan judul Anime, Donghua, Manga, Drakor, dan Dracin kualitas Full HD 1080p audio jernih dan bebas gangguan.",
    ctaText: "Jelajahi Anime",
    ctaLink: "/anime",
    browseLink: "/anime",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=85",
    bgGradient: "from-amber-950/70 via-black/40 to-transparent",
    accentColor: "text-amber-400",
  },
  {
    id: "fallback-2",
    category: "MANHWA",
    typeBadge: "Trending Manhwa",
    rating: "9.85",
    quality: "4K ULTRA HD",
    badgeStatus: "Ongoing",
    title: "Solo Leveling: Arise & Shadow Monarch",
    subtitle:
      "Tonton petualangan Sung Jin-woo membangkitkan prajurit bayangan dan menaklukkan Dungeon Peringkat S dalam kualitas 4K tanpa hambatan.",
    ctaText: "Baca Sekarang",
    ctaLink: "/manga",
    browseLink: "/manga",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&q=85",
    bgGradient: "from-indigo-950/70 via-black/40 to-transparent",
    accentColor: "text-indigo-400",
  },
];

const CATEGORY_TABS = [
  { label: "ANIME", key: "ANIME", href: "/anime", icon: Tv, color: "text-amber-400" },
  { label: "DONGHUA", key: "DONGHUA", href: "/animexin", icon: Sparkles, color: "text-rose-400" },
  { label: "MANHWA", key: "MANHWA", href: "/manga?type=manhwa", icon: BookOpen, color: "text-emerald-400" },
  { label: "DRAKOR", key: "DRAKOR", href: "/drakor", icon: Clapperboard, color: "text-blue-400" },
  { label: "DRACIN 9:16", key: "DRACIN", href: "/dracin", icon: Video, color: "text-purple-400" },
];

export default function HeroBanner({
  animeList = [],
  mangaList = [],
  drakorList = [],
  dracinList = [],
  animexinList = [],
}: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartXRef = useRef<number | null>(null);

  // Compile realtime dynamic slides across all content streams
  const slides = useMemo<HeroSlide[]>(() => {
    const list: HeroSlide[] = [];

    // 1. Realtime Top Anime (AnimeIndo)
    if (animeList.length > 0) {
      const a = animeList[0];
      list.push({
        id: `anime-${a.slug}`,
        category: "ANIME",
        typeBadge: "ANIME POPULER",
        rating: a.rating || "8.9",
        quality: a.type ? `${a.type} 1080P` : "FULL HD 1080P",
        badgeStatus: a.episode || a.status || "Ongoing",
        title: a.title,
        subtitle:
          a.genres && a.genres.length > 0
            ? `Genre: ${a.genres.join(", ")} • Tonton episode terbaru sub Indo kualitas jernih tanpa jeda.`
            : "Streaming anime terbaru sub Indo dengan server cepat dan multi-resolusi 360p - 1080p.",
        ctaText: "Tonton Anime",
        ctaLink: `/anime/${a.slug}`,
        browseLink: "/anime",
        image: a.poster,
        bgGradient: "from-amber-950/70 via-black/40 to-transparent",
        accentColor: "text-amber-400",
      });
    }

    // 2. Realtime Top Donghua 3D (AnimeXin)
    if (animexinList.length > 0) {
      const ax = animexinList[0];
      const cleanTitle = ax.title.replace(/\s*Episode\s*\d+.*$/i, "").trim() || ax.title;
      const axImg = ax.poster?.startsWith("http")
        ? `/api/animexin?action=image&url=${encodeURIComponent(ax.poster)}`
        : ax.poster || "";
      list.push({
        id: `donghua-${ax.slug || "1"}`,
        category: "DONGHUA",
        typeBadge: "DONGHUA PILIHAN",
        rating: ax.rating || "9.5",
        quality: "4K DONGHUA 3D",
        badgeStatus: ax.episode || "Terbaru",
        title: cleanTitle,
        subtitle:
          "Petualangan kultivasi 3D spektakuler dengan visual grafis kelas atas, aksi silat memukau dan audio jernih.",
        ctaText: "Nonton Donghua",
        ctaLink: `/animexin/watch?url=${encodeURIComponent(ax.url)}&title=${encodeURIComponent(ax.title)}`,
        browseLink: "/animexin",
        image: axImg,
        bgGradient: "from-rose-950/70 via-black/40 to-transparent",
        accentColor: "text-rose-400",
      });
    }

    // 3. Realtime Top Manga / Manhwa (MangaDex)
    if (mangaList.length > 0) {
      const m = mangaList[0];
      const mImg = m.coverUrl
        ? m.coverUrl.startsWith("/api/manga")
          ? m.coverUrl
          : `/api/manga?action=image&url=${encodeURIComponent(m.coverUrl)}`
        : "";
      list.push({
        id: `manga-${m.id}`,
        category: (m.type || "MANHWA").toUpperCase(),
        typeBadge: `${(m.type || "MANHWA").toUpperCase()} POPULER`,
        rating: "9.9",
        quality: "HD FULL COLOR",
        badgeStatus: m.status?.toUpperCase() || "ONGOING",
        title: m.title,
        subtitle: m.synopsis
          ? m.synopsis.split("\n")[0].slice(0, 160) + "..."
          : "Baca komik dan manhwa berwarna terpopuler dengan bab update tercepat dalam bahasa Indonesia.",
        ctaText: "Baca Komik",
        ctaLink: `/manga/${m.id}`,
        browseLink: "/manga",
        image: mImg,
        bgGradient: "from-emerald-950/70 via-black/40 to-transparent",
        accentColor: "text-emerald-400",
      });
    }

    // 4. Realtime Top Drakor (DrakorID)
    if (drakorList.length > 0) {
      const d = drakorList[0];
      list.push({
        id: `drakor-${d.slug}`,
        category: "DRAKOR",
        typeBadge: "DRAKOR TRENDING",
        rating: d.rating || "9.4",
        quality: "1080P FULL HD",
        badgeStatus: d.episode || "Serial Pilihan",
        title: d.title,
        subtitle:
          "Serial drama Korea terpopuler dan terupdate dengan subtitle Indonesia lengkap, server kencang tanpa lag.",
        ctaText: "Nonton Drakor",
        ctaLink: `/drakor/${d.slug}`,
        browseLink: "/drakor",
        image: d.poster || "",
        bgGradient: "from-blue-950/70 via-black/40 to-transparent",
        accentColor: "text-blue-400",
      });
    }

    // 5. Realtime Top Dracin Mini Drama 9:16 (AsiaBox)
    if (dracinList.length > 0) {
      const dr = dracinList[0];
      list.push({
        id: `dracin-${dr.slug}`,
        category: "DRACIN 9:16",
        typeBadge: "DRACIN SHORT 9:16",
        rating: "9.7",
        quality: "VERTICAL 60FPS",
        badgeStatus: `${dr.episodes || 60}+ Episode`,
        title: dr.title,
        subtitle: dr.description
          ? dr.description.slice(0, 150) + "..."
          : "Sensasi menonton drama pendek vertikal kilat dengan alur cepat, konflik intens, dan pergantian episode instan.",
        ctaText: "Nonton Reels",
        ctaLink: `/dracin?drama=${dr.slug}`,
        browseLink: "/dracin",
        image: dr.image || "",
        bgGradient: "from-purple-950/70 via-black/40 to-transparent",
        accentColor: "text-purple-400",
      });
    }

    // 6. Secondary Top Anime
    if (animeList.length > 1) {
      const a2 = animeList[1];
      list.push({
        id: `anime-${a2.slug}-2`,
        category: "ANIME",
        typeBadge: "ANIME PILIHAN #2",
        rating: a2.rating || "8.8",
        quality: "1080P FULL HD",
        badgeStatus: a2.episode || a2.status || "Ongoing",
        title: a2.title,
        subtitle:
          a2.genres && a2.genres.length > 0
            ? `Genre: ${a2.genres.join(", ")} • Tonton keseruan episode terbaru dengan kualitas terbaik.`
            : "Streaming anime terbaru kualitas Full HD dengan subtitle Indonesia terverifikasi.",
        ctaText: "Tonton Sekarang",
        ctaLink: `/anime/${a2.slug}`,
        browseLink: "/anime",
        image: a2.poster,
        bgGradient: "from-amber-950/70 via-black/40 to-transparent",
        accentColor: "text-amber-400",
      });
    }

    // 7. Secondary Top Manga
    if (mangaList.length > 1) {
      const m2 = mangaList[1];
      const m2Img = m2.coverUrl
        ? m2.coverUrl.startsWith("/api/manga")
          ? m2.coverUrl
          : `/api/manga?action=image&url=${encodeURIComponent(m2.coverUrl)}`
        : "";
      list.push({
        id: `manga-${m2.id}-2`,
        category: (m2.type || "MANHWA").toUpperCase(),
        typeBadge: `${(m2.type || "MANHWA").toUpperCase()} SPOTLIGHT`,
        rating: "9.8",
        quality: "HD FULL COLOR",
        badgeStatus: m2.status?.toUpperCase() || "ONGOING",
        title: m2.title,
        subtitle: m2.synopsis
          ? m2.synopsis.split("\n")[0].slice(0, 160) + "..."
          : "Komik terpopuler dengan cerita seru dan chapter rilis terupdate setiap minggunya.",
        ctaText: "Baca Komik",
        ctaLink: `/manga/${m2.id}`,
        browseLink: "/manga",
        image: m2Img,
        bgGradient: "from-teal-950/70 via-black/40 to-transparent",
        accentColor: "text-teal-400",
      });
    }

    return list.length > 0 ? list : HERO_SLIDES_FALLBACK;
  }, [animeList, mangaList, drakorList, dracinList, animexinList]);

  // Auto-play timer (pauses when user hovers)
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const activeIndex = currentSlide % slides.length;
  const slide = slides[activeIndex] || slides[0];

  // Mouse / Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - dragStartXRef.current;
    if (diff > 50) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -50) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    dragStartXRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    dragStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartXRef.current === null) return;
    const diff = e.clientX - dragStartXRef.current;
    if (diff > 60) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -60) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    dragStartXRef.current = null;
  };

  const jumpToCategory = (catKey: string) => {
    const targetIdx = slides.findIndex((s) =>
      s.category.toUpperCase().includes(catKey.toUpperCase())
    );
    if (targetIdx !== -1) {
      setCurrentSlide(targetIdx);
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Curved Hero Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          dragStartXRef.current = null;
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[460px] md:min-h-[500px] border border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-10 md:p-12 select-none"
      >
        {/* Dynamic Realtime Background Image with Ambient Zoom */}
        <div
          key={slide.image}
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 filter brightness-95 md:brightness-100 opacity-95"
          style={{ backgroundImage: `url(${slide.image})` }}
        />

        {/* Ambient Theme Color Tint */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-40 transition-all duration-700`}
        />

        {/* Scrim Overlays for Razor-Sharp Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090D] via-[#09090D]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E]/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {slide.typeBadge}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-black/60 border border-white/10 flex items-center gap-1 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {slide.rating}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider text-white bg-white/10 border border-white/15 backdrop-blur-sm">
            {slide.quality}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
            {slide.badgeStatus}
          </span>
        </div>

        {/* Center Content: Title & Synopsis */}
        <div className="relative z-10 flex flex-col items-start justify-center my-auto py-4">
          {/* Left Text Column */}
          <div className="max-w-2xl sm:max-w-3xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-200 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-md">
              {slide.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                {slide.ctaText}
              </Link>
              <Link
                href={slide.browseLink}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-all hover:scale-105"
              >
                <span>Lihat Semua {slide.category}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Controls & Category Pills */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          {/* Sub-category Quick Jump Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORY_TABS.map((cat, i) => {
              const isActive = slide.category.toUpperCase().includes(cat.key);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jumpToCategory(cat.key)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/30"
                      : "bg-black/50 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
                  }`}
                >
                  <cat.icon className={`w-3 h-3 ${cat.color}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Arrows & Slide Indicator Dots */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
              }
              aria-label="Previous Slide"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 hover:border-amber-400/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === i ? "w-6 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              aria-label="Next Slide"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 hover:border-amber-400/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
