"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Clock, Star } from "lucide-react";
import { ScheduleDay } from "@/lib/services/animeService";

interface ScheduleSectionProps {
  schedule: ScheduleDay[];
}

export default function ScheduleSection({ schedule }: ScheduleSectionProps) {
  const todayKey = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"][new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(() => {
    const match = schedule.find((s) => s.day === todayKey);
    return match ? match.day : schedule[0]?.day || "minggu";
  });

  const currentDayData = schedule.find((s) => s.day === selectedDay) || schedule[0];

  if (!schedule || schedule.length === 0) return null;

  return (
    <section id="jadwal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Container */}
      <div className="rounded-2xl bg-[#121218] border border-white/5 p-4 sm:p-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Jadwal Rilis Anime</h2>
              <p className="text-xs text-gray-400">
                Tayang setiap {currentDayData?.label || "Hari Ini"} • Update otomatis 7 hari
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-[#1A1A24] p-1 rounded-lg border border-white/5 text-xs font-semibold shrink-0">
              {schedule.map((s) => {
                const isToday = s.day === todayKey;
                const isSelected = selectedDay === s.day;
                return (
                  <button
                    key={s.day}
                    onClick={() => setSelectedDay(s.day)}
                    className={`px-3 py-1 rounded-md transition-all whitespace-nowrap relative ${
                      isSelected
                        ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {s.label.replace("Hari ", "")}
                    {isToday && (
                      <span
                        className={`ml-1 text-[9px] px-1 py-0.2 rounded font-black uppercase ${
                          isSelected ? "bg-black/30 text-black" : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        Hari Ini
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Link
              href="/anime#jadwal"
              className="hidden lg:flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-amber-400 transition-colors ml-2 shrink-0"
            >
              <span>Semua</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Featured Live Schedule Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-amber-950/60 via-[#151520] to-[#121218] border border-amber-500/20 p-4 sm:p-5 mb-5 flex items-center justify-between">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE RELEASE SCHEDULE • {currentDayData?.label.toUpperCase()}</span>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-white">
              Episode Anime Baru Tayang {currentDayData?.label}
            </h3>
            <p className="text-xs text-gray-300 mt-1 line-clamp-1">
              Streaming subtitle Indonesia kualitas Full HD 1080p tercepat dan bebas iklan judul.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 text-amber-400/80 pr-4">
            <Clock className="w-12 h-12 opacity-40" />
          </div>
        </div>

        {/* Horizontal Mini Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {currentDayData?.items.map((item, idx) => (
            <Link
              key={idx}
              href={`/anime/${item.slug}`}
              className="flex items-center gap-3 p-2 rounded-xl bg-[#181822] hover:bg-[#20202E] border border-white/5 hover:border-amber-400/30 transition-all group"
            >
              <div className="w-11 h-14 rounded-lg overflow-hidden bg-black/60 shrink-0">
                <img
                  src={item.poster || "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=300"}
                  alt={item.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=300";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                  {item.episode}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <span>TV</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-300">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    {item.score || "8.40"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
