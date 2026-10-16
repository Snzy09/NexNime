"use client";

import React from "react";
import Link from "next/link";
import { Heart, Play, ChevronRight, Sparkles, Film, Tv } from "lucide-react";
import { OppaDramaCard } from "@/lib/services/oppadramaService";

interface OppaDramaSectionProps {
  items: OppaDramaCard[];
}

export default function OppaDramaSection({ items }: OppaDramaSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-fuchsia-400 fill-fuchsia-500/20" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>OppaDrama - Drakor &amp; Series</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-fuchsia-400" />
                Drakor &amp; Film Asia
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Nonton streaming drama Korea, serial drama Asia, dan film layar lebar terbaru subtitle Indonesia
          </p>
        </div>

        <Link
          href="/oppadrama"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-fuchsia-400 flex items-center gap-1 transition-colors"
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
            href={`/oppadrama/watch?url=${encodeURIComponent(
              item.url
            )}&title=${encodeURIComponent(item.title)}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-fuchsia-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-950/40"
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
                <div className="w-full h-full flex items-center justify-center bg-fuchsia-950/20 text-fuchsia-300 text-xs text-center p-3">
                  {item.title}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-fuchsia-500 text-black flex items-center justify-center shadow-xl shadow-fuchsia-500/50">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-500 text-black shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  {item.episode || "Series"}
                </span>

                {item.type && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-fuchsia-300 backdrop-blur-sm border border-fuchsia-500/30 flex items-center gap-0.5">
                    {item.type}
                  </span>
                )}
              </div>

              {/* Bottom Card Title Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-fuchsia-300 transition-colors">
                  {item.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {item.type || "OppaDrama"} Sub Indo
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
