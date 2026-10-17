"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Sparkles, ChevronRight, Users, Play } from "lucide-react";
import { FreeReelsItem } from "@/lib/services/dramoxService";

interface DracinScheduleSectionProps {
  initialItems?: FreeReelsItem[];
}

function formatReleaseDate(timestamp?: number | string) {
  if (!timestamp) return "Segera Tayang";
  try {
    const num = Number(timestamp);
    const date = new Date(num > 10000000000 ? num : num * 1000);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Segera Tayang";
  }
}

export default function DracinScheduleSection({ initialItems }: DracinScheduleSectionProps) {
  const [items, setItems] = useState<FreeReelsItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);

  useEffect(() => {
    if (!initialItems || initialItems.length === 0) {
      setLoading(true);
      fetch("/api/dracin?provider=freereels&action=soon&limit=10")
        .then((res) => res.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            setItems(data.items);
          }
        })
        .catch((err) => console.error("Dracin schedule fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [initialItems]);

  if (!loading && items.length === 0) return null;

  return (
    <section id="jadwal-dracin" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-20">
      {/* Container matching ScheduleSection design */}
      <div className="rounded-2xl bg-[#121218] border border-white/5 p-4 sm:p-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Jadwal Rilis Drama Pendek</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Segera Rilis
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Jadwal penayangan perdana serial drama pendek vertikal 9:16 FreeReels
              </p>
            </div>
          </div>

          <Link
            href="/dracin#freereels"
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-rose-400 transition-colors shrink-0"
          >
            <span>Katalog Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Release Banner matching Anime Schedule */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-rose-950/60 via-[#18111B] to-[#121218] border border-rose-500/20 p-4 sm:p-5 mb-5 flex items-center justify-between">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>UPCOMING SCHEDULE • TAYANG PERDANA</span>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-white">
              Serial Mini Drama Baru Segera Tayang
            </h3>
            <p className="text-xs text-gray-300 mt-1 line-clamp-1">
              Daftar drama pendek vertikal resmi dengan audio jernih dan multi-subtitle HLS.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 text-rose-400/80 pr-4">
            <Clock className="w-12 h-12 opacity-40" />
          </div>
        </div>

        {/* Horizontal Mini Cards Grid matching ScheduleSection */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map((item, idx) => {
              const itemId = item.id || (item as any).key || `dr-${idx}`;
              const itemTitle = item.title || (item as any).name || "Short Drama";
              const releaseDate = formatReleaseDate(item.listing_time);

              return (
                <Link
                  key={idx}
                  href={`/dracin/watch?provider=freereels&id=${encodeURIComponent(itemId)}&title=${encodeURIComponent(itemTitle)}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#181822] hover:bg-[#201824] border border-white/5 hover:border-rose-400/30 transition-all group"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-black/60 shrink-0 relative">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-rose-300 p-1 text-center bg-rose-950/30">
                        Dracin
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors"
                      title={itemTitle}
                    >
                      {itemTitle}
                    </h4>
                    <p className="text-[11px] font-semibold text-rose-400 mt-0.5 truncate flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{releaseDate}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                      <span className="font-semibold text-gray-300">
                        {item.episode_count ? `${item.episode_count} Ep` : "Full"}
                      </span>
                      {item.booking_count ? (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-300">
                            <Users className="w-2.5 h-2.5" />
                            {item.booking_count > 1000
                              ? `${(item.booking_count / 1000).toFixed(1)}k`
                              : item.booking_count}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
