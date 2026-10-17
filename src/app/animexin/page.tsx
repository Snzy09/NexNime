"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Tv, Search, Flame, Play, Star, Sparkles, Layers } from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { AnimeXinItem } from "@/lib/services/animexinService";

const GENRES = ["Semua", "Cultivation", "Action", "Fantasy", "Martial Arts", "Adventure", "ONA"];

export default function AnimeXinPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("Semua");
  const [allDonghua, setAllDonghua] = useState<AnimeXinItem[]>([]);
  const [filteredDonghua, setFilteredDonghua] = useState<AnimeXinItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from AnimeXin
  useEffect(() => {
    setLoading(true);
    fetch("/api/animexin?action=latest")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setAllDonghua(data.items);
          setFilteredDonghua(data.items);
        } else {
          setAllDonghua([]);
          setFilteredDonghua([]);
        }
      })
      .catch((err) => {
        console.error("AnimeXin fetch error:", err);
        setAllDonghua([]);
        setFilteredDonghua([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter based on search & genre
  useEffect(() => {
    let result = allDonghua;

    if (activeGenre !== "Semua") {
      const g = activeGenre.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(g) ||
          (item.type && item.type.toLowerCase().includes(g))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => item.title.toLowerCase().includes(q));
    }

    setFilteredDonghua(result);
  }, [activeGenre, searchQuery, allDonghua]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Filter Pills */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-3 sm:p-4 shadow-xl">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Genre:
              </span>
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    activeGenre === g
                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Donghua Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-cyan-400" />
              <span>
                {searchQuery
                  ? `Hasil Pencarian: "${searchQuery}"`
                  : activeGenre === "Semua"
                  ? "Rilisan Terbaru Donghua AnimeXin"
                  : `Kategori: ${activeGenre}`}
              </span>
              <span className="text-xs font-normal text-gray-400">
                ({filteredDonghua.length} episode)
              </span>
            </h2>
          </div>

          {loading ? (
            <CatalogGridSkeleton count={12} />
          ) : filteredDonghua.length === 0 ? (
            <div className="text-center py-16 bg-[#121218] rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">
                Tidak ada Donghua yang cocok dengan filter atau kata kunci &quot;{searchQuery || activeGenre}&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveGenre("Semua");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredDonghua.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/animexin/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                  className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-cyan-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/40"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                    {item.poster ? (
                      <img
                        src={
                          item.poster.startsWith("http")
                            ? `/api/animexin?action=image&url=${encodeURIComponent(item.poster)}`
                            : item.poster
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cyan-950/30 text-cyan-300 text-xs text-center p-3">
                        {item.title}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl shadow-cyan-500/50">
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-black shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.episode || "Donghua"}
                      </span>

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-sm border border-white/10 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        {item.rating || "8.8"}
                      </span>
                    </div>

                    {/* Bottom Title Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        {item.type || "AnimeXin ONA"}
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
