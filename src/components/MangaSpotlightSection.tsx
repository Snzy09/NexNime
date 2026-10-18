"use client";

import React from "react";
import Link from "next/link";
import { Star, BookOpen, ChevronRight } from "lucide-react";
import { MangaItem } from "@/lib/services/mangaTypes";
import DraggableCarousel from "@/components/DraggableCarousel";

interface MangaSpotlightSectionProps {
  items: MangaItem[];
}

export default function MangaSpotlightSection({ items }: MangaSpotlightSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Manga &amp; Manhwa Populer Pekan Ini</span>
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Peringkat komik Manga, Manhwa, &amp; Manhua dengan pembaca tertinggi
            </p>
          </div>
        </div>

        <Link
          href="/manga"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Katalog Komik</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Manga Ranking Cards Carousel */}
      <DraggableCarousel className="pb-2">
        {items.map((manga, index) => {
          const rank = index + 1;
          const cover = manga.coverUrl
            ? manga.coverUrl.startsWith("/api/manga")
              ? manga.coverUrl
              : `/api/manga?action=image&url=${encodeURIComponent(manga.coverUrl)}`
            : null;

          return (
            <Link
              key={`${manga.id}-${index}`}
              href={`/manga/${manga.id}`}
              className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-emerald-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 w-[145px] sm:w-[180px] md:w-[200px] shrink-0"
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                {cover ? (
                  <img
                    src={cover}
                    alt={manga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/40 text-emerald-400">
                    <BookOpen className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/60" />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 uppercase">
                    {manga.type || "MANGA"}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-amber-300 border border-white/10 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    9.4
                  </span>
                </div>

                {/* Large Metallic Gold Rank Watermark */}
                <div className="absolute bottom-1 left-2 z-10 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter bg-gradient-to-b from-rose-200 via-rose-500 to-red-700 bg-clip-text text-transparent drop-shadow-md">
                    #{rank}
                  </span>
                  <span className="text-[9px] font-mono text-gray-300/80 uppercase">
                    TOP
                  </span>
                </div>
              </div>

              {/* Title & Footer Info */}
              <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 min-h-[4.25rem] sm:min-h-[5.5rem]">
                <h3
                  className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug break-words group-hover:text-emerald-300 transition-colors"
                  title={manga.title}
                >
                  {manga.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-white/5">
                  <span className="font-semibold text-emerald-400 truncate max-w-[85px]">
                    {manga.status || "Ongoing"}
                  </span>
                  <span className="font-bold text-amber-400 group-hover:underline">
                    Baca →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </DraggableCarousel>
    </section>
  );
}
