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
  Star,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { DonghuaFilmItem } from "@/lib/services/donghuaFilmService";

export default function DonghuaFilmCatalogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DonghuaFilmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch live DonghuaFilm items
  useEffect(() => {
    setLoading(true);
    const url = submittedQuery.trim()
      ? `/api/donghuafilm?action=search&q=${encodeURIComponent(submittedQuery.trim())}&page=${page}`
      : `/api/donghuafilm?action=latest&page=${page}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setTotalItems(data.totalItems || data.items.length);
        } else {
          setItems([]);
          setTotalItems(0);
        }
      })
      .catch((err) => {
        console.error("DonghuaFilm fetch error:", err);
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
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#1C160E] to-[#0E0C08] p-6 border border-amber-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300">
                  <Tv className="w-7 h-7" />
                </div>
                <span>DonghuaFilm - Streaming Donghua HD Sub Indo</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                Nonton animasi 3D &amp; 2D China (Donghua) terlengkap sub Indo. Dilengkapi streaming multi-server (Embed &amp; Direct MP4), link download per episode, dan 100% data real live scrape.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/anime"
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka di Anime Hub</span>
              </Link>
              <span className="text-[10px] px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                DonghuaFilm API
              </span>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-2.5 sm:p-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5" /> REKOMENDASI DONGHUA:
              </span>
              {["Battle Through the Heavens", "Soul Land", "Perfect World", "Renegade Immortal", "Swallowed Star", "A Will Eternal"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setSubmittedQuery(tag);
                      setPage(1);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-300 transition-colors"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Catalog Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-400" />
              <span>
                {submittedQuery
                  ? `Hasil Pencarian: "${submittedQuery}"`
                  : "Katalog Rilis Terbaru DonghuaFilm"}
              </span>
            </h2>
            <span className="text-xs text-gray-400">
              {loading ? "Memuat live data..." : `${items.length} Judul`}
            </span>
          </div>

          {loading && <CatalogGridSkeleton count={12} />}

          {!loading && items.length === 0 && (
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak ada donghua ditemukan</h3>
              <p className="text-xs text-gray-400">
                Coba gunakan kata kunci pencarian yang lain atau reset filter.
              </p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {items.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/donghuafilm/watch?slug=${item.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                    {item.poster || item.cover ? (
                      <img
                        src={item.poster || item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1A1A24]">
                        <Tv className="w-10 h-10 text-amber-400/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-amber-400/30">
                      DONGHUAFILM
                    </div>
                    {item.rating ? (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-white">{item.rating}</span>
                      </div>
                    ) : null}
                    {item.latest_episode ? (
                      <div className="absolute bottom-2 right-2 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Ep {item.latest_episode}
                      </div>
                    ) : null}
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                      <span className="text-emerald-400">{item.status || "Ongoing"}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && items.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 border border-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Halaman {page}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < 20}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 border border-white/5"
              >
                <span>Selanjutnya</span>
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
