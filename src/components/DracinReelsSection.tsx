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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Dracin Short Drama</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                9:16 Reels
              </span>
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Serial drama pendek vertikal 80+ episode instan ala TikTok &amp; Reels
            </p>
          </div>
        </div>

        <Link
          href="/dracin"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-rose-400 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Buka Pemutar Shorts</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 9:16 Vertical Cards - Manual Mouse Draggable Carousel */}
      <DraggableCarousel className="pb-2">
        {items.map((dracin, idx) => (
          <Link
            key={`${dracin.slug}-${idx}`}
            href={`/dracin/watch?slug=${encodeURIComponent(dracin.slug)}&title=${encodeURIComponent(dracin.title)}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/30 w-[145px] sm:w-[180px] md:w-[200px] shrink-0"
          >
            {/* Standard Aspect Ratio container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
              <img
                src={dracin.image || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80"}
                alt={dracin.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-xl shadow-rose-500/40">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/80 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  Mini Drama
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-gray-200 border border-white/10 flex items-center gap-1 backdrop-blur-sm">
                  <Eye className="w-2.5 h-2.5 text-rose-400" />
                  {((dracin.views || 250000) / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Bottom Content inside 9:16 Frame */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">
                  <span>{dracin.episodes || 80} Episode Lengkap</span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors drop-shadow">
                  {dracin.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {dracin.genres?.slice(0, 2).map((g, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 backdrop-blur-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </DraggableCarousel>
    </section>
  );
}
