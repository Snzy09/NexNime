"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Tv,
  ChevronDown,
  Check,
  Layers,
  Activity,
  ArrowUpDown,
  Flame,
  Clock,
  RotateCcw,
  Filter,
} from "lucide-react";
import { AnimeItem } from "@/lib/services/animeService";

interface CatalogFilterGridProps {
  items: AnimeItem[];
}

const GENRES = [
  "Semua",
  "Action",
  "Isekai",
  "Romance",
  "Fantasy",
  "Comedy",
  "Shounen",
  "Sci-Fi",
  "Slice of Life",
  "Adventure",
  "Supernatural",
  "Mecha",
  "Sports",
];

const SORT_OPTIONS = [
  { value: "updated" as const, label: "Terbaru Diupdate", icon: Clock },
  { value: "rating" as const, label: "Rating Tertinggi", icon: Star },
  { value: "popular" as const, label: "Paling Populer", icon: Flame },
];

const STATUS_OPTIONS = [
  { value: "all" as const, label: "Semua Status", color: "bg-gray-400" },
  { value: "Ongoing" as const, label: "Sedang Tayang (Ongoing)", color: "bg-emerald-400" },
  { value: "Tamat" as const, label: "Tamat (Completed)", color: "bg-indigo-400" },
];

export default function CatalogFilterGrid({ items }: CatalogFilterGridProps) {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "Ongoing" | "Tamat">("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "rating" | "popular">("updated");
  const [activeDropdown, setActiveDropdown] = useState<"genre" | "status" | "sort" | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasActiveFilter =
    selectedStatus !== "all" || selectedGenre !== "Semua" || sortBy !== "updated" || searchQuery !== "";

  const resetFilters = () => {
    setSelectedStatus("all");
    setSelectedGenre("Semua");
    setSortBy("updated");
    setSearchQuery("");
    setActiveDropdown(null);
  };

  const filteredItems = useMemo(() => {
    const list = items.filter((item) => {
      // Status match
      if (selectedStatus === "Ongoing" && item.status !== "Ongoing") return false;
      if (selectedStatus === "Tamat" && item.status !== "Tamat") return false;

      // Genre match
      if (
        selectedGenre !== "Semua" &&
        item.genres &&
        !item.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      ) {
        return false;
      }

      // Query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const genreMatch = item.genres?.some((g) => g.toLowerCase().includes(q));
        if (!titleMatch && !genreMatch) return false;
      }

      return true;
    });

    if (sortBy === "rating") {
      list.sort((a, b) => {
        const rA = parseFloat(a.rating || "0") || 0;
        const rB = parseFloat(b.rating || "0") || 0;
        return rB - rA;
      });
    } else if (sortBy === "popular") {
      list.sort((a, b) => {
        const rA = parseFloat(a.rating || "0") || 0;
        const rB = parseFloat(b.rating || "0") || 0;
        return rB - rA || a.title.localeCompare(b.title);
      });
    }

    return list;
  }, [items, selectedStatus, selectedGenre, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Tv className="w-3.5 h-3.5" />
            <span>KATALOG ANIME LENGKAP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Jelajahi Semua Judul Anime
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Koleksi ribuan anime ongoing &amp; tamat dengan subtitle bahasa Indonesia resmi.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-[#14141e]/90 border border-white/10 text-xs text-gray-300 flex items-center gap-2 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Menampilkan <strong className="text-amber-300 font-bold">{filteredItems.length}</strong> dari 2500 Judul
          </span>
        </div>
      </div>

      {/* Top Filter Buttons & Horizontal Genre Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-white/5">
        {/* Status Pills */}
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedStatus === "all"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold"
              : "bg-[#161622] text-gray-300 hover:bg-[#20202F] hover:text-white"
          }`}
        >
          Semua Anime
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("Ongoing")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedStatus === "Ongoing"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold"
              : "bg-[#161622] text-gray-300 hover:bg-[#20202F] hover:text-white"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Sedang Tayang (Ongoing)</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("Tamat")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedStatus === "Tamat"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold"
              : "bg-[#161622] text-gray-300 hover:bg-[#20202F] hover:text-white"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Tamat (Completed)</span>
        </button>

        <span className="text-gray-600 hidden sm:inline">|</span>

        {/* Scrollable Genres */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-1">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/10 font-bold"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Custom Selector Filter Bar */}
      <div
        ref={filterBarRef}
        className="relative z-30 mb-6 bg-gradient-to-b from-[#151520] to-[#0f0f17] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl shadow-black/40"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 3 Interactive Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
            {/* 1. Genre Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "genre" ? null : "genre")}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  selectedGenre !== "Semua"
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-400/15"
                    : "bg-[#181824] hover:bg-[#202030] text-gray-200 border-white/10 hover:border-white/20"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Layers
                    className={`w-4 h-4 flex-shrink-0 ${
                      selectedGenre !== "Semua" ? "text-amber-400" : "text-gray-400"
                    }`}
                  />
                  <span className="text-gray-400 text-xs hidden md:inline">Genre:</span>
                  <span className="font-semibold text-white truncate">
                    {selectedGenre === "Semua" ? "Semua Genre" : selectedGenre}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    activeDropdown === "genre" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>

              {/* Genre Floating Popover */}
              {activeDropdown === "genre" && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 p-2.5 rounded-2xl bg-[#141420]/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 py-1 mb-1.5 border-b border-white/10">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
                      <Filter className="w-3 h-3" />
                      Pilih Kategori Genre
                    </span>
                    {selectedGenre !== "Semua" && (
                      <button
                        type="button"
                        onClick={() => setSelectedGenre("Semua")}
                        className="text-[10px] text-gray-400 hover:text-white"
                      >
                        Reset Genre
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto no-scrollbar pr-0.5">
                    {GENRES.map((g) => {
                      const isSel = selectedGenre === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setSelectedGenre(g);
                            setActiveDropdown(null);
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                            isSel
                              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md shadow-amber-400/20"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate">{g === "Semua" ? "Semua Genre" : g}</span>
                          {isSel && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Status Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  selectedStatus !== "all"
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-400/15"
                    : "bg-[#181824] hover:bg-[#202030] text-gray-200 border-white/10 hover:border-white/20"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Activity
                    className={`w-4 h-4 flex-shrink-0 ${
                      selectedStatus !== "all" ? "text-amber-400" : "text-gray-400"
                    }`}
                  />
                  <span className="text-gray-400 text-xs hidden md:inline">Status:</span>
                  <span className="flex items-center gap-1.5 font-semibold text-white truncate">
                    {selectedStatus === "Ongoing" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {selectedStatus === "Tamat" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                    {selectedStatus === "all" && (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                    <span>
                      {selectedStatus === "all"
                        ? "Semua Status"
                        : selectedStatus === "Ongoing"
                        ? "Ongoing"
                        : "Tamat"}
                    </span>
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    activeDropdown === "status" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>

              {/* Status Floating Popover */}
              {activeDropdown === "status" && (
                <div className="absolute top-full left-0 mt-2 w-64 p-2.5 rounded-2xl bg-[#141420]/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400 px-2 py-1 mb-1.5 border-b border-white/10">
                    Status Penayangan
                  </div>
                  <div className="flex flex-col gap-1">
                    {STATUS_OPTIONS.map((opt) => {
                      const isSel = selectedStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedStatus(opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isSel
                              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md shadow-amber-400/20"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                            <span>{opt.label}</span>
                          </span>
                          {isSel && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sort Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  sortBy !== "updated"
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-400/15"
                    : "bg-[#181824] hover:bg-[#202030] text-gray-200 border-white/10 hover:border-white/20"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <ArrowUpDown
                    className={`w-4 h-4 flex-shrink-0 ${
                      sortBy !== "updated" ? "text-amber-400" : "text-gray-400"
                    }`}
                  />
                  <span className="text-gray-400 text-xs hidden md:inline">Urutan:</span>
                  <span className="font-semibold text-white truncate">
                    {SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "Terbaru"}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    activeDropdown === "sort" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>

              {/* Sort Floating Popover */}
              {activeDropdown === "sort" && (
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-60 p-2.5 rounded-2xl bg-[#141420]/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400 px-2 py-1 mb-1.5 border-b border-white/10">
                    Urutan Konten
                  </div>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map((opt) => {
                      const isSel = sortBy === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isSel
                              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md shadow-amber-400/20"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{opt.label}</span>
                          </span>
                          {isSel && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reset Action (only when any filter is active) */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 6-Column Responsive Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#121218] rounded-2xl border border-white/5">
          <p className="text-gray-400 text-sm">Tidak ada anime yang cocok dengan filter yang dipilih.</p>
          <button
            onClick={() => {
              setSelectedStatus("all");
              setSelectedGenre("Semua");
              setSearchQuery("");
            }}
            className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map((anime, index) => (
            <Link
              key={index}
              href={`/anime/${anime.slug}`}
              className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/60" />

                {/* Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      anime.status === "Ongoing"
                        ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                        : "bg-indigo-600/40 text-indigo-200 border border-indigo-400/30"
                    }`}
                  >
                    {anime.status || "Tamat"}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-amber-300 border border-white/10 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {anime.rating || "8.50"}
                  </span>
                </div>
              </div>

              {/* Title & Footer */}
              <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1">
                <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                  {anime.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1.5 border-t border-white/5">
                  <span className="font-semibold">{anime.type || "TV"}</span>
                  <span className="font-bold text-emerald-400">{anime.episode || "Ep 12"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
