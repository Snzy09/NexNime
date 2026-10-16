"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Video, Search, Flame, Play, Sparkles, Layers, RefreshCw } from "lucide-react";
import DracinReelsSkeleton from "@/components/skeletons/DracinReelsSkeleton";
import { NetShortItem } from "@/lib/services/netshortService";

const CATEGORIES = [
  "Semua",
  "Mafia",
  "Lycan",
  "Boss",
  "Stepmom",
  "Monster",
  "Lawyer",
  "Heiress",
  "Revenge",
];

export default function NetShortPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [allDramas, setAllDramas] = useState<NetShortItem[]>([]);
  const [filteredDramas, setFilteredDramas] = useState<NetShortItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real list from NetShort scraper API
  useEffect(() => {
    setLoading(true);
    fetch("/api/netshort?action=list")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setAllDramas(data.items);
          setFilteredDramas(data.items);
        } else {
          setAllDramas([]);
          setFilteredDramas([]);
        }
      })
      .catch((err) => {
        console.error("NetShort fetch error:", err);
        setAllDramas([]);
        setFilteredDramas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter based on active category & search query
  useEffect(() => {
    let result = allDramas;

    if (activeCategory !== "Semua") {
      const cat = activeCategory.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(cat) ||
          d.slug.toLowerCase().includes(cat)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.slug.toLowerCase().includes(q)
      );
    }

    setFilteredDramas(result);
  }, [activeCategory, searchQuery, allDramas]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#16101D] to-[#0D0D14] p-6 border border-purple-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-2">
                  <Video className="w-8 h-8 text-purple-400" />
                  <span>NetShort - Streaming Drama Vertikal (9:16)</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2">
                  Nonton puluhan serial drama pendek vertikal resolusi tinggi dari NetShort. Data 100% real hasil scrape &amp; direct MP4 video playback tanpa dummy.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                  NetShort 9:16
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
                  Direct MP4 Stream
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Big Search Input */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-3 sm:p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari judul drama NetShort (contoh: Mafia, Lycan, Stepmom, Monster, Lawyer)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181824] text-xs sm:text-sm text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 sm:py-3 border border-white/5 focus:border-purple-500/40 focus:outline-none"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-white/5 mt-3">
              <span className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Genre:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    activeCategory === cat
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Catalog Cards (9:16 Aspect Ratio) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-400" />
              <span>
                {searchQuery
                  ? `Hasil Pencarian: "${searchQuery}"`
                  : activeCategory === "Semua"
                  ? "Koleksi Drama NetShort Populer"
                  : `Kategori: ${activeCategory}`}
              </span>
              <span className="text-xs font-normal text-gray-400">
                ({filteredDramas.length} judul)
              </span>
            </h2>
          </div>

          {loading ? (
            <DracinReelsSkeleton />
          ) : filteredDramas.length === 0 ? (
            <div className="text-center py-16 bg-[#121218] rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">
                Tidak ada drama NetShort yang cocok dengan filter atau kata kunci &quot;{searchQuery || activeCategory}&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("Semua");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredDramas.map((drama) => (
                <Link
                  key={drama.slug}
                  href={`/netshort/watch?slug=${drama.slug}&title=${encodeURIComponent(drama.title)}`}
                  className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-purple-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/40"
                >
                  {/* Standard Aspect Ratio */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                    {drama.cover ? (
                      <img
                        src={drama.cover}
                        alt={drama.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950/30 text-purple-300 text-xs text-center p-3">
                        {drama.title}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/50">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        NetShort
                      </span>

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-purple-300 backdrop-blur-sm border border-white/10">
                        9:16 Reel
                      </span>
                    </div>

                    {/* Bottom Title Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                        {drama.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        Klik untuk tonton episode
                      </p>
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
