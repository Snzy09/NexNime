"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Clapperboard,
  Search,
  Flame,
  Play,
  Film,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Tv,
} from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { OppaDramaCard } from "@/lib/services/oppadramaService";

export default function OppaDramaCatalogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "drama" | "movie">("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<OppaDramaCard[]>([]);
  const [filteredItems, setFilteredItems] = useState<OppaDramaCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from OppaDrama API
  useEffect(() => {
    setLoading(true);
    let url = `/api/oppadrama?action=latest&page=${page}`;
    if (submittedQuery.trim()) {
      url = `/api/oppadrama?action=search&q=${encodeURIComponent(
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
        console.error("OppaDrama fetch error:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [page, submittedQuery]);

  // Client filter for drama vs movie
  useEffect(() => {
    let list = items;
    if (activeFilter === "drama") {
      list = list.filter(
        (i) => (i.type && i.type.toLowerCase().includes("drama")) || !i.type?.toLowerCase().includes("movie")
      );
    } else if (activeFilter === "movie") {
      list = list.filter(
        (i) =>
          (i.type && i.type.toLowerCase().includes("movie")) ||
          (i.episode && i.episode.toLowerCase().includes("movie")) ||
          i.slug.toLowerCase().includes("movie")
      );
    }
    setFilteredItems(list);
  }, [activeFilter, items]);

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
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-fuchsia-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-fuchsia-950/60 via-[#1C0D28] to-[#0E0716] p-6 border border-fuchsia-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400">
                    <Heart className="w-7 h-7 fill-fuchsia-500/30 animate-pulse" />
                  </div>
                  <span>OppaDrama - Streaming Drakor, Drama &amp; Series</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                  Koleksi drama Korea (Drakor), drama China, serial Asia, dan film layar lebar terbaru subtitle Indonesia.
                  100% data real langsung dari OppaDrama dengan dukungan video player responsif.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  OppaDrama Live
                </span>
                <span className="text-[10px] px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                  Drakor &amp; Movie Sub Indo
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
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-fuchsia-500 text-black shadow-lg shadow-fuchsia-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Semua Rilis</span>
              </button>

              <button
                onClick={() => setActiveFilter("drama")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeFilter === "drama"
                    ? "bg-fuchsia-500 text-black shadow-lg shadow-fuchsia-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Drama Series</span>
              </button>

              <button
                onClick={() => setActiveFilter("movie")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeFilter === "movie"
                    ? "bg-fuchsia-500 text-black shadow-lg shadow-fuchsia-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movie &amp; Film</span>
              </button>
            </div>


          </div>

          {/* Active Search Indicator */}
          {submittedQuery && (
            <div className="flex items-center justify-between text-xs text-gray-400 bg-fuchsia-950/20 border border-fuchsia-500/20 px-4 py-2 rounded-xl">
              <span>
                Hasil pencarian untuk:{" "}
                <strong className="text-fuchsia-300">&quot;{submittedQuery}&quot;</strong> ({items.length} judul)
              </span>
              <button
                onClick={handleClearSearch}
                className="text-fuchsia-400 hover:underline"
              >
                Kembali ke rilis terbaru
              </button>
            </div>
          )}
        </div>

        {/* Content Grid with Skeleton Loader */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <CatalogGridSkeleton count={18} />
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111118] border border-white/5 my-8">
              <Clapperboard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Tidak ada judul yang ditemukan</h3>
              <p className="text-xs text-gray-400 mt-1">
                Silakan coba kata kunci lain atau ubah filter kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredItems.map((item, idx) => {
                const watchHref = `/oppadrama/watch?url=${encodeURIComponent(
                  item.url
                )}&title=${encodeURIComponent(item.title)}`;

                return (
                  <Link
                    key={`${item.url}-${idx}`}
                    href={watchHref}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#12121A] border border-white/5 hover:border-fuchsia-500/40 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-300"
                  >
                    {/* Poster */}
                    <div className="aspect-[2/3] relative overflow-hidden bg-black/40">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-fuchsia-950/20 text-fuchsia-300 text-xs text-center p-3">
                          {item.title}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      {/* Episode badge */}
                      {item.episode && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-fuchsia-500 text-black font-extrabold text-[10px] shadow-md">
                          {item.episode}
                        </div>
                      )}

                      {/* Type badge */}
                      {item.type && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-fuchsia-300 border border-fuchsia-500/30 font-semibold text-[10px]">
                          {item.type}
                        </div>
                      )}

                      {/* Hover play icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-11 h-11 rounded-full bg-fuchsia-500 text-black flex items-center justify-center shadow-lg shadow-fuchsia-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-fuchsia-300 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-fuchsia-400/90 font-medium mt-2 flex items-center gap-1">
                        <span>Nonton Streaming</span>
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

              <span className="px-4 py-2 rounded-xl bg-[#12121A] border border-white/10 text-xs font-bold text-fuchsia-400">
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
