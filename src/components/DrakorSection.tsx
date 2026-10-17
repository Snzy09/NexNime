"use client";

import React from "react";
import Link from "next/link";
import { Clapperboard, Star, ChevronRight, Play } from "lucide-react";
import { DrakorItem } from "@/lib/services/drakorService";
import DraggableCarousel from "@/components/DraggableCarousel";

interface DrakorSectionProps {
  items: DrakorItem[];
}

export default function DrakorSection({ items }: DrakorSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Drama Korea Populer (Drakor)
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Streaming K-Drama terbaru &amp; ongoing subtitle Indonesia multi-server
            </p>
          </div>
        </div>

        <Link
          href="/drakor"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Semua Drakor</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Drakor Cards - Manual Mouse Draggable Carousel */}
      <DraggableCarousel className="pb-2">
        {items.map((drama, idx) => (
          <Link
            key={`${drama.slug}-${idx}`}
            href={`/drakor/${drama.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-blue-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 w-[145px] sm:w-[180px] md:w-[200px] shrink-0"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
              <img
                src={drama.poster || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80"}
                alt={drama.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/60" />

              {/* Play Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-10 h-10 rounded-full bg-blue-500/90 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  K-Drama
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-amber-300 border border-white/10 flex items-center gap-0.5 backdrop-blur-sm">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {drama.rating || "9.3"}
                </span>
              </div>
            </div>

            <div className="p-2.5 flex flex-col justify-between flex-1">
              <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                {drama.title}
              </h3>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1.5 border-t border-white/5">
                <span className="font-semibold text-gray-500">Drakor</span>
                <span className="font-bold text-blue-400">{drama.episode || "Ongoing"}</span>
              </div>
            </div>
          </Link>
        ))}
      </DraggableCarousel>
    </section>
  );
}
