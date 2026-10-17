"use client";

import React from "react";
import Link from "next/link";
import { Flame, Star, ChevronRight } from "lucide-react";
import { AnimeItem } from "@/lib/services/animeService";
import DraggableCarousel from "@/components/DraggableCarousel";

interface PopularRankingSectionProps {
  items: AnimeItem[];
}

export default function PopularRankingSection({ items }: PopularRankingSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Anime Populer Pekan Ini
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Peringkat anime dengan rating &amp; penonton tertinggi
            </p>
          </div>
        </div>

        <Link
          href="/anime"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-amber-400 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Katalog Anime</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Anime Ranking Cards - Manual Mouse Draggable Carousel */}
      <DraggableCarousel className="pb-2">
        {items.map((anime, index) => {
          const rank = index + 1;
          return (
            <Link
              key={`${anime.slug}-${index}`}
              href={`/anime/${anime.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 w-[145px] sm:w-[180px] md:w-[200px] shrink-0"
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading="lazy"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/60" />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm ${
                      anime.status === "Ongoing"
                        ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                        : "bg-indigo-600/40 text-indigo-200 border border-indigo-400/30"
                    }`}
                  >
                    {anime.status || "Tamat"}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-amber-300 border border-white/10 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {anime.rating || "9.5"}
                  </span>
                </div>

                {/* Large Metallic Gold Rank Watermark */}
                <div className="absolute bottom-1 left-2 z-10 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                    #{rank}
                  </span>
                  {anime.year && (
                    <span className="text-[9px] font-mono text-gray-300/80 uppercase">
                      {anime.year}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Footer Info */}
              <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                  {anime.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-white/5">
                  <span className="font-semibold text-gray-400">{anime.type || "TV"}</span>
                  <span className="font-bold text-emerald-400">{anime.episode || "Ongoing"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </DraggableCarousel>
    </section>
  );
}
