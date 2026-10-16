"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Tv,
  Search,
  Flame,
  Play,
  Film,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { AnimeSailCard } from "@/lib/services/animesailService";

export default function AnimeSailCatalogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState<"latest" | "movie" | "donghua">("latest");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AnimeSailCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch real items from AnimeSail API
  useEffect(() => {
    setLoading(true);
    let url = `/api/animesail?action=${category}&page=${page}`;
    if (submittedQuery.trim()) {
      url = `/api/animesail?action=search&q=${encodeURIComponent(
        submittedQuery.trim()
      )}&page=${page}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setTotalCount(data.totalItems || data.items.length);
        } else {
          setItems([]);
          setTotalCount(0);
        }
      })
      .catch((err) => {
        console.error("AnimeSail fetch error:", err);
        setItems([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [category, page, submittedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmittedQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-sky-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-sky-950/60 via-[#0B1528] to-[#0A0D18] p-6 border border-sky-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400">
                    <Compass className="w-7 h-7 animate-pulse" />
                  </div>
                  <span>AnimeSail - Streaming Anime Sub Indo</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                  Nonton streaming anime subtitle Indonesia terlengkap dan terupdate.
                  Didukung multi-server video (Abyss, Dodo Player, dll) dengan kualitas HD dan bebas dummy data.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AnimeSail Live
                </span>
                <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Multi Server HD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111118] p-3 rounded-2xl border border-white/5">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setCategory("latest");
                  setSubmittedQuery("");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  category === "latest" && !submittedQuery
                    ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Rilis Terbaru</span>
              </button>

              <button
                onClick={() => {
                  setCategory("movie");
                  setSubmittedQuery("");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  category === "movie" && !submittedQuery
                    ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movie Terbaru</span>
              </button>

              <button
                onClick={() => {
                  setCategory("donghua");
                  setSubmittedQuery("");
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  category === "donghua" && !submittedQuery
                    ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Donghua Sail</span>
              </button>
            </div>

            {/* Direct Scraper Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center min-w-[260px] sm:min-w-[320px]"
            >
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Cari anime di AnimeSail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181824] border border-white/10 rounded-xl pl-10 pr-20 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {submittedQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-14 text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold rounded-lg transition-colors"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Active Search / Category Indicator */}
          {submittedQuery && (
            <div className="flex items-center justify-between text-xs text-gray-400 bg-sky-950/20 border border-sky-500/20 px-4 py-2 rounded-xl">
              <span>
                Hasil pencarian untuk:{" "}
                <strong className="text-sky-300">&quot;{submittedQuery}&quot;</strong> ({totalCount} judul)
              </span>
              <button
                onClick={handleClearSearch}
                className="text-sky-400 hover:underline"
              >
                Kembali ke katalog rilis terbaru
              </button>
            </div>
          )}
        </div>

        {/* Content Grid with Skeleton Loader */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <CatalogGridSkeleton count={18} />
          ) : items.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111118] border border-white/5 my-8">
              <Compass className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Tidak ada anime yang ditemukan</h3>
              <p className="text-xs text-gray-400 mt-1">
                Silakan coba kata kunci lain atau pilih kategori rilis terbaru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {items.map((item, idx) => {
                const watchHref = `/animesail/watch?url=${encodeURIComponent(
                  item.url
                )}&title=${encodeURIComponent(item.title)}`;

                return (
                  <Link
                    key={`${item.url}-${idx}`}
                    href={watchHref}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#12121A] border border-white/5 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300"
                  >
                    {/* Poster */}
                    <div className="aspect-[2/3] relative overflow-hidden bg-black/40">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      {/* Episode badge */}
                      {item.episode && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-sky-500 text-black font-extrabold text-[10px] shadow-md">
                          EP {item.episode}
                        </div>
                      )}

                      {/* Type badge */}
                      {item.type && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-sky-300 border border-sky-500/30 font-semibold text-[10px]">
                          {item.type}
                        </div>
                      )}

                      {/* Hover play icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-11 h-11 rounded-full bg-sky-500 text-black flex items-center justify-center shadow-lg shadow-sky-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Year or Time badge at bottom */}
                      {(item.latestTime || item.year) && (
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300 font-medium">
                          {item.latestTime && (
                            <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                              <Clock className="w-3 h-3 text-sky-400" />
                              {item.latestTime}
                            </span>
                          )}
                          {item.year && (
                            <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm text-gray-400 ml-auto">
                              {item.year}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-sky-300 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-sky-400/80 font-medium mt-2 flex items-center gap-1">
                        <span>Tonton Episode</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && items.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-4 py-2 rounded-xl bg-[#12121A] border border-white/10 text-xs font-bold text-sky-400">
                Halaman {page}
              </span>

              <button
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
