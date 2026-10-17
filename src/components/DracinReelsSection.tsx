"use client";

import React from "react";
import Link from "next/link";
import { Video, Play, Eye, ChevronRight, Sparkles } from "lucide-react";
import { DracinItem } from "@/lib/services/dracinService";
import DraggableCarousel from "@/components/DraggableCarousel";

interface DracinReelsSectionProps {
  items: DracinItem[];
}

export default function DracinReelsSection({ items }: DracinReelsSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Drama Pendek Populer Pekan Ini (9:16 Short Drama)</span>
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Peringkat serial drama vertikal trending dengan penonton terbanyak
            </p>
          </div>
        </div>

        <Link
          href="/dracin"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-rose-400 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Katalog Dracin</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 9:16 Popular Ranking Cards */}
      <DraggableCarousel className="pb-2">
        {items.map((dracin, idx) => {
          const rank = idx + 1;
          return (
            <Link
              key={`${dracin.slug}-${idx}`}
              href={`/dracin/watch?slug=${encodeURIComponent(dracin.slug)}&title=${encodeURIComponent(dracin.title)}`}
              className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 w-[145px] sm:w-[180px] md:w-[200px] shrink-0"
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                <img
                  src={dracin.image || "https://d378mspt4q6n8p.cloudfront.net/posters/dragon-emperor.jpg"}
                  alt={dracin.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/60" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-xl shadow-rose-500/40">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm bg-rose-600/80 text-white flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Mini Drama
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-gray-200 border border-white/10 flex items-center gap-1 backdrop-blur-sm">
                    <Eye className="w-2.5 h-2.5 text-rose-400" />
                    {((dracin.views || 250000) / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Large Metallic Gold Rank Watermark */}
                <div className="absolute bottom-1 left-2 z-10 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black italic tracking-tighter bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                    #{rank}
                  </span>
                  <span className="text-[9px] font-mono text-gray-300/80 uppercase">
                    HOT
                  </span>
                </div>
              </div>

              {/* Title & Footer Info */}
              <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 min-h-[5.5rem]">
                <h3
                  className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-relaxed group-hover:text-rose-300 transition-colors"
                  title={dracin.title}
                >
                  {dracin.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-white/5">
                  <span className="font-semibold text-rose-400">
                    {dracin.episodes || 80} Episode
                  </span>
                  <span className="font-bold text-amber-400 group-hover:underline">
                    Nonton →
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
