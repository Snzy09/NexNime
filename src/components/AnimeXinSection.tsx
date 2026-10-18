"use client";

import React from "react";
import Link from "next/link";
import { Tv, Play, ChevronRight, Sparkles, Star } from "lucide-react";
import { AnimeXinItem } from "@/lib/services/animexinService";

interface AnimeXinSectionProps {
  items: AnimeXinItem[];
}

export default function AnimeXinSection({ items }: AnimeXinSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Tv className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>AnimeXin Donghua Hub</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Chinese Animation
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Streaming animasi China populer (Renegade Immortal, Against the Gods, Tales of Herding Gods) Subtitle Indonesia
          </p>
        </div>

        <Link
          href="/animexin"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <span>Katalog Donghua</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Poster Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {items.slice(0, 6).map((item, idx) => (
          <Link
            key={idx}
            href={`/animexin/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-cyan-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/40"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
              {item.poster ? (
                <img
                  src={
                    item.poster.startsWith("http")
                      ? `/api/animexin?action=image&url=${encodeURIComponent(item.poster)}`
                      : item.poster
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cyan-950/30 text-cyan-300 text-xs text-center p-3">
                  {item.title}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl shadow-cyan-500/50">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-black shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  {item.episode || "Donghua"}
                </span>

                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-sm border border-white/10 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                  {item.rating || "8.8"}
                </span>
              </div>

              {/* Bottom Card Title Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug break-words group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {item.type || "AnimeXin Sub Indo"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
