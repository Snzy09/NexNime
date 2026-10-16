"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, BookOpen, Flame, MoveHorizontal } from "lucide-react";
import { MangaItem } from "@/lib/services/mangaTypes";
import DraggableCarousel from "@/components/DraggableCarousel";

interface MangaSpotlightSectionProps {
  items: MangaItem[];
}

export default function MangaSpotlightSection({ items }: MangaSpotlightSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!items || items.length === 0) return null;
  const currentManga = items[selectedIndex] || items[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Popular Tags */}
      <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-3 sm:p-4 mb-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="font-bold text-amber-400 flex items-center gap-1 mr-1">
              <Flame className="w-3.5 h-3.5" /> REKOMENDASI:
            </span>
            {["Solo Leveling", "Chainsaw Man", "Dandadan", "Jujutsu Kaisen", "Frieren", "One Piece", "Magic Emperor", "Nano Machine"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/manga?q=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-300 transition-colors"
                >
                  {tag}
                </Link>
              )
            )}
          </div>

          <Link
            href="/manga"
            className="text-gray-400 hover:text-amber-400 font-medium text-[11px] whitespace-nowrap ml-auto"
          >
            Buka Katalog Lengkap →
          </Link>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {currentManga && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#161622] via-[#101018] to-[#0D0D14] border border-white/10 p-5 sm:p-8 shadow-2xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Cover Poster */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center">
              <div className="relative aspect-[3/4] w-48 sm:w-56 rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
                {currentManga.coverUrl ? (
                  <img
                    src={
                      currentManga.coverUrl.startsWith("/api/manga")
                        ? currentManga.coverUrl
                        : `/api/manga?action=image&url=${encodeURIComponent(currentManga.coverUrl)}`
                    }
                    alt={currentManga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#181824]">
                    <BookOpen className="w-12 h-12 text-amber-400/50" />
                  </div>
                )}
                {/* Top Chapter Badge */}
                <div className="absolute top-2 left-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-center text-white border border-white/10">
                  {currentManga.status?.toUpperCase() || "MANGA"}
                </div>

                {/* Bottom Type Badge */}
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-amber-300 uppercase border border-amber-400/30">
                  {currentManga.type || "MANHWA"}
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-center">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  {currentManga.contentRating === "erotica" ? "18+ MATURE" : "POPULER"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  9.2
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                  Server: MangaDex
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {currentManga.status || "Ongoing"}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {currentManga.title}
              </h3>

              {/* Genre Chips */}
              <div className="flex flex-wrap items-center gap-1.5 my-3">
                {currentManga.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed mb-6">
                {currentManga.synopsis ||
                  "Ikuti petualangan seru dan rilis chapter terbaru dalam bahasa Indonesia dengan grafis memukau."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/manga/${currentManga.id}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Daftar Chapter</span>
                </Link>

                <Link
                  href={`/manga/${currentManga.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-gray-200 bg-[#1A1A24] hover:bg-[#222230] border border-white/10 transition-colors"
                >
                  <span>Detail Komik</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rekomendasi Manga Lainnya Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm sm:text-base font-bold text-white">
            Rekomendasi Manga &amp; Manhwa Populer
          </h4>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <MoveHorizontal className="w-3 h-3 text-emerald-400" />
            Geser mouse ↔
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Klik untuk preview spotlight
        </span>
      </div>

      {/* Manual Mouse Draggable Manga Carousel */}
      <DraggableCarousel className="pb-2">
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const cover = item.coverUrl
            ? item.coverUrl.startsWith("/api/manga")
              ? item.coverUrl
              : `/api/manga?action=image&url=${encodeURIComponent(item.coverUrl)}`
            : null;

          return (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              className={`group relative rounded-2xl overflow-hidden bg-[#13131A] border transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl w-[145px] sm:w-[180px] md:w-[200px] shrink-0 cursor-pointer ${
                isSelected
                  ? "border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400"
                  : "border-white/5 hover:border-amber-400/40"
              }`}
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                {cover ? (
                  <img
                    src={cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/40 text-emerald-400">
                    <BookOpen className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />

                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-amber-300 border border-white/10 backdrop-blur-sm">
                    {item.type || "MANGA"}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-black">
                      Aktif
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1">
                <h5 className="text-xs font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors leading-snug">
                  {item.title}
                </h5>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1 border-t border-white/5">
                  <span className="text-emerald-400 font-semibold truncate max-w-[80px]">
                    {item.status || "Ongoing"}
                  </span>
                  <Link
                    href={`/manga/${item.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Baca →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </DraggableCarousel>
    </section>
  );
}
