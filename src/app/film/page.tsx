"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Film, Clapperboard, Search, Star, Play, AlertCircle, Tv, X } from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { VidboxItem } from "@/lib/services/vidboxService";
import { OppaDramaCard } from "@/lib/services/oppadramaService";

type CategoryTab = "all" | "movies" | "series" | "asia";

export default function FilmHubPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  // VidBox Movies State
  const [vidboxMovies, setVidboxMovies] = useState<VidboxItem[]>([]);
  const [loadingVidboxMovies, setLoadingVidboxMovies] = useState(true);

  // VidBox Series State
  const [vidboxSeries, setVidboxSeries] = useState<VidboxItem[]>([]);
  const [loadingVidboxSeries, setLoadingVidboxSeries] = useState(true);

  // OppaDrama Movies State
  const [oppaMovies, setOppaMovies] = useState<OppaDramaCard[]>([]);
  const [loadingOppaMovies, setLoadingOppaMovies] = useState(true);

  // Fetch VidBox Movies
  useEffect(() => {
    setLoadingVidboxMovies(true);
    const url = searchQuery.trim()
      ? `/api/vidbox?action=search&q=${encodeURIComponent(searchQuery.trim())}&type=movie`
      : `/api/vidbox?action=catalog&category=movies`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setVidboxMovies(data.items);
        } else {
          setVidboxMovies([]);
        }
      })
      .catch(() => {
        setVidboxMovies([]);
      })
      .finally(() => setLoadingVidboxMovies(false));
  }, [searchQuery]);

  // Fetch VidBox Series
  useEffect(() => {
    setLoadingVidboxSeries(true);
    const url = searchQuery.trim()
      ? `/api/vidbox?action=search&q=${encodeURIComponent(searchQuery.trim())}&type=tv`
      : `/api/vidbox?action=catalog&category=series`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setVidboxSeries(data.items);
        } else {
          setVidboxSeries([]);
        }
      })
      .catch(() => {
        setVidboxSeries([]);
      })
      .finally(() => setLoadingVidboxSeries(false));
  }, [searchQuery]);

  // Fetch OppaDrama Movies Data
  useEffect(() => {
    setLoadingOppaMovies(true);
    const url = searchQuery.trim()
      ? `/api/oppadrama?action=search&q=${encodeURIComponent(searchQuery.trim())}`
      : `/api/oppadrama?action=latest&page=1`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          const moviesOnly = data.items.filter(
            (i: OppaDramaCard) =>
              i.type?.toLowerCase().includes("movie") ||
              i.episode?.toLowerCase().includes("movie") ||
              i.slug.toLowerCase().includes("movie")
          );
          setOppaMovies(moviesOnly.length > 0 ? moviesOnly : data.items);
        } else {
          setOppaMovies([]);
        }
      })
      .catch(() => {
        setOppaMovies([]);
      })
      .finally(() => setLoadingOppaMovies(false));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">
        {/* Top Control Bar: Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeTab === "all"
                  ? "bg-white text-black shadow-md font-bold"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("movies")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeTab === "movies"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 font-bold"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Film Bioskop
            </button>
            <button
              onClick={() => setActiveTab("series")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeTab === "series"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Serial TV
            </button>
            <button
              onClick={() => setActiveTab("asia")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeTab === "asia"
                  ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30 font-bold"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Film Asia
            </button>
          </div>

          {/* Inline Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul film atau series..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: MOVIES */}
        {(activeTab === "all" || activeTab === "movies") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-red-500" />
                <span>{searchQuery ? `Hasil Pencarian Film: "${searchQuery}"` : "Film Bioskop"}</span>
              </h2>
              <span className="text-xs text-gray-500">{vidboxMovies.length} judul</span>
            </div>

            {loadingVidboxMovies ? (
              <CatalogGridSkeleton count={12} />
            ) : vidboxMovies.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">Tidak ada film ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {vidboxMovies.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/film/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                    className="group relative rounded-xl overflow-hidden bg-[#101015] border border-white/5 hover:border-red-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {item.poster ? (
                        <ImageWithSkeleton
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#15151E]">
                          <Film className="w-8 h-8 text-red-500/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Subtle Rating Badge */}
                      {item.rating && (
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-white/10">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {item.rating}
                        </div>
                      )}

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/50 scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col justify-between flex-1 space-y-1">
                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        <span>{item.year || "Movie"}</span>
                        <span className="text-gray-400 uppercase font-mono text-[9px]">{item.type || "HD"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: TV SERIES */}
        {(activeTab === "all" || activeTab === "series") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-rose-500" />
                <span>{searchQuery ? `Hasil Pencarian Serial: "${searchQuery}"` : "Serial TV"}</span>
              </h2>
              <span className="text-xs text-gray-500">{vidboxSeries.length} judul</span>
            </div>

            {loadingVidboxSeries ? (
              <CatalogGridSkeleton count={12} />
            ) : vidboxSeries.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">Tidak ada serial TV ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {vidboxSeries.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/film/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                    className="group relative rounded-xl overflow-hidden bg-[#101015] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {item.poster ? (
                        <ImageWithSkeleton
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#15151E]">
                          <Tv className="w-8 h-8 text-rose-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Rating Badge */}
                      {item.rating && (
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-white/10">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {item.rating}
                        </div>
                      )}

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col justify-between flex-1 space-y-1">
                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-rose-400 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        <span>{item.year || "Series"}</span>
                        <span className="text-gray-400 uppercase font-mono text-[9px]">{item.type || "TV"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: ASIAN MOVIES */}
        {(activeTab === "all" || activeTab === "asia") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-fuchsia-400" />
                <span>{searchQuery ? `Hasil Pencarian Film Asia: "${searchQuery}"` : "Film Asia & Korea"}</span>
              </h2>
              <span className="text-xs text-gray-500">{oppaMovies.length} judul</span>
            </div>

            {loadingOppaMovies ? (
              <CatalogGridSkeleton count={12} />
            ) : oppaMovies.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">Tidak ada film Asia ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {oppaMovies.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/oppadrama/watch?slug=${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#101015] border border-white/5 hover:border-fuchsia-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {item.thumbnail ? (
                        <ImageWithSkeleton
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#15151E]">
                          <Film className="w-8 h-8 text-fuchsia-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Status / Rating Badge */}
                      {item.status && (
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-white/10">
                          {item.status}
                        </div>
                      )}

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-fuchsia-900/50 scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col justify-between flex-1 space-y-1">
                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-fuchsia-300 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        <span>Film Asia</span>
                        <span className="text-gray-400 uppercase font-mono text-[9px]">Movie</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
