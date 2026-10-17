"use client";

import React from "react";
import Link from "next/link";
import { Video, Play, ChevronRight, Sparkles, Flame } from "lucide-react";
import { NetShortItem } from "@/lib/services/netshortService";
import DraggableCarousel from "@/components/DraggableCarousel";

interface NetShortSectionProps {
  items: NetShortItem[];
}

export default function NetShortSection({ items }: NetShortSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>NetShort Mini Series</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-purple-400" />
                9:16 Shorts
              </span>
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Drama vertikal populer dari NetShort: Mafia, Lycan, Werewolf, &amp; Revenge dengan direct MP4 video playback
            </p>
          </div>
        </div>

        <Link
          href="/netshort"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-purple-400 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Katalog NetShort</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 9:16 Vertical Cards - Manual Mouse Draggable Carousel */}
      <DraggableCarousel className="pb-2">
        {items.map((drama) => (
          <Link
            key={drama.slug}
            href={`/netshort/watch?slug=${drama.slug}&title=${encodeURIComponent(drama.title)}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-purple-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/40 w-[145px] sm:w-[180px] md:w-[200px] shrink-0"
          >
            {/* Standard Aspect Ratio container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
              {drama.cover ? (
                <img
                  src={drama.cover}
                  alt={drama.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-950/20 text-purple-300 text-xs p-3 text-center">
                  {drama.title}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/40">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/80 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  NetShort
                </span>
                {drama.total_episodes && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-gray-200 border border-white/10 backdrop-blur-sm">
                    {drama.total_episodes} Ep
                  </span>
                )}
              </div>

              {/* Bottom Content inside 9:16 Frame */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors drop-shadow">
                  {drama.title}
                </h3>
                {drama.genre && drama.genre.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {drama.genre.slice(0, 2).map((g, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 backdrop-blur-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </DraggableCarousel>
    </section>
  );
}
