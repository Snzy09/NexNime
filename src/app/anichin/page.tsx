"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Calendar,
  Layers,
  Search,
  Play,
  Tv,
  AlertCircle,
  Clock,
  Compass,
} from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { AnichinItem, AnichinJadwal, AnichinGenreItem } from "@/lib/services/anichinService";

export default function AnichinPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"latest" | "popular" | "schedule" | "genres">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Data states
  const [items, setItems] = useState<AnichinItem[]>([]);
  const [popularItems, setPopularItems] = useState<AnichinItem[]>([]);
  const [jadwal, setJadwal] = useState<AnichinJadwal | null>(null);
  const [genres, setGenres] = useState<AnichinGenreItem[]>([]);
  const [activeGenre, setActiveGenre] = useState<string>("");
  const [activeDay, setActiveDay] = useState<string>("Senin");

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/anichin?action=home").then((r) => r.json()),
      fetch("/api/anichin?action=popular").then((r) => r.json()),
      fetch("/api/anichin?action=genres").then((r) => r.json()),
    ])
      .then(([homeRes, popRes, genreRes]) => {
        if (homeRes.rilisan_terbaru) setItems(homeRes.rilisan_terbaru);
        else if (homeRes.items) setItems(homeRes.items);
        if (homeRes.jadwal) setJadwal(homeRes.jadwal);
        if (popRes.items) setPopularItems(popRes.items);
        if (genreRes.items) setGenres(genreRes.items);
      })
      .catch((err) => console.error("Error loading AniChin home:", err))
      .finally(() => setLoading(false));
  }, []);

  // Handle Search Query
  useEffect(() => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    fetch(`/api/anichin?action=search&q=${encodeURIComponent(searchQuery.trim())}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setItems(d.items);
      })
      .catch((e) => console.error("Error searching AniChin:", e))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  // Handle Genre selection
  const handleSelectGenre = (genreSlug: string) => {
    setActiveGenre(genreSlug);
    setLoading(true);
    fetch(`/api/anichin?action=genre&genre=${encodeURIComponent(genreSlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setItems(d.items);
      })
      .catch((e) => console.error("Error filtering genre AniChin:", e))
      .finally(() => setLoading(false));
  };

  const currentDisplayItems =
    activeTab === "popular" ? popularItems : items;

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 sm:py-6 space-y-6">
        {/* Header Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-950/40 via-[#14141F] to-[#0D0D14] border border-rose-500/20 p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  Provider Donghua Live
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  AniChin Moe Streaming
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                  Pusat streaming animasi 3D & 2D China (Donghua) terlengkap sub Indo. Dilengkapi jadwal rilis mingguan dan update real-time langsung dari AniChin.
                </p>
              </div>

              {/* Local search input */}
              <div className="w-full md:w-72 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari donghua AniChin..."
                    className="w-full h-10 bg-black/50 border border-white/10 focus:border-rose-500 rounded-xl px-3 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab("latest");
                  setActiveGenre("");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === "latest"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Rilisan Terbaru
              </button>

              <button
                onClick={() => {
                  setActiveTab("popular");
                  setActiveGenre("");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === "popular"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Terpopuler
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === "schedule"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Jadwal Rilis
              </button>

              <button
                onClick={() => setActiveTab("genres")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === "genres"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Genre & Season
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1 & 2: CATALOG LIST (LATEST OR POPULAR) */}
        {(activeTab === "latest" || activeTab === "popular") && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {activeTab === "latest" ? (
                  <>
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>{searchQuery ? `Hasil Pencarian: "${searchQuery}"` : activeGenre ? `Genre: ${activeGenre}` : "Episode Donghua Terbaru"}</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Donghua Paling Populer di AniChin</span>
                  </>
                )}
              </h2>
              <span className="text-xs text-gray-400">
                {loading ? "Memuat..." : `${currentDisplayItems.length} Judul`}
              </span>
            </div>

            {loading && <CatalogGridSkeleton count={12} />}

            {!loading && currentDisplayItems.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada donghua ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci pencarian lain atau pilih kategori lain.
                </p>
              </div>
            )}

            {!loading && currentDisplayItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {currentDisplayItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/anichin/watch?url=${encodeURIComponent(item.url || item.href)}&title=${encodeURIComponent(item.title)}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A24] to-[#101018]">
                          <Tv className="w-10 h-10 text-rose-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-rose-400/30">
                        ANICHIN
                      </div>
                      {item.episode && (
                        <div className="absolute bottom-2 right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {item.episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-rose-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-emerald-400">{item.sub || "Sub Indo"}</span>
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SCHEDULE / JADWAL RILIS */}
        {activeTab === "schedule" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Days pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu", "Minggu"].map((day) => {
                const isSelected = activeDay.toLowerCase() === day.toLowerCase();
                const count = jadwal?.by_day?.[day]?.length || 0;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-[#14141E] border border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>{day}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-black/30 text-white" : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Schedule Items for Selected Day */}
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-400" />
                <span>Jadwal Rilis Hari {activeDay}</span>
              </h3>

              {(!jadwal || !jadwal.by_day?.[activeDay] || jadwal.by_day[activeDay].length === 0) ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Tidak ada jadwal rilis untuk hari ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {jadwal.by_day[activeDay].map((entry, idx) => (
                    <Link
                      key={idx}
                      href={`/anichin/watch?url=${encodeURIComponent(entry.url || entry.href)}&title=${encodeURIComponent(entry.title)}`}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-rose-500/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                          <Play className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-rose-300 truncate">
                          {entry.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">Detail &rarr;</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: GENRES */}
        {activeTab === "genres" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <span>Pilih Genre Donghua AniChin</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSelectGenre(g.slug);
                      setActiveTab("latest");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-medium text-gray-300 hover:text-rose-300 transition-all"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
