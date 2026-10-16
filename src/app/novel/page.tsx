"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Flame,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookMarked,
  Layers,
} from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { NovelCard } from "@/lib/services/novelService";

export default function NovelCatalogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NovelCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from BacaLN API
  useEffect(() => {
    setLoading(true);
    let url = `/api/novel?action=latest&page=${page}`;
    if (submittedQuery.trim()) {
      url = `/api/novel?action=search&q=${encodeURIComponent(
        submittedQuery.trim()
      )}&page=${page}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      })
      .catch((err) => {
        console.error("Novel fetch error:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [page, submittedQuery]);

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
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0B1E19] to-[#0A1412] p-6 border border-emerald-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span>BacaLN - Light Novel &amp; Web Novel Hub</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                  Baca ribuan light novel, web novel Korea, China, dan Jepang terjemahan bahasa Indonesia terlengkap.
                  Dilengkapi fitur auto-scroll (1x, 2x, 3x speed), ukuran font kustom, tema baca malam/sepia, dan bebas dummy data.
                </p>
              </div>

              {/* Navigation toggle to Manga */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/manga"
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Beralih ke Manga (MangaDex)</span>
                </Link>

                <span className="text-[10px] px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  BacaLN Scraper
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111118] p-3 rounded-2xl border border-white/5">
            {/* Quick Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={handleClearSearch}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  !submittedQuery
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Rilis &amp; Update Terbaru</span>
              </button>
            </div>

            {/* Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center min-w-[260px] sm:min-w-[320px]"
            >
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Cari novel (Solo Leveling, Slime, Overlord)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181824] border border-white/10 rounded-xl pl-10 pr-20 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
                className="absolute right-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors"
              >
                Cari
              </button>
            </form>
          </div>

          {submittedQuery && (
            <div className="flex items-center justify-between text-xs text-gray-400 bg-emerald-950/20 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <span>
                Hasil pencarian untuk:{" "}
                <strong className="text-emerald-300">&quot;{submittedQuery}&quot;</strong> ({items.length} novel)
              </span>
              <button
                onClick={handleClearSearch}
                className="text-emerald-400 hover:underline"
              >
                Kembali ke update terbaru
              </button>
            </div>
          )}
        </div>

        {/* Content Grid with Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <CatalogGridSkeleton count={12} />
          ) : items.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111118] border border-white/5 my-8">
              <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Tidak ada novel yang ditemukan</h3>
              <p className="text-xs text-gray-400 mt-1">
                Silakan coba kata kunci lain atau periksa kembali ejaan judul.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {items.map((item, idx) => {
                const readHref = `/novel/read?url=${encodeURIComponent(
                  item.url
                )}&title=${encodeURIComponent(item.title)}`;

                return (
                  <Link
                    key={`${item.url}-${idx}`}
                    href={readHref}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#12121A] border border-white/5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                  >
                    {/* Cover */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-950/20 text-emerald-300 text-xs text-center p-3">
                          {item.title}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      {/* Chapter badge */}
                      {item.latestChapter && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-black font-extrabold text-[10px] shadow-md max-w-[85%] truncate">
                          {item.latestChapter}
                        </div>
                      )}

                      {/* Read book icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-11 h-11 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                          <BookOpen className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Date / Update time */}
                      {item.updated && (
                        <div className="absolute bottom-2 left-2 right-2 text-[10px] text-gray-300 font-medium">
                          <span className="flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm w-fit">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {item.updated}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-emerald-300 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-emerald-400/90 font-medium mt-2 flex items-center gap-1">
                        <span>Baca Novel</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
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

              <span className="px-4 py-2 rounded-xl bg-[#12121A] border border-white/10 text-xs font-bold text-emerald-400">
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
