"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Star, Tv, ChevronDown } from "lucide-react";
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

export default function CatalogFilterGrid({ items }: CatalogFilterGridProps) {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "Ongoing" | "Tamat">("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "rating" | "popular">("updated");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, selectedStatus, selectedGenre, searchQuery]);

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

        <div className="px-3 py-1.5 rounded-full bg-[#161622] border border-white/5 text-xs text-gray-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Menampilkan <strong className="text-white">{filteredItems.length}</strong> dari 2500 Judul</span>
        </div>
      </div>

      {/* Top Filter Buttons & Horizontal Genre Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-white/5">
        {/* Status Pills */}
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedStatus === "all"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
              : "bg-[#161622] text-gray-300 hover:bg-[#20202F]"
          }`}
        >
          Semua Anime
        </button>
        <button
          onClick={() => setSelectedStatus("Ongoing")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedStatus === "Ongoing"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
              : "bg-[#161622] text-gray-300 hover:bg-[#20202F]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Sedang Tayang (Ongoing)</span>
        </button>
        <button
          onClick={() => setSelectedStatus("Tamat")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedStatus === "Tamat"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
              : "bg-[#161622] text-gray-300 hover:bg-[#20202F]"
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
              onClick={() => setSelectedGenre(g)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Second Filter Bar: Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-[#121218] p-3 rounded-xl border border-white/5">
        {/* Genre Dropdown */}
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full bg-[#181822] text-xs sm:text-sm text-gray-300 rounded-lg px-3 py-2 border border-white/5 focus:border-amber-400/40 focus:outline-none appearance-none cursor-pointer"
          >
            {GENRES.map((g) => (
              <option key={g} value={g} className="bg-[#181822] text-white">
                {g === "Semua" ? "Semua Genre" : g}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full bg-[#181822] text-xs sm:text-sm text-gray-300 rounded-lg px-3 py-2 border border-white/5 focus:border-amber-400/40 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all" className="bg-[#181822] text-white">Semua Status</option>
            <option value="Ongoing" className="bg-[#181822] text-white">Ongoing</option>
            <option value="Tamat" className="bg-[#181822] text-white">Tamat</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-[#181822] text-xs sm:text-sm text-gray-300 rounded-lg px-3 py-2 border border-white/5 focus:border-amber-400/40 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="updated" className="bg-[#181822] text-white">Terbaru Diupdate</option>
            <option value="rating" className="bg-[#181822] text-white">Rating Tertinggi</option>
            <option value="popular" className="bg-[#181822] text-white">Paling Populer</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
