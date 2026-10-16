"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Sparkles, Clock } from "lucide-react";
import { NovelCard } from "@/lib/services/novelService";

interface NovelSectionProps {
  items: NovelCard[];
}

export default function NovelSection({ items }: NovelSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>BacaLN - Light Novel &amp; Web Novel</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Bahasa Indonesia
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Baca ribuan bab light novel dan web novel terjemahan dengan mode auto-scroll dan penyesuaian font
          </p>
        </div>

        <Link
          href="/novel"
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <span>Katalog Novel</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Poster Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {items.slice(0, 6).map((item, idx) => (
          <Link
            key={idx}
            href={`/novel/read?url=${encodeURIComponent(
              item.url
            )}&title=${encodeURIComponent(item.title)}`}
            className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-emerald-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/40"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
              {item.thumbnail &&
              !item.thumbnail.includes("image-placeholder.png") &&
              !item.thumbnail.includes("flip-8496325764.png") ? (
                <img
                  src={
                    item.thumbnail.startsWith("http")
                      ? `/api/novel?action=image&url=${encodeURIComponent(item.thumbnail)}`
                      : item.thumbnail
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const fb = e.currentTarget.parentElement?.querySelector(
                      ".custom-cover-fallback"
                    );
                    if (fb) (fb as HTMLElement).style.display = "flex";
                  }}
                />
              ) : null}

              {/* Custom Cover Fallback */}
              <div
                className={`custom-cover-fallback w-full h-full flex flex-col items-center justify-between p-3.5 bg-gradient-to-b from-[#0F2922] via-[#091C16] to-[#06100D] border border-emerald-500/20 text-center relative overflow-hidden ${
                  item.thumbnail &&
                  !item.thumbnail.includes("image-placeholder.png") &&
                  !item.thumbnail.includes("flip-8496325764.png")
                    ? "hidden"
                    : "flex"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-2 shadow-sm">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-emerald-100 line-clamp-3 leading-snug drop-shadow-md px-1 z-10">
                  {item.title}
                </p>
                <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest z-10">
                  LIGHT NOVEL
                </span>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Read Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl shadow-emerald-500/50">
                  <BookOpen className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>

              {/* Top Badge */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black shadow-sm flex items-center gap-1 backdrop-blur-sm max-w-[90%] truncate">
                  {item.latestChapter || "Novel"}
                </span>
              </div>

              {/* Bottom Card Title Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </p>
                {item.updated && (
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{item.updated}</span>
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
