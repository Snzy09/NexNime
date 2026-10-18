"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import Link from "next/link";
import {
  Calendar,
  Tv,
  Sparkles,
  Video,
  Clapperboard,
  BookOpen,
  Search,
  Clock,
  Star,
  Play,
  Layers,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  UnifiedScheduleItem,
  DaySchedule,
  ScheduleCategory,
  DAYS_ORDER,
  DAY_LABELS,
} from "@/lib/services/jadwalService";

export default function JadwalPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<{
    today: "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu";
    days: DaySchedule[];
    totalShows: number;
    categoryTotals: Record<ScheduleCategory, number>;
  } | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<"all" | ScheduleCategory>("all");
  const [selectedDay, setSelectedDay] = useState<string>("sabtu");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch schedule data
  const loadSchedule = () => {
    setLoading(true);
    fetch("/api/jadwal")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.days) {
          setScheduleData(data);
          // Set initial day to today from backend
          if (data.today) {
            setSelectedDay(data.today);
          }
        }
      })
      .catch((err) => console.error("Error loading unified schedule:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  // Filter current day's items based on category and search query
  const currentDayData = useMemo(() => {
    if (!scheduleData) return null;
    return scheduleData.days.find((d) => d.day === selectedDay) || scheduleData.days[0];
  }, [scheduleData, selectedDay]);

  const filteredItems = useMemo(() => {
    if (!currentDayData) return [];
    let items = currentDayData.items;

    // 1. Category Filter
    if (selectedCategory !== "all") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.genres?.some((g) => g.toLowerCase().includes(q)) ||
          item.categoryLabel.toLowerCase().includes(q)
      );
    }

    return items;
  }, [currentDayData, selectedCategory, searchQuery]);

  // Categories config
  const categories: {
    key: "all" | ScheduleCategory;
    label: string;
    icon: any;
    color: string;
    activeBg: string;
    borderActive: string;
  }[] = [
    {
      key: "all",
      label: "Semua Kategori",
      icon: Layers,
      color: "text-amber-400",
      activeBg: "bg-amber-400 text-black font-extrabold shadow-amber-400/25",
      borderActive: "border-amber-400",
    },
    {
      key: "anime",
      label: "Anime Jepang",
      icon: Tv,
      color: "text-amber-400",
      activeBg: "bg-amber-500 text-black font-extrabold shadow-amber-500/25",
      borderActive: "border-amber-400",
    },
    {
      key: "donghua",
      label: "Donghua China",
      icon: Sparkles,
      color: "text-rose-400",
      activeBg: "bg-rose-500 text-white font-extrabold shadow-rose-500/25",
      borderActive: "border-rose-400",
    },
    {
      key: "dracin",
      label: "Dracin Pendek",
      icon: Video,
      color: "text-cyan-400",
      activeBg: "bg-cyan-500 text-black font-extrabold shadow-cyan-500/25",
      borderActive: "border-cyan-400",
    },
    {
      key: "drakor",
      label: "Drama Korea",
      icon: Clapperboard,
      color: "text-purple-400",
      activeBg: "bg-purple-500 text-white font-extrabold shadow-purple-500/25",
      borderActive: "border-purple-400",
    },
    {
      key: "manga",
      label: "Manga & Manhwa",
      icon: BookOpen,
      color: "text-emerald-400",
      activeBg: "bg-emerald-500 text-black font-extrabold shadow-emerald-500/25",
      borderActive: "border-emerald-400",
    },
  ];

  // Category badge styling helper
  const getBadgeStyle = (category: ScheduleCategory) => {
    switch (category) {
      case "anime":
        return "bg-amber-500/15 border-amber-500/30 text-amber-300";
      case "donghua":
        return "bg-rose-500/15 border-rose-500/30 text-rose-300";
      case "dracin":
        return "bg-cyan-500/15 border-cyan-500/30 text-cyan-300";
      case "drakor":
        return "bg-purple-500/15 border-purple-500/30 text-purple-300";
      case "manga":
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
      default:
        return "bg-white/10 border-white/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 sm:py-6 space-y-6">
        {/* Header Hero Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#18120B] via-[#14141F] to-[#0D0D14] border border-amber-500/20 p-5 sm:p-8 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>JADWAL TAYANG LENGKAP • 7 HARI MINGGUAN</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Jadwal Rilis Episode Baru
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Pantau siaran episode terbaru dari semua kategori favoritmu: Anime Jepang, Donghua China, Drama Pendek (Dracin), Drakor Korea, dan Manga/Manhwa terupdate setiap hari.
                </p>
              </div>

              {/* Quick Status Stats Card */}
              <div className="flex flex-wrap md:flex-col items-center gap-2.5 sm:gap-3 bg-[#111119]/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Hari Ini: {DAY_LABELS[scheduleData?.today || "sabtu"]}</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Total <strong className="text-white">{scheduleData?.totalShows || 0}+</strong> Tayangan / Minggu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              const count =
                cat.key === "all"
                  ? scheduleData?.totalShows || 0
                  : scheduleData?.categoryTotals[cat.key as ScheduleCategory] || 0;

              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    isSelected
                      ? `${cat.activeBg} shadow-lg scale-102`
                      : "bg-[#14141E] text-gray-400 hover:text-white border border-white/5 hover:border-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-current" : cat.color}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected ? "bg-black/20 text-current" : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7 Days Navigation Selector & Real-Time Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="rounded-2xl bg-[#121218] border border-white/10 p-3 sm:p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Days Pill List */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
              {DAYS_ORDER.map((dayKey) => {
                const isSelected = selectedDay === dayKey;
                const isToday = scheduleData?.today === dayKey;
                const label = DAY_LABELS[dayKey];
                const dayObj = scheduleData?.days.find((d) => d.day === dayKey);
                const dayCount = dayObj
                  ? selectedCategory === "all"
                    ? dayObj.totalCount
                    : dayObj.counts[selectedCategory as ScheduleCategory] || 0
                  : 0;

                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDay(dayKey)}
                    className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px] py-2 px-2.5 rounded-xl transition-all relative shrink-0 ${
                      isSelected
                        ? "bg-gradient-to-b from-amber-400 to-amber-500 text-black font-extrabold shadow-lg shadow-amber-400/20 scale-105"
                        : "bg-[#181824] text-gray-400 hover:text-white hover:bg-[#202030] border border-white/5"
                    }`}
                  >
                    {isToday && (
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full mb-0.5 ${
                          isSelected ? "bg-black/30 text-black" : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        Hari Ini
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold capitalize">{label}</span>
                    <span
                      className={`text-[10px] mt-0.5 font-mono ${
                        isSelected ? "text-black/80 font-bold" : "text-gray-400"
                      }`}
                    >
                      {dayCount} Judul
                    </span>
                  </button>
                );
              })}
            </div>

            {/* In-Page Quick Search */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tayangan di jadwal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A26] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Grid Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Active Day & Category Sub-header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-white capitalize">
                Jadwal Hari {DAY_LABELS[selectedDay]}
              </span>
              {scheduleData?.today === selectedDay && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Siaran Hari Ini
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Menampilkan <strong className="text-amber-400">{filteredItems.length}</strong> judul
              {selectedCategory !== "all" && ` (${categories.find((c) => c.key === selectedCategory)?.label})`}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden bg-[#13131A] border border-white/5 animate-pulse flex flex-col"
                >
                  <div className="aspect-[2/3] w-full bg-white/5" />
                  <div className="p-3 space-y-2">
                    <div className="h-3.5 bg-white/10 rounded w-3/4" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Tidak ada jadwal ditemukan</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  {searchQuery
                    ? `Tidak ada judul yang cocok dengan kata kunci "${searchQuery}" untuk hari ${DAY_LABELS[selectedDay]}.`
                    : `Belum ada tayangan ${selectedCategory !== "all" ? categories.find((c) => c.key === selectedCategory)?.label : ""} yang dijadwalkan pada hari ${DAY_LABELS[selectedDay]}.`}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-all"
                  >
                    Reset Pencarian
                  </button>
                )}
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all"
                  >
                    Lihat Semua Kategori
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.dataset.failed) return;
                        target.dataset.failed = "true";
                        if (item.category === "donghua") {
                          target.src = "https://static.anipop.xyz/poster/anime/one-piece.jpg?h=400";
                        } else if (item.category === "manga") {
                          target.src = "https://cdn.myanimelist.net/images/manga/2/253146.jpg";
                        } else if (item.category === "dracin") {
                          target.src = "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/42000027421/poster.jpg";
                        } else if (item.category === "drakor") {
                          target.src = "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMTAvMzQ0LWR5ZGJkcTRmLmpwZw--/180x200/1.jpg";
                        } else {
                          target.src = "https://static.anipop.xyz/poster/anime/one-piece.jpg?h=400";
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />

                    {/* Category Badge */}
                    <div
                      className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded uppercase border backdrop-blur-md shadow-md ${getBadgeStyle(
                        item.category
                      )}`}
                    >
                      {item.categoryLabel}
                    </div>

                    {/* Score Rating */}
                    {item.score && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{item.score}</span>
                      </div>
                    )}

                    {/* Episode Badge */}
                    {item.episode && (
                      <div className="absolute bottom-2 right-2 bg-amber-400 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-lg">
                        {item.episode}
                      </div>
                    )}

                    {/* Release Time Badge */}
                    {item.time && (
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-gray-300 text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        <span>{item.time}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                      <span className="line-clamp-1 text-gray-400">
                        {item.genres?.[0] || item.categoryLabel}
                      </span>
                      <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{item.category === "manga" ? "Baca" : "Nonton"}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
