"use client";

import React from "react";
import Link from "next/link";
import { Compass, Play, ChevronRight, Sparkles, Clock } from "lucide-react";
import { AnimeSailCard } from "@/lib/services/animesailService";

interface AnimeSailSectionProps {
  items: AnimeSailCard[];
}

export default function AnimeSailSection({ items }: AnimeSailSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>AnimeSail Rilis Terbaru</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                Live Sub Indo
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Nonton streaming anime & movie episode terbaru dengan player multi-server HD dari AnimeSail
          </p>
        </div>

        <Link
          href="/animesail"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
        >
          <span>Katalog Lengkap</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Poster Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {items.slice(0, 6).map((item, idx) => (
          <Link
            key={idx}
            href={`/animesail/watch?url=${encodeURIComponent(
              item.url
            )}&title=${encodeURIComponent(item.title)}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-sky-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-950/40"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-sky-950/30 text-sky-300 text-xs text-center p-3">
                  {item.title}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-black flex items-center justify-center shadow-xl shadow-sky-500/50">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-black shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  {item.episode ? `EP ${item.episode}` : "Anime"}
                </span>

                {item.type && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-sky-300 backdrop-blur-sm border border-sky-500/30 flex items-center gap-0.5">
                    {item.type}
                  </span>
                )}
              </div>

              {/* Bottom Card Title Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                  {item.title}
                </p>
                {item.latestTime && (
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{item.latestTime}</span>
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
